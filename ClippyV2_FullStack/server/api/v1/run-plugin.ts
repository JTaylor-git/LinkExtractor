import express from 'express';
import path from 'path';
import { runPlugin } from '../../engine/plugin-loader';

const router = express.Router();

router.post('/plugins/:pluginId/execute', async (req, res) => {
    const pluginId = req.params.pluginId;
    const input = req.body.input || '';
    try {
        const result = await runPlugin(pluginId, input);
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;