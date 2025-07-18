import { Router } from 'express';
import { scheduler } from '../services/scheduler';
import { z } from 'zod';

const router = Router();

// Auth middleware for scheduler routes
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
 * POST /api/scheduler/schedule
 * Schedule a recurring scraping task
 */
router.post('/schedule', authMiddleware, async (req, res) => {
  try {
    const { projectId, cronExpression, watchForChanges } = scheduleTaskSchema.parse(req.body);
    
    const taskId = scheduler.scheduleTask(projectId, cronExpression, watchForChanges);
    
    res.json({ 
      taskId, 
      message: 'Task scheduled successfully',
      nextRun: scheduler.getTask(taskId)?.nextRun 
    });
  } catch (error) {
    console.error('Error scheduling task:', error);
    res.status(400).json({ message: 'Failed to schedule task' });
  }
});

/**
 * DELETE /api/scheduler/tasks/:taskId
 * Cancel a scheduled task
 */
router.delete('/tasks/:taskId', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const success = scheduler.cancelTask(taskId);
    
    if (success) {
      res.json({ message: 'Task cancelled successfully' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error('Error cancelling task:', error);
    res.status(500).json({ message: 'Failed to cancel task' });
  }
});

/**
 * GET /api/scheduler/tasks
 * Get all scheduled tasks
 */
router.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = scheduler.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

/**
 * GET /api/scheduler/tasks/:taskId
 * Get a specific scheduled task
 */
router.get('/tasks/:taskId', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = scheduler.getTask(taskId);
    
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Failed to fetch task' });
  }
});

/**
 * GET /api/scheduler/projects/:projectId/tasks
 * Get all scheduled tasks for a project
 */
router.get('/projects/:projectId/tasks', authMiddleware, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    const tasks = scheduler.getTasksForProject(projectId);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ message: 'Failed to fetch project tasks' });
  }
});

export default router;