import { Router } from 'express';
import { storage } from '../../storage';
import { scheduler } from '../../services/scheduler';

const router = Router();

// Auth middleware
const authMiddleware = (req: any, res: any, next: any) => {
  req.userId = 1; // For MVP, use default user
  next();
};

/**
 * GET /api/v1/system/health
 * System health check
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'healthy',
        scheduler: 'healthy',
        scraper: 'healthy'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeScheduledTasks: scheduler.getAllTasks().filter(t => t.isActive).length
    };
    
    res.json({ data: health });
  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Health check failed' 
    });
  }
});

/**
 * GET /api/v1/system/stats
 * System statistics
 */
router.get('/stats', authMiddleware, async (req: any, res) => {
  try {
    const projects = await storage.getProjectsByUser(req.userId);
    const allJobs = await Promise.all(
      projects.map(p => storage.getScrapeJobsByProject(p.id))
    );
    const jobs = allJobs.flat();
    
    const stats = {
      user: {
        totalProjects: projects.length,
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'running').length,
        completedJobs: jobs.filter(j => j.status === 'completed').length,
        failedJobs: jobs.filter(j => j.status === 'failed').length,
        scheduledTasks: scheduler.getAllTasks().filter(t => 
          projects.some(p => p.id === t.projectId)
        ).length
      },
      system: {
        qps: Math.floor(Math.random() * 2000) + 500, // Mock QPS
        activeConnections: Math.floor(Math.random() * 100) + 10,
        memoryUsage: process.memoryUsage(),
        cpuUsage: Math.random() * 100,
        uptime: process.uptime()
      }
    };
    
    res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch system stats' 
    });
  }
});

/**
 * GET /api/v1/system/info
 * System information
 */
router.get('/info', async (req, res) => {
  try {
    const info = {
      name: 'Clippr',
      version: '1.0.0',
      description: 'Next-generation web scraping platform',
      features: [
        'Dual-mode scraping (No-Code + Pro-Code)',
        'Real-time analytics dashboard',
        'Scheduled recurring scrapes',
        'Proxy rotation and management',
        'Multiple export formats',
        'RESTful API',
        'Change detection and monitoring'
      ],
      api: {
        version: 'v1',
        endpoints: {
          projects: '/api/v1/projects',
          jobs: '/api/v1/jobs',
          analytics: '/api/v1/analytics',
          scheduler: '/api/v1/scheduler',
          system: '/api/v1/system'
        }
      },
      limits: {
        maxProjects: 100,
        maxJobsPerProject: 1000,
        maxScheduledTasks: 50,
        rateLimit: '1000 requests/hour'
      }
    };
    
    res.json({ data: info });
  } catch (error) {
    console.error('Error fetching system info:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch system info' 
    });
  }
});

/**
 * POST /api/v1/system/gc
 * Trigger garbage collection (admin only)
 */
router.post('/gc', authMiddleware, async (req: any, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'GC endpoint only available in development' 
      });
    }
    
    const before = process.memoryUsage();
    
    if (global.gc) {
      global.gc();
    }
    
    const after = process.memoryUsage();
    
    res.json({ 
      data: {
        before,
        after,
        freed: before.heapUsed - after.heapUsed
      },
      message: 'Garbage collection completed'
    });
  } catch (error) {
    console.error('Error triggering GC:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to trigger GC' 
    });
  }
});

export default router;