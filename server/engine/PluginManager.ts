import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs/promises';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'scraper' | 'processor' | 'exporter' | 'analyzer' | 'utility';
  tags: string[];
  config: Record<string, any>;
  enabled: boolean;
  installedAt: Date;
  lastUpdated: Date;
  dependencies: string[];
  homepage?: string;
  repository?: string;
  downloadUrl?: string;
  icon?: string;
  screenshots?: string[];
  rating?: number;
  downloadCount?: number;
  size?: number;
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  main: string;
  author: string;
  category: Plugin['category'];
  tags: string[];
  dependencies: string[];
  engines: {
    clippr: string;
    node: string;
  };
  config?: Record<string, any>;
  homepage?: string;
  repository?: string;
  icon?: string;
  screenshots?: string[];
}

export interface PluginRegistry {
  plugins: Array<{
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    category: Plugin['category'];
    tags: string[];
    downloadUrl: string;
    homepage?: string;
    repository?: string;
    icon?: string;
    screenshots?: string[];
    rating: number;
    downloadCount: number;
    size: number;
    lastUpdated: Date;
  }>;
  featured: string[];
  categories: Array<{
    id: Plugin['category'];
    name: string;
    description: string;
    count: number;
  }>;
}

export class PluginManager extends EventEmitter {
  private plugins: Map<string, Plugin> = new Map();
  private pluginDir: string;
  private registryUrl: string;

  constructor(pluginDir: string = './plugins', registryUrl: string = 'https://registry.clippr.dev') {
    super();
    this.pluginDir = pluginDir;
    this.registryUrl = registryUrl;
    this.initializePluginDirectory();
  }

  private async initializePluginDirectory() {
    try {
      await fs.mkdir(this.pluginDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create plugin directory:', error);
    }
  }

  // Mock plugin registry data
  private getMockRegistry(): PluginRegistry {
    return {
      plugins: [
        {
          id: 'advanced-scraper',
          name: 'Advanced Web Scraper',
          version: '2.1.0',
          description: 'Enhanced scraping with JavaScript rendering, form handling, and dynamic content extraction',
          author: 'Clippr Team',
          category: 'scraper',
          tags: ['javascript', 'spa', 'dynamic', 'forms'],
          downloadUrl: 'https://registry.clippr.dev/plugins/advanced-scraper-2.1.0.tar.gz',
          homepage: 'https://clippr.dev/plugins/advanced-scraper',
          repository: 'https://github.com/clippr/advanced-scraper',
          icon: 'https://clippr.dev/icons/advanced-scraper.svg',
          screenshots: [
            'https://clippr.dev/screenshots/advanced-scraper-1.png',
            'https://clippr.dev/screenshots/advanced-scraper-2.png'
          ],
          rating: 4.8,
          downloadCount: 15420,
          size: 2.3 * 1024 * 1024,
          lastUpdated: new Date('2025-07-15')
        },
        {
          id: 'pdf-extractor',
          name: 'PDF Content Extractor',
          version: '1.5.2',
          description: 'Extract text, images, and metadata from PDF documents with OCR support',
          author: 'DataExtract Inc.',
          category: 'processor',
          tags: ['pdf', 'ocr', 'text-extraction', 'documents'],
          downloadUrl: 'https://registry.clippr.dev/plugins/pdf-extractor-1.5.2.tar.gz',
          homepage: 'https://clippr.dev/plugins/pdf-extractor',
          repository: 'https://github.com/dataextract/pdf-extractor',
          icon: 'https://clippr.dev/icons/pdf-extractor.svg',
          screenshots: [
            'https://clippr.dev/screenshots/pdf-extractor-1.png'
          ],
          rating: 4.6,
          downloadCount: 8932,
          size: 5.7 * 1024 * 1024,
          lastUpdated: new Date('2025-07-10')
        },
        {
          id: 'elasticsearch-export',
          name: 'Elasticsearch Exporter',
          version: '3.0.1',
          description: 'Export scraped data directly to Elasticsearch with custom mappings and indexing',
          author: 'Search Solutions',
          category: 'exporter',
          tags: ['elasticsearch', 'search', 'indexing', 'bulk-insert'],
          downloadUrl: 'https://registry.clippr.dev/plugins/elasticsearch-export-3.0.1.tar.gz',
          homepage: 'https://clippr.dev/plugins/elasticsearch-export',
          repository: 'https://github.com/searchsolutions/elasticsearch-export',
          icon: 'https://clippr.dev/icons/elasticsearch-export.svg',
          screenshots: [
            'https://clippr.dev/screenshots/elasticsearch-export-1.png',
            'https://clippr.dev/screenshots/elasticsearch-export-2.png'
          ],
          rating: 4.7,
          downloadCount: 12043,
          size: 1.2 * 1024 * 1024,
          lastUpdated: new Date('2025-07-12')
        },
        {
          id: 'sentiment-analyzer',
          name: 'AI Sentiment Analyzer',
          version: '1.8.0',
          description: 'Analyze sentiment and emotions in scraped text content using advanced NLP models',
          author: 'AI Labs',
          category: 'analyzer',
          tags: ['ai', 'nlp', 'sentiment', 'emotions', 'text-analysis'],
          downloadUrl: 'https://registry.clippr.dev/plugins/sentiment-analyzer-1.8.0.tar.gz',
          homepage: 'https://clippr.dev/plugins/sentiment-analyzer',
          repository: 'https://github.com/ailabs/sentiment-analyzer',
          icon: 'https://clippr.dev/icons/sentiment-analyzer.svg',
          screenshots: [
            'https://clippr.dev/screenshots/sentiment-analyzer-1.png'
          ],
          rating: 4.9,
          downloadCount: 6734,
          size: 12.4 * 1024 * 1024,
          lastUpdated: new Date('2025-07-14')
        },
        {
          id: 'proxy-rotator',
          name: 'Smart Proxy Rotator',
          version: '2.3.1',
          description: 'Intelligent proxy rotation with health monitoring, geo-targeting, and failure recovery',
          author: 'ProxyTech',
          category: 'utility',
          tags: ['proxy', 'rotation', 'geo-targeting', 'monitoring'],
          downloadUrl: 'https://registry.clippr.dev/plugins/proxy-rotator-2.3.1.tar.gz',
          homepage: 'https://clippr.dev/plugins/proxy-rotator',
          repository: 'https://github.com/proxytech/proxy-rotator',
          icon: 'https://clippr.dev/icons/proxy-rotator.svg',
          screenshots: [
            'https://clippr.dev/screenshots/proxy-rotator-1.png',
            'https://clippr.dev/screenshots/proxy-rotator-2.png'
          ],
          rating: 4.5,
          downloadCount: 9876,
          size: 3.1 * 1024 * 1024,
          lastUpdated: new Date('2025-07-11')
        },
        {
          id: 'image-downloader',
          name: 'Bulk Image Downloader',
          version: '1.4.3',
          description: 'Download and organize images from scraped pages with duplicate detection and optimization',
          author: 'MediaTools',
          category: 'processor',
          tags: ['images', 'download', 'optimization', 'deduplication'],
          downloadUrl: 'https://registry.clippr.dev/plugins/image-downloader-1.4.3.tar.gz',
          homepage: 'https://clippr.dev/plugins/image-downloader',
          repository: 'https://github.com/mediatools/image-downloader',
          icon: 'https://clippr.dev/icons/image-downloader.svg',
          screenshots: [
            'https://clippr.dev/screenshots/image-downloader-1.png'
          ],
          rating: 4.4,
          downloadCount: 11234,
          size: 2.8 * 1024 * 1024,
          lastUpdated: new Date('2025-07-13')
        }
      ],
      featured: ['advanced-scraper', 'sentiment-analyzer', 'elasticsearch-export'],
      categories: [
        { id: 'scraper', name: 'Web Scrapers', description: 'Enhanced scraping capabilities', count: 1 },
        { id: 'processor', name: 'Data Processors', description: 'Process and transform scraped data', count: 2 },
        { id: 'exporter', name: 'Data Exporters', description: 'Export data to various destinations', count: 1 },
        { id: 'analyzer', name: 'Data Analyzers', description: 'Analyze and extract insights from data', count: 1 },
        { id: 'utility', name: 'Utilities', description: 'Helper tools and utilities', count: 1 }
      ]
    };
  }

  public async discoverPlugins(): Promise<PluginRegistry> {
    // In a real implementation, this would fetch from the registry
    return this.getMockRegistry();
  }

  public async installPlugin(pluginId: string): Promise<Plugin> {
    const registry = await this.discoverPlugins();
    const registryPlugin = registry.plugins.find(p => p.id === pluginId);
    
    if (!registryPlugin) {
      throw new Error(`Plugin ${pluginId} not found in registry`);
    }

    // Simulate installation
    const plugin: Plugin = {
      id: registryPlugin.id,
      name: registryPlugin.name,
      version: registryPlugin.version,
      description: registryPlugin.description,
      author: registryPlugin.author,
      category: registryPlugin.category,
      tags: registryPlugin.tags,
      config: {},
      enabled: true,
      installedAt: new Date(),
      lastUpdated: new Date(),
      dependencies: [],
      homepage: registryPlugin.homepage,
      repository: registryPlugin.repository,
      downloadUrl: registryPlugin.downloadUrl,
      icon: registryPlugin.icon,
      screenshots: registryPlugin.screenshots,
      rating: registryPlugin.rating,
      downloadCount: registryPlugin.downloadCount,
      size: registryPlugin.size
    };

    this.plugins.set(pluginId, plugin);
    this.emit('pluginInstalled', plugin);
    
    console.log(`Plugin ${pluginId} installed successfully`);
    return plugin;
  }

  public async uninstallPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    this.plugins.delete(pluginId);
    this.emit('pluginUninstalled', plugin);
    
    console.log(`Plugin ${pluginId} uninstalled successfully`);
    return true;
  }

  public async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    plugin.enabled = true;
    this.emit('pluginEnabled', plugin);
    console.log(`Plugin ${pluginId} enabled`);
  }

  public async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    plugin.enabled = false;
    this.emit('pluginDisabled', plugin);
    console.log(`Plugin ${pluginId} disabled`);
  }

  public getInstalledPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  public getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  public getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => p.enabled);
  }

  public async updatePlugin(pluginId: string): Promise<Plugin> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Simulate update
    plugin.lastUpdated = new Date();
    this.emit('pluginUpdated', plugin);
    
    console.log(`Plugin ${pluginId} updated successfully`);
    return plugin;
  }

  public async searchPlugins(query: string, category?: Plugin['category']): Promise<Plugin[]> {
    const registry = await this.discoverPlugins();
    let results = registry.plugins;

    if (category) {
      results = results.filter(p => p.category === category);
    }

    if (query) {
      const searchQuery = query.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(searchQuery) ||
        p.description.toLowerCase().includes(searchQuery) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }

    return results.map(registryPlugin => ({
      id: registryPlugin.id,
      name: registryPlugin.name,
      version: registryPlugin.version,
      description: registryPlugin.description,
      author: registryPlugin.author,
      category: registryPlugin.category,
      tags: registryPlugin.tags,
      config: {},
      enabled: false,
      installedAt: new Date(),
      lastUpdated: registryPlugin.lastUpdated,
      dependencies: [],
      homepage: registryPlugin.homepage,
      repository: registryPlugin.repository,
      downloadUrl: registryPlugin.downloadUrl,
      icon: registryPlugin.icon,
      screenshots: registryPlugin.screenshots,
      rating: registryPlugin.rating,
      downloadCount: registryPlugin.downloadCount,
      size: registryPlugin.size
    }));
  }

  public async getPluginStats(): Promise<{
    total: number;
    enabled: number;
    disabled: number;
    categories: Record<string, number>;
    recentlyInstalled: Plugin[];
    recentlyUpdated: Plugin[];
  }> {
    const plugins = this.getInstalledPlugins();
    const categories: Record<string, number> = {};
    
    plugins.forEach(plugin => {
      categories[plugin.category] = (categories[plugin.category] || 0) + 1;
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: plugins.length,
      enabled: plugins.filter(p => p.enabled).length,
      disabled: plugins.filter(p => !p.enabled).length,
      categories,
      recentlyInstalled: plugins.filter(p => p.installedAt > sevenDaysAgo),
      recentlyUpdated: plugins.filter(p => p.lastUpdated > sevenDaysAgo)
    };
  }
}

// Export singleton instance
export const pluginManager = new PluginManager();