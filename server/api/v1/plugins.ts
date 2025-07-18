import { Router } from 'express';
import { pluginManager } from '../../engine/PluginManager';
import { z } from 'zod';

const router = Router();

// Auth middleware
const authMiddleware = (req: any, res: any, next: any) => {
  req.userId = 1; // For MVP, use default user
  next();
};

const installPluginSchema = z.object({
  pluginId: z.string().min(1, 'Plugin ID is required'),
});

const searchPluginsSchema = z.object({
  query: z.string().optional(),
  category: z.enum(['scraper', 'processor', 'exporter', 'analyzer', 'utility']).optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

/**
 * GET /api/v1/plugins/registry
 * Discover available plugins from the registry
 */
router.get('/registry', authMiddleware, async (req, res) => {
  try {
    const registry = await pluginManager.discoverPlugins();
    res.json({ data: registry });
  } catch (error) {
    console.error('Error fetching plugin registry:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch plugin registry' 
    });
  }
});

/**
 * GET /api/v1/plugins/search
 * Search available plugins
 */
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query, category, limit, offset } = searchPluginsSchema.parse(req.query);
    
    const results = await pluginManager.searchPlugins(query, category);
    const paginatedResults = results.slice(offset, offset + limit);
    
    res.json({
      data: paginatedResults,
      pagination: {
        total: results.length,
        limit,
        offset,
        hasMore: offset + limit < results.length
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Invalid search parameters',
        details: error.errors 
      });
    } else {
      console.error('Error searching plugins:', error);
      res.status(500).json({ 
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to search plugins' 
      });
    }
  }
});

/**
 * GET /api/v1/plugins/installed
 * Get all installed plugins
 */
router.get('/installed', authMiddleware, async (req, res) => {
  try {
    const { category, status } = req.query;
    
    let plugins = pluginManager.getInstalledPlugins();
    
    if (category) {
      plugins = plugins.filter(p => p.category === category);
    }
    
    if (status) {
      plugins = plugins.filter(p => 
        status === 'enabled' ? p.enabled : !p.enabled
      );
    }
    
    res.json({ data: plugins });
  } catch (error) {
    console.error('Error fetching installed plugins:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch installed plugins' 
    });
  }
});

/**
 * POST /api/v1/plugins/install
 * Install a plugin
 */
router.post('/install', authMiddleware, async (req, res) => {
  try {
    const { pluginId } = installPluginSchema.parse(req.body);
    
    const plugin = await pluginManager.installPlugin(pluginId);
    
    res.status(201).json({ 
      data: plugin,
      message: 'Plugin installed successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Invalid plugin installation data',
        details: error.errors 
      });
    } else {
      console.error('Error installing plugin:', error);
      res.status(500).json({ 
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to install plugin'
      });
    }
  }
});

/**
 * DELETE /api/v1/plugins/:pluginId
 * Uninstall a plugin
 */
router.delete('/:pluginId', authMiddleware, async (req, res) => {
  try {
    const { pluginId } = req.params;
    
    await pluginManager.uninstallPlugin(pluginId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error uninstalling plugin:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Failed to uninstall plugin'
    });
  }
});

/**
 * GET /api/v1/plugins/stats
 * Get plugin statistics
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await pluginManager.getPluginStats();
    res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching plugin stats:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch plugin statistics' 
    });
  }
});

/**
 * GET /api/v1/plugins/search
 * Search available plugins
 */
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query, category, limit, offset } = searchPluginsSchema.parse(req.query);
    
    const results = await pluginManager.searchPlugins(query, category);
    const paginatedResults = results.slice(offset, offset + limit);
    
    res.json({
      data: paginatedResults,
      pagination: {
        total: results.length,
        limit,
        offset,
        hasMore: offset + limit < results.length
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Invalid search parameters',
        details: error.errors 
      });
    } else {
      console.error('Error searching plugins:', error);
      res.status(500).json({ 
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to search plugins' 
      });
    }
  }
});

/**
 * GET /api/v1/plugins/:pluginId
 * Get plugin details
 */
router.get('/:pluginId', authMiddleware, async (req, res) => {
  try {
    const { pluginId } = req.params;
    
    // Skip special routes that are handled elsewhere
    if (pluginId === 'stats' || pluginId === 'search' || pluginId === 'registry' || pluginId === 'installed') {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Plugin not found' 
      });
    }
    
    const plugin = pluginManager.getPlugin(pluginId);
    
    if (!plugin) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Plugin not found' 
      });
    }
    
    res.json({ data: plugin });
  } catch (error) {
    console.error('Error fetching plugin:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch plugin details' 
    });
  }
});

/**
 * PUT /api/v1/plugins/:pluginId/enable
 * Enable a plugin
 */
router.put('/:pluginId/enable', authMiddleware, async (req, res) => {
  try {
    const { pluginId } = req.params;
    
    await pluginManager.enablePlugin(pluginId);
    
    res.json({ 
      message: 'Plugin enabled successfully'
    });
  } catch (error) {
    console.error('Error enabling plugin:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Failed to enable plugin'
    });
  }
});

/**
 * PUT /api/v1/plugins/:pluginId/disable
 * Disable a plugin
 */
router.put('/:pluginId/disable', authMiddleware, async (req, res) => {
  try {
    const { pluginId } = req.params;
    
    await pluginManager.disablePlugin(pluginId);
    
    res.json({ 
      message: 'Plugin disabled successfully'
    });
  } catch (error) {
    console.error('Error disabling plugin:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Failed to disable plugin'
    });
  }
});

/**
 * PUT /api/v1/plugins/:pluginId/update
 * Update a plugin
 */
router.put('/:pluginId/update', authMiddleware, async (req, res) => {
  try {
    const { pluginId } = req.params;
    
    const plugin = await pluginManager.updatePlugin(pluginId);
    
    res.json({ 
      data: plugin,
      message: 'Plugin updated successfully'
    });
  } catch (error) {
    console.error('Error updating plugin:', error);
    res.status(500).json({ 
      error: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Failed to update plugin'
    });
  }
});

export default router;