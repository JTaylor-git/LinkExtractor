import { storage } from "../storage";
import { Project, ScrapeJob } from "@shared/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ScrapeResult {
  url: string;
  title: string;
  content: string;
  extractedData: any;
}

export async function scrapeWebsite(project: Project, jobId: number): Promise<void> {
  try {
    console.log(`Starting scrape job ${jobId} for project ${project.name}`);
    
    // Update job status to running
    await storage.updateScrapeJob(jobId, { status: "running" });

    const results: ScrapeResult[] = [];
    const urlsToScrape = await discoverUrls(project.startUrl, project.depth || 2);
    
    // Update total URLs
    await storage.updateScrapeJob(jobId, { totalUrls: urlsToScrape.length });

    let processedCount = 0;
    let failedCount = 0;

    for (const url of urlsToScrape) {
      try {
        const result = await scrapeUrl(url);
        results.push(result);
        
        // Store scraped data
        await storage.createScrapedData({
          jobId,
          url: result.url,
          title: result.title,
          content: result.content,
          extractedData: result.extractedData
        });
        
        processedCount++;
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
        failedCount++;
      }

      // Update progress
      await storage.updateScrapeJob(jobId, {
        processedUrls: processedCount,
        failedUrls: failedCount
      });
    }

    // Generate export files
    const resultPath = await generateExportFiles(results, project, jobId);
    
    // Update job as completed
    await storage.updateScrapeJob(jobId, {
      status: "completed",
      resultPath
    });

    // Update project status
    await storage.updateProject(project.id, { status: "completed" });

    console.log(`Scrape job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`Scrape job ${jobId} failed:`, error);
    
    await storage.updateScrapeJob(jobId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error"
    });

    await storage.updateProject(project.id, { status: "failed" });
  }
}

async function discoverUrls(startUrl: string, depth: number): Promise<string[]> {
  const urls = new Set<string>();
  const queue = [{ url: startUrl, depth: 0 }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { url, depth: currentDepth } = queue.shift()!;
    
    if (visited.has(url) || currentDepth > depth) continue;
    
    visited.add(url);
    urls.add(url);

    if (currentDepth < depth) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const linkRegex = /href="([^"]+)"/g;
        let match;
        
        while ((match = linkRegex.exec(html)) !== null) {
          const linkUrl = match[1];
          if (linkUrl.startsWith('http') || linkUrl.startsWith('/')) {
            const absoluteUrl = linkUrl.startsWith('http') 
              ? linkUrl 
              : new URL(linkUrl, startUrl).href;
            
            // Only follow links within the same domain
            if (new URL(absoluteUrl).hostname === new URL(startUrl).hostname) {
              queue.push({ url: absoluteUrl, depth: currentDepth + 1 });
            }
          }
        }
      } catch (error) {
        console.error(`Failed to discover URLs from ${url}:`, error);
      }
    }
  }

  return Array.from(urls);
}

async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const response = await fetch(url);
  const html = await response.text();
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "Untitled";
  
  // Extract text content (simplified)
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract structured data (simplified)
  const extractedData = {
    meta: extractMetaTags(html),
    images: extractImages(html),
    links: extractLinks(html)
  };

  return {
    url,
    title,
    content: textContent.substring(0, 5000), // Limit content length
    extractedData
  };
}

function extractMetaTags(html: string): any {
  const metaTags: any = {};
  const metaRegex = /<meta[^>]+name="([^"]+)"[^>]+content="([^"]+)"/gi;
  let match;
  
  while ((match = metaRegex.exec(html)) !== null) {
    metaTags[match[1]] = match[2];
  }
  
  return metaTags;
}

function extractImages(html: string): string[] {
  const images: string[] = [];
  const imgRegex = /<img[^>]+src="([^"]+)"/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    images.push(match[1]);
  }
  
  return images;
}

function extractLinks(html: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a[^>]+href="([^"]+)"/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    links.push(match[1]);
  }
  
  return links;
}

async function generateExportFiles(results: ScrapeResult[], project: Project, jobId: number): Promise<string> {
  const outputDir = path.join(__dirname, "..", "exports");
  const jobDir = path.join(outputDir, `job-${jobId}`);
  
  // Create directories
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(jobDir)) {
    fs.mkdirSync(jobDir, { recursive: true });
  }

  const formats = project.exportFormats || ["json"];
  
  // Generate files based on requested formats
  if (formats.includes("json")) {
    const jsonFile = path.join(jobDir, "results.json");
    fs.writeFileSync(jsonFile, JSON.stringify(results, null, 2));
  }
  
  if (formats.includes("csv")) {
    const csvFile = path.join(jobDir, "results.csv");
    const csvContent = convertToCSV(results);
    fs.writeFileSync(csvFile, csvContent);
  }
  
  if (formats.includes("geojson")) {
    const geoJsonFile = path.join(jobDir, "results.geojson");
    const geoJsonContent = convertToGeoJSON(results);
    fs.writeFileSync(geoJsonFile, JSON.stringify(geoJsonContent, null, 2));
  }
  
  if (formats.includes("kml")) {
    const kmlFile = path.join(jobDir, "results.kml");
    const kmlContent = convertToKML(results);
    fs.writeFileSync(kmlFile, kmlContent);
  }

  // Create manifest
  const manifest = {
    project: project.name,
    jobId,
    totalResults: results.length,
    exportFormats: formats,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(path.join(jobDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  // Create ZIP file
  const zipPath = path.join(outputDir, `job-${jobId}.zip`);
  await createZipFile(jobDir, zipPath);
  
  return `exports/job-${jobId}.zip`;
}

function convertToCSV(results: ScrapeResult[]): string {
  const headers = ["URL", "Title", "Content Preview"];
  const rows = results.map(r => [
    r.url,
    r.title.replace(/"/g, '""'),
    r.content.substring(0, 200).replace(/"/g, '""')
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n");
}

function convertToGeoJSON(results: ScrapeResult[]): any {
  return {
    type: "FeatureCollection",
    features: results.map(r => ({
      type: "Feature",
      properties: {
        url: r.url,
        title: r.title,
        content: r.content.substring(0, 200)
      },
      geometry: {
        type: "Point",
        coordinates: [0, 0] // Default coordinates - in real implementation, extract from content
      }
    }))
  };
}

function convertToKML(results: ScrapeResult[]): string {
  const placemarks = results.map(r => `
    <Placemark>
      <name>${r.title}</name>
      <description><![CDATA[${r.content.substring(0, 200)}]]></description>
      <Point>
        <coordinates>0,0,0</coordinates>
      </Point>
    </Placemark>
  `).join("");
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Scrape Results</name>
    ${placemarks}
  </Document>
</kml>`;
}

async function createZipFile(sourceDir: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));
    
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}
