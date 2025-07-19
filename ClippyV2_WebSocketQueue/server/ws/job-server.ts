import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

const jobs = new Map();

export function setupJobServer(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        ws.send(JSON.stringify({ type: "init", message: "Connected to Clippy Job Queue" }));

        ws.on('message', async (data) => {
            try {
                const { pluginId, input } = JSON.parse(data.toString());
                const id = uuidv4();
                const job = { id, pluginId, input, status: "queued", result: null };
                jobs.set(id, job);

                ws.send(JSON.stringify({ type: "job_queued", id }));

                setTimeout(async () => {
                    job.status = "running";
                    ws.send(JSON.stringify({ type: "job_started", id }));

                    try {
                        const { runPlugin } = await import("../engine/plugin-loader");
                        const result = await runPlugin(pluginId, input);
                        job.status = "complete";
                        job.result = result;
                        ws.send(JSON.stringify({ type: "job_complete", id, result }));
                    } catch (err) {
                        job.status = "error";
                        ws.send(JSON.stringify({ type: "job_error", id, error: err.message }));
                    }
                }, 1000);
            } catch (e) {
                ws.send(JSON.stringify({ type: "error", message: "Bad request" }));
            }
        });
    });

    return wss;
}