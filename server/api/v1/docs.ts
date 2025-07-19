import { Router } from 'express';

const router = Router();

/**
 * GET /api/v1/docs
 * API documentation
 */
router.get('/', (req, res) => {
  const docs = {
    info: {
      title: 'Clippr API',
      version: '1.0.0',
      description: 'REST API for the Clippr web scraping platform',
      contact: {
        name: 'Clippr Support',
        url: 'https://clippr.dev'
      }
    },
    baseURL: '/api/v1',
    authentication: {
      type: 'session',
      description: 'Uses session-based authentication'
    },
    endpoints: {
      projects: {
        'GET /projects': {
          description: 'List all projects',
          parameters: {
            page: 'Page number (default: 1)',
            limit: 'Items per page (default: 10)',
            status: 'Filter by status (queued, running, completed, failed)',
            search: 'Search by name or URL'
          },
          response: {
            data: 'Array of project objects',
            pagination: 'Pagination metadata'
          }
        },
        'POST /projects': {
          description: 'Create a new project',
          body: {
            name: 'Project name (required)',
            startUrl: 'Starting URL (required)',
            depth: 'Crawl depth (1-10)',
            exportFormats: 'Array of export formats',
            proxyMode: 'Proxy mode (none, api, list)',
            proxyApiKey: 'Proxy API key (optional)',
            proxyListFile: 'Proxy list file (optional)'
          },
          response: {
            data: 'Created project object'
          }
        },
        'GET /projects/:id': {
          description: 'Get a specific project',
          parameters: {
            id: 'Project ID'
          },
          response: {
            data: 'Project object'
          }
        },
        'PUT /projects/:id': {
          description: 'Update a project',
          parameters: {
            id: 'Project ID'
          },
          body: 'Partial project object',
          response: {
            data: 'Updated project object'
          }
        },
        'DELETE /projects/:id': {
          description: 'Delete a project',
          parameters: {
            id: 'Project ID'
          },
          response: '204 No Content'
        },
        'GET /projects/:id/jobs': {
          description: 'Get all jobs for a project',
          parameters: {
            id: 'Project ID'
          },
          response: {
            data: 'Array of job objects'
          }
        }
      },
      jobs: {
        'GET /jobs': {
          description: 'List all jobs',
          parameters: {
            page: 'Page number (default: 1)',
            limit: 'Items per page (default: 10)',
            status: 'Filter by status',
            projectId: 'Filter by project ID'
          },
          response: {
            data: 'Array of job objects',
            pagination: 'Pagination metadata'
          }
        },
        'POST /jobs': {
          description: 'Create and start a new job',
          body: {
            projectId: 'Project ID (required)',
            status: 'Job status (optional)',
            progress: 'Job progress (optional)'
          },
          response: {
            data: 'Created job object'
          }
        },
        'GET /jobs/:id': {
          description: 'Get a specific job',
          parameters: {
            id: 'Job ID'
          },
          response: {
            data: 'Job object'
          }
        },
        'PUT /jobs/:id': {
          description: 'Update a job',
          parameters: {
            id: 'Job ID'
          },
          body: 'Partial job object',
          response: {
            data: 'Updated job object'
          }
        },
        'DELETE /jobs/:id': {
          description: 'Cancel/delete a job',
          parameters: {
            id: 'Job ID'
          },
          response: '204 No Content'
        },
        'GET /jobs/:id/download': {
          description: 'Download job results',
          parameters: {
            id: 'Job ID'
          },
          response: 'ZIP file download'
        },
        'GET /jobs/:id/logs': {
          description: 'Get job execution logs',
          parameters: {
            id: 'Job ID'
          },
          response: {
            data: 'Array of log entries'
          }
        }
      },
      analytics: {
        'GET /analytics': {
          description: 'Get comprehensive analytics',
          parameters: {
            timeRange: 'Time range (24h, 7d, 30d)',
            metrics: 'Comma-separated list of metrics'
          },
          response: {
            data: 'Analytics object'
          }
        },
        'GET /analytics/projects/:projectId': {
          description: 'Get project-specific analytics',
          parameters: {
            projectId: 'Project ID'
          },
          response: {
            data: 'Project analytics object'
          }
        },
        'GET /analytics/summary': {
          description: 'Get summary statistics',
          response: {
            data: 'Summary statistics object'
          }
        },
        'GET /analytics/performance': {
          description: 'Get performance metrics',
          response: {
            data: 'Performance metrics object'
          }
        }
      },
      scheduler: {
        'POST /scheduler/tasks': {
          description: 'Schedule a recurring task',
          body: {
            projectId: 'Project ID (required)',
            cronExpression: 'Cron expression (required)',
            watchForChanges: 'Enable change detection (optional)'
          },
          response: {
            data: 'Created task object'
          }
        },
        'GET /scheduler/tasks': {
          description: 'List all scheduled tasks',
          parameters: {
            status: 'Filter by status (active, inactive)',
            projectId: 'Filter by project ID'
          },
          response: {
            data: 'Array of task objects'
          }
        },
        'GET /scheduler/tasks/:taskId': {
          description: 'Get a specific task',
          parameters: {
            taskId: 'Task ID'
          },
          response: {
            data: 'Task object'
          }
        },
        'PUT /scheduler/tasks/:taskId': {
          description: 'Update a scheduled task',
          parameters: {
            taskId: 'Task ID'
          },
          body: 'Partial task object',
          response: {
            data: 'Updated task object'
          }
        },
        'DELETE /scheduler/tasks/:taskId': {
          description: 'Cancel a scheduled task',
          parameters: {
            taskId: 'Task ID'
          },
          response: '204 No Content'
        },
        'GET /scheduler/projects/:projectId/tasks': {
          description: 'Get tasks for a project',
          parameters: {
            projectId: 'Project ID'
          },
          response: {
            data: 'Array of task objects'
          }
        }
      },
      system: {
        'GET /system/health': {
          description: 'System health check',
          response: {
            data: 'Health status object'
          }
        },
        'GET /system/stats': {
          description: 'System statistics',
          response: {
            data: 'System stats object'
          }
        },
        'GET /system/info': {
          description: 'System information',
          response: {
            data: 'System info object'
          }
        },
        'POST /system/gc': {
          description: 'Trigger garbage collection (dev only)',
          response: {
            data: 'GC results object'
          }
        }
      }
    },
    errorCodes: {
      400: 'Bad Request - Invalid input data',
      401: 'Unauthorized - Authentication required',
      403: 'Forbidden - Access denied',
      404: 'Not Found - Resource not found',
      422: 'Validation Error - Invalid request data',
      500: 'Internal Server Error - Server error'
    },
    examples: {
      createProject: {
        request: {
          method: 'POST',
          url: '/api/v1/projects',
          body: {
            name: 'E-commerce Data Collection',
            startUrl: 'https://example-shop.com',
            depth: 3,
            exportFormats: ['json', 'csv'],
            proxyMode: 'none'
          }
        },
        response: {
          data: {
            id: 1,
            name: 'E-commerce Data Collection',
            startUrl: 'https://example-shop.com',
            depth: 3,
            exportFormats: ['json', 'csv'],
            status: 'queued',
            userId: 1,
            createdAt: '2025-07-18T04:00:00Z'
          }
        }
      },
      scheduleTask: {
        request: {
          method: 'POST',
          url: '/api/v1/scheduler/tasks',
          body: {
            projectId: 1,
            cronExpression: '0 */6 * * *',
            watchForChanges: true
          }
        },
        response: {
          data: {
            id: 'task_1_1625097600000',
            projectId: 1,
            cronExpression: '0 */6 * * *',
            isActive: true,
            watchForChanges: true,
            nextRun: '2025-07-18T10:00:00Z'
          }
        }
      }
    }
  };

  res.json(docs);
});

export default router;