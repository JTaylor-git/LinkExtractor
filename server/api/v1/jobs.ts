import { Router } from 'express';
import { storage } from '../../storage';
import { insertScrapeJobSchema } from '@shared/schema';
import { scrapeWebsite } from '../../services/scraper';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Auth middleware
const authMiddleware = (req: any, res: any, next: any) => {
  req.userId = 1; // For MVP, use default user
  next();
};

/**
 * GET /api/v1/jobs
 * List all jobs for the authenticated user
 */
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const { page = 1, limit = 10, status, projectId } = req.query;
    const offset = (page - 1) * limit;
    
    const projects = await storage.getProjectsByUser(req.userId);
    let allJobs = await Promise.all(
      projects.map(p => storage.getScrapeJobsByProject(p.id))
    );
    let jobs = allJobs.flat();
    
    // Apply filters
    if (status) {
      jobs = jobs.filter(j => j.status === status);
    }
    
    if (projectId) {
      jobs = jobs.filter(j => j.projectId === parseInt(projectId));
    }
    
    // Sort by creation date (newest first)
    jobs.sort((a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime());
    
    const total = jobs.length;
    const paginatedJobs = jobs.slice(offset, offset + limit);
    
    res.json({
      data: paginatedJobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch jobs' 
    });
  }
});

/**
 * POST /api/v1/jobs
 * Create and start a new scraping job
 */
router.post('/', authMiddleware, async (req: any, res) => {
  try {
    const { projectId, ...jobData } = req.body;
    
    // Verify project ownership
    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Project not found' 
      });
    }
    
    if (project.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Access denied' 
      });
    }
    
    const validatedData = insertScrapeJobSchema.parse({
      projectId,
      status: 'queued',
      progress: 0,
      startedAt: new Date(),
      ...jobData
    });
    
    const job = await storage.createScrapeJob(validatedData);
    
    // Update project status
    await storage.updateProject(projectId, { status: "running" });
    
    // Start scraping in background
    scrapeWebsite(project, job.id).catch(console.error);
    
    res.status(201).json({ data: job });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Invalid job data',
        details: error.errors 
      });
    } else {
      console.error('Error creating job:', error);
      res.status(500).json({ 
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create job' 
      });
    }
  }
});

/**
 * GET /api/v1/jobs/:id
 * Get a specific job
 */
router.get('/:id', authMiddleware, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const job = await storage.getScrapeJob(id);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Job not found' 
      });
    }
    
    // Verify ownership through project
    const project = await storage.getProject(job.projectId);
    if (!project || project.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Access denied' 
      });
    }
    
    res.json({ data: job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch job' 
    });
  }
});

/**
 * PUT /api/v1/jobs/:id
 * Update a job (mainly for status changes)
 */
router.put('/:id', authMiddleware, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const job = await storage.getScrapeJob(id);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Job not found' 
      });
    }
    
    // Verify ownership through project
    const project = await storage.getProject(job.projectId);
    if (!project || project.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Access denied' 
      });
    }
    
    const validatedData = insertScrapeJobSchema.partial().parse(req.body);
    const updatedJob = await storage.updateScrapeJob(id, validatedData);
    
    res.json({ data: updatedJob });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Invalid job data',
        details: error.errors 
      });
    } else {
      console.error('Error updating job:', error);
      res.status(500).json({ 
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update job' 
      });
    }
  }
});

/**
 * DELETE /api/v1/jobs/:id
 * Cancel/delete a job
 */
router.delete('/:id', authMiddleware, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const job = await storage.getScrapeJob(id);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Job not found' 
      });
    }
    
    // Verify ownership through project
    const project = await storage.getProject(job.projectId);
    if (!project || project.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Access denied' 
      });
    }
    
    // If job is running, mark as cancelled
    if (job.status === 'running') {
      await storage.updateScrapeJob(id, { status: 'cancelled' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to delete job' 
    });
  }
});

/**
 * GET /api/v1/jobs/:id/download
 * Download job results
 */
router.get('/:id/download', authMiddleware, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const job = await storage.getScrapeJob(id);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Job not found' 
      });
    }
    
    // Verify ownership through project
    const project = await storage.getProject(job.projectId);
    if (!project || project.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Access denied' 
      });
    }
    
    if (!job.resultPath) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Job results not found' 
      });
    }
    
    const filePath = path.join(__dirname, "..", "..", job.resultPath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Result file not found' 
      });
    }
    
    res.download(filePath, `scrape-results-${id}.zip`);
  } catch (error) {
    console.error('Error downloading results:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to download results' 
    });
  }
});

/**
 * GET /api/v1/jobs/:id/logs
 * Get job execution logs
 */
router.get('/:id/logs', authMiddleware, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const job = await storage.getScrapeJob(id);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Job not found' 
      });
    }
    
    // Verify ownership through project
    const project = await storage.getProject(job.projectId);
    if (!project || project.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Access denied' 
      });
    }
    
    // For now, return mock logs - in production, this would read from log files
    const logs = [
      { timestamp: new Date().toISOString(), level: 'info', message: 'Job started' },
      { timestamp: new Date().toISOString(), level: 'info', message: 'Discovering URLs...' },
      { timestamp: new Date().toISOString(), level: 'info', message: `Processing ${project.startUrl}` },
      { timestamp: new Date().toISOString(), level: 'info', message: 'Job completed' }
    ];
    
    res.json({ data: logs });
  } catch (error) {
    console.error('Error fetching job logs:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch job logs' 
    });
  }
});

export default router;