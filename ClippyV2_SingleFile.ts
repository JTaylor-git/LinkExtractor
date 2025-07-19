import express from 'express';
import bodyParser from 'body-parser';
import WebSocket from 'ws';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = require('http').createServer(app);
const PORT = 3000;
const jobs = new Map();

app.use(bodyParser.json());

// REST: Run plugin
app.post('/api/v1/plugins/:pluginId/execute', async (req, res) => {
    try {
        const result = await runPlugin(req.params.pluginId, req.body.input);
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// WebSocket for jobs
const wss = new WebSocket.Server({ server });
wss.on('connection', ws => {
    ws.send(JSON.stringify({ type: "init", message: "Connected" }));
    ws.on('message', async (msg) => {
        const { pluginId, input } = JSON.parse(msg.toString());
        const id = uuidv4();
        jobs.set(id, { id, pluginId, input, status: "queued" });
        ws.send(JSON.stringify({ type: "job_queued", id }));

        setTimeout(async () => {
            try {
                ws.send(JSON.stringify({ type: "job_started", id }));
                const result = await runPlugin(pluginId, input);
                ws.send(JSON.stringify({ type: "job_complete", id, result }));
            } catch (err) {
                ws.send(JSON.stringify({ type: "job_error", id, error: err.message }));
            }
        }, 1000);
    });
});

// In-memory plugin loader
async function runPlugin(pluginId, input) {
    const dir = path.resolve(__dirname, 'plugins', pluginId);
    const manifest = JSON.parse(await fs.readFile(path.join(dir, 'manifest.json'), 'utf8'));
    const pluginPath = path.join(dir, manifest.entry || 'script.ts');
    const { default: plugin } = await import(pluginPath);
    if (typeof plugin !== 'function') throw new Error('Invalid plugin');
    return plugin(input);
}

// Simple HTML UI
app.get('/', (req, res) => {
    res.send(\`
        <html><body><h1>🧷 Clippy Runner</h1>
        <form action="/api/v1/plugins/example-plugin/execute" method="POST">
        <textarea name="input">hello</textarea>
        <button type="submit">Run Plugin</button>
        </form></body></html>
    \`);
});

server.listen(PORT, () => console.log("Clippy V2 on http://localhost:" + PORT));