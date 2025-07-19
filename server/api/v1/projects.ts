import { Router } from 'express';
import { storage } from '../../storage';
import { insertProjectSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Auth middleware
const authMiddleware = (req: any, res: any, next: any) => {
  req.userId = 1; // For MVP, use default user
  next();
};

/**
 * GET /api/v1/projects
 * List all projects for the authenticated user
 */
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    let projects = await storage.getProjectsByUser(req.userId);
    
    // Apply filters
    if (status) {
      projects = projects.filter(p => p.status === status);
    }
    
    if (search) {
      projects = projects.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.startUrl.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const total = projects.length;
    const paginatedProjects = projects.slice(offset, offset + limit);
    
    res.json({
      data: paginatedProjects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch projects' 
    });
  }
});

/**
 * POST /api/v1/projects
 * Create a new project
 */
router.post('/', authMiddleware, async (req: any, res) => {
  try {
    const validatedData = insertProjectSchema.parse(req.body);
    const project = await storage.createProject({
      ...validatedData,
      userId: req.userId
    });
    
    res.status(201).json({ data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Invalid project data',
        details: error.errors 
      });
    } else {
      console.error('Error creating project:', error);
      res.status(500).json({ 
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create project' 
      });
    }
  }
});

/**
 * GET /api/v1/projects/:id
 * Get a specific project
 */
router.get('/:id', authMiddleware, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Project not found' 
      });
    }
    
    // Check ownership
    if (project.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Access denied' 
      });
    }
    
    res.json({ data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch project' 
    });
  }
});

/**
 * PUT /api/v1/projects/:id
 * Update a project
 */
router.put('/:id', authMiddleware, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Project not found' 
      });
    }
    
    // Check ownership
    if (project.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Access denied' 
      });
    }
    
    const validatedData = insertProjectSchema.partial().parse(req.body);
    const updatedProject = await storage.updateProject(id, validatedData);
    
    res.json({ data: updatedProject });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Invalid project data',
        details: error.errors 
      });
    } else {
      console.error('Error updating project:', error);
      res.status(500).json({ 
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update project' 
      });
    }
  }
});

/**
 * DELETE /api/v1/projects/:id
 * Delete a project
 */
router.delete('/:id', authMiddleware, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Project not found' 
      });
    }
    
    // Check ownership
    if (project.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Access denied' 
      });
    }
    
    await storage.deleteProject(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to delete project' 
    });
  }
});

/**
 * GET /api/v1/projects/:id/jobs
 * Get all jobs for a project
 */
router.get('/:id/jobs', authMiddleware, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Project not found' 
      });
    }
    
    // Check ownership
    if (project.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Access denied' 
      });
    }
    
    const jobs = await storage.getScrapeJobsByProject(id);
    res.json({ data: jobs });
  } catch (error) {
    console.error('Error fetching project jobs:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch project jobs' 
    });
  }
});

export default router;