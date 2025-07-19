import { Router } from 'express';
import { AnalyticsService } from '../../engine/AnalyticsService';
import { storage } from '../../storage';

const router = Router();

// Auth middleware
const authMiddleware = (req: any, res: any, next: any) => {
  req.userId = 1; // For MVP, use default user
  next();
};

/**
 * GET /api/v1/analytics
 * Get comprehensive analytics data
 */
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const { timeRange = '24h', metrics } = req.query;
    
    const analytics = AnalyticsService.getAnalytics();
    
    // Apply time range filter if needed
    if (timeRange !== '24h') {
      // Implementation for different time ranges
      const hours = timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 24;
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
      analytics.timeseries = analytics.timeseries.filter(
        point => new Date(point.timestamp) >= cutoff
      );
    }
    
    // Filter metrics if specified
    if (metrics) {
      const requestedMetrics = metrics.split(',');
      const filteredAnalytics: any = {};
      
      requestedMetrics.forEach((metric: string) => {
        if (analytics[metric as keyof typeof analytics]) {
          filteredAnalytics[metric] = analytics[metric as keyof typeof analytics];
        }
      });
      
      return res.json({ data: filteredAnalytics });
    }
    
    res.json({ data: analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch analytics' 
    });
  }
});

/**
 * GET /api/v1/analytics/projects/:projectId
 * Get analytics for a specific project
 */
router.get('/projects/:projectId', authMiddleware, async (req: any, res) => {
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
    
    // Get project-specific analytics
    const jobs = await storage.getScrapeJobsByProject(projectId);
    const projectAnalytics = {
      totalJobs: jobs.length,
      completedJobs: jobs.filter(j => j.status === 'completed').length,
      failedJobs: jobs.filter(j => j.status === 'failed').length,
      runningJobs: jobs.filter(j => j.status === 'running').length,
      averageProgress: jobs.reduce((sum, job) => sum + (job.progress || 0), 0) / jobs.length || 0,
      jobHistory: jobs.map(job => ({
        id: job.id,
        status: job.status,
        progress: job.progress,
        startedAt: job.startedAt,
        completedAt: job.completedAt
      }))
    };
    
    res.json({ data: projectAnalytics });
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch project analytics' 
    });
  }
});

/**
 * GET /api/v1/analytics/summary
 * Get summary statistics
 */
router.get('/summary', authMiddleware, async (req: any, res) => {
  try {
    const projects = await storage.getProjectsByUser(req.userId);
    const allJobs = await Promise.all(
      projects.map(p => storage.getScrapeJobsByProject(p.id))
    );
    const jobs = allJobs.flat();
    
    const summary = {
      totalProjects: projects.length,
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status === 'running').length,
      completedJobs: jobs.filter(j => j.status === 'completed').length,
      failedJobs: jobs.filter(j => j.status === 'failed').length,
      successRate: jobs.length > 0 ? 
        (jobs.filter(j => j.status === 'completed').length / jobs.length) * 100 : 0,
      averageProgress: jobs.reduce((sum, job) => sum + (job.progress || 0), 0) / jobs.length || 0,
      recentActivity: jobs
        .sort((a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime())
        .slice(0, 5)
        .map(job => ({
          id: job.id,
          projectId: job.projectId,
          status: job.status,
          progress: job.progress,
          startedAt: job.startedAt
        }))
    };
    
    res.json({ data: summary });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch analytics summary' 
    });
  }
});

/**
 * GET /api/v1/analytics/performance
 * Get performance metrics
 */
router.get('/performance', authMiddleware, async (req: any, res) => {
  try {
    const analytics = AnalyticsService.getAnalytics();
    
    const performance = {
      requestsPerSecond: analytics.timeseries.reduce((sum, point) => sum + point.count, 0) / 3600, // hourly average
      averageLatency: analytics.domainLatency.reduce((sum, domain) => sum + domain.avgLatency, 0) / analytics.domainLatency.length,
      errorRate: analytics.errorHeatmap.reduce((sum, pattern) => sum + pattern.errors, 0) / 
                analytics.timeseries.reduce((sum, point) => sum + point.count, 0) * 100,
      topDomains: analytics.domainLatency
        .sort((a, b) => b.avgLatency - a.avgLatency)
        .slice(0, 5),
      resourceDistribution: analytics.resourceBreakdown
        .sort((a, b) => b.count - a.count)
    };
    
    res.json({ data: performance });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch performance metrics' 
    });
  }
});

export default router;