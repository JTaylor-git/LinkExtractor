import express from 'express';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

router.post('/run-script', async (req, res) => {
    const { script } = req.body;
    const tmpFile = path.join('/tmp', `clippy_script_${Date.now()}.py`);
    await fs.writeFile(tmpFile, script);

    exec(`python3 ${tmpFile}`, (error, stdout, stderr) => {
        if (error) return res.json({ output: stderr || error.message });
        res.json({ output: stdout });
    });
});

export default router;