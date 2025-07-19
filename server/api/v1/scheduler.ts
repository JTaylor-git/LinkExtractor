import { Router } from 'express';
import { scheduler } from '../../services/scheduler';
import { storage } from '../../storage';
import { z } from 'zod';

const router = Router();

// Auth middleware
const authMiddleware = (req: any, res: any, next: any) => {
  req.userId = 1; // For MVP, use default user
  next();
};

const scheduleTaskSchema = z.object({
  projectId: z.number(),
  cronExpression: z.string(),
  watchForChanges: z.boolean().optional().default(false),
});

/**
 * POST /api/v1/scheduler/tasks
 * Schedule a recurring scraping task
 */
router.post('/tasks', authMiddleware, async (req: any, res) => {
  try {
    const { projectId, cronExpression, watchForChanges } = scheduleTaskSchema.parse(req.body);
    
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
    
    const taskId = scheduler.scheduleTask(projectId, cronExpression, watchForChanges);
    const task = scheduler.getTask(taskId);
    
    res.status(201).json({ 
      data: task,
      message: 'Task scheduled successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Invalid task data',
        details: error.errors 
      });
    } else {
      console.error('Error scheduling task:', error);
      res.status(500).json({ 
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to schedule task' 
      });
    }
  }
});

/**
 * GET /api/v1/scheduler/tasks
 * Get all scheduled tasks for the authenticated user
 */
router.get('/tasks', authMiddleware, async (req: any, res) => {
  try {
    const { status, projectId } = req.query;
    
    const userProjects = await storage.getProjectsByUser(req.userId);
    const userProjectIds = userProjects.map(p => p.id);
    
    let tasks = scheduler.getAllTasks().filter(task => 
      userProjectIds.includes(task.projectId)
    );
    
    // Apply filters
    if (status) {
      tasks = tasks.filter(task => 
        status === 'active' ? task.isActive : !task.isActive
      );
    }
    
    if (projectId) {
      tasks = tasks.filter(task => task.projectId === parseInt(projectId));
    }
    
    res.json({ data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch tasks' 
    });
  }
});

/**
 * GET /api/v1/scheduler/tasks/:taskId
 * Get a specific scheduled task
 */
router.get('/tasks/:taskId', authMiddleware, async (req: any, res) => {
  try {
    const { taskId } = req.params;
    
    const task = scheduler.getTask(taskId);
    if (!task) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Task not found' 
      });
    }
    
    // Verify ownership through project
    const project = await storage.getProject(task.projectId);
    if (!project || project.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Access denied' 
      });
    }
    
    res.json({ data: task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch task' 
    });
  }
});

/**
 * PUT /api/v1/scheduler/tasks/:taskId
 * Update a scheduled task
 */
router.put('/tasks/:taskId', authMiddleware, async (req: any, res) => {
  try {
    const { taskId } = req.params;
    const { isActive, cronExpression, watchForChanges } = req.body;
    
    const task = scheduler.getTask(taskId);
    if (!task) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Task not found' 
      });
    }
    
    // Verify ownership through project
    const project = await storage.getProject(task.projectId);
    if (!project || project.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Access denied' 
      });
    }
    
    // Update task properties
    if (typeof isActive === 'boolean') {
      task.isActive = isActive;
    }
    if (cronExpression) {
      task.cronExpression = cronExpression;
    }
    if (typeof watchForChanges === 'boolean') {
      task.watchForChanges = watchForChanges;
    }
    
    res.json({ 
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update task' 
    });
  }
});

/**
 * DELETE /api/v1/scheduler/tasks/:taskId
 * Cancel a scheduled task
 */
router.delete('/tasks/:taskId', authMiddleware, async (req: any, res) => {
  try {
    const { taskId } = req.params;
    
    const task = scheduler.getTask(taskId);
    if (!task) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Task not found' 
      });
    }
    
    // Verify ownership through project
    const project = await storage.getProject(task.projectId);
    if (!project || project.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Access denied' 
      });
    }
    
    const success = scheduler.cancelTask(taskId);
    
    if (success) {
      res.status(204).send();
    } else {
      res.status(500).json({ 
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to cancel task' 
      });
    }
  } catch (error) {
    console.error('Error cancelling task:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to cancel task' 
    });
  }
});

/**
 * GET /api/v1/scheduler/projects/:projectId/tasks
 * Get all scheduled tasks for a specific project
 */
router.get('/projects/:projectId/tasks', authMiddleware, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
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
    
    const tasks = scheduler.getTasksForProject(projectId);
    res.json({ data: tasks });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch project tasks' 
    });
  }
});

export default router;