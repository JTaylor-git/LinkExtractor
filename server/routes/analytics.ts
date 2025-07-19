import { Router } from 'express';
import { AnalyticsService } from '../engine/AnalyticsService';

const router = Router();

/**
 * GET /api/analytics
 * Returns comprehensive analytics data for the dashboard
 */
router.get('/analytics', (_req, res) => {
  try {
    const analytics = AnalyticsService.getAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

export default router;