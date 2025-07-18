import { Router } from 'express';
import projectsRouter from './projects';
import jobsRouter from './jobs';
import analyticsRouter from './analytics';
import schedulerRouter from './scheduler';
import systemRouter from './system';
import docsRouter from './docs';
import pluginsRouter from './plugins';

const router = Router();

// Mount all API v1 routes
router.use('/projects', projectsRouter);
router.use('/jobs', jobsRouter);
router.use('/analytics', analyticsRouter);
router.use('/scheduler', schedulerRouter);
router.use('/system', systemRouter);
router.use('/docs', docsRouter);
router.use('/plugins', pluginsRouter);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Clippr API',
    version: '1.0.0',
    description: 'Next-generation web scraping platform API',
    endpoints: {
      projects: '/api/v1/projects',
      jobs: '/api/v1/jobs',
      analytics: '/api/v1/analytics',
      scheduler: '/api/v1/scheduler',
      system: '/api/v1/system',
      plugins: '/api/v1/plugins'
    },
    documentation: '/api/v1/docs'
  });
});

export default router;