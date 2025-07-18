import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertScrapeJobSchema } from "@shared/schema";
import { scrapeWebsite } from "./services/scraper";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a simple auth middleware for MVP (in production, use proper auth)
  const authMiddleware = (req: any, res: any, next: any) => {
    // For MVP, we'll use a simple user ID of 1
    req.userId = 1;
    next();
  };

  // Create default user if doesn't exist
  const ensureDefaultUser = async () => {
    const user = await storage.getUserByUsername("default");
    if (!user) {
      await storage.createUser({
        username: "default",
        email: "user@example.com",
        password: "password"
      });
    }
  };
  await ensureDefaultUser();

  // Projects routes
  app.get("/api/projects", authMiddleware, async (req: any, res) => {
    try {
      const projects = await storage.getProjectsByUser(req.userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", authMiddleware, async (req: any, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject({
        ...validatedData,
        userId: req.userId
      });
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", authMiddleware, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.put("/api/projects/:id", authMiddleware, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const project = await storage.updateProject(id, updates);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", authMiddleware, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.json({ message: "Project deleted" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Scrape jobs routes
  app.get("/api/projects/:id/jobs", authMiddleware, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const jobs = await storage.getScrapeJobsByProject(projectId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching scrape jobs:", error);
      res.status(500).json({ message: "Failed to fetch scrape jobs" });
    }
  });

  app.post("/api/projects/:id/scrape", authMiddleware, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Create a new scrape job
      const job = await storage.createScrapeJob({
        projectId,
        status: "queued"
      });

      // Update project status
      await storage.updateProject(projectId, { status: "running" });

      // Start scraping in background
      scrapeWebsite(project, job.id).catch(console.error);

      res.json(job);
    } catch (error) {
      console.error("Error starting scrape:", error);
      res.status(500).json({ message: "Failed to start scrape" });
    }
  });

  app.get("/api/jobs/:id", authMiddleware, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getScrapeJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.get("/api/jobs/:id/download", authMiddleware, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getScrapeJob(id);
      
      if (!job || !job.resultPath) {
        return res.status(404).json({ message: "Job results not found" });
      }

      const filePath = path.join(__dirname, "..", job.resultPath);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Result file not found" });
      }

      res.download(filePath, `scrape-results-${id}.zip`);
    } catch (error) {
      console.error("Error downloading results:", error);
      res.status(500).json({ message: "Failed to download results" });
    }
  });

  // Dashboard stats
  app.get("/api/stats", authMiddleware, async (req: any, res) => {
    try {
      const projects = await storage.getProjectsByUser(req.userId);
      const allJobs = await Promise.all(
        projects.map(p => storage.getScrapeJobsByProject(p.id))
      );
      const jobs = allJobs.flat();

      const stats = {
        activeJobs: jobs.filter(j => j.status === "running").length,
        queuedJobs: jobs.filter(j => j.status === "queued").length,
        failedJobs: jobs.filter(j => j.status === "failed").length,
        totalProjects: projects.length,
        qps: Math.floor(Math.random() * 2000) + 500 // Mock QPS for demo
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
