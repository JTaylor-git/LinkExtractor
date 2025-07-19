import WebSocket from 'ws';

export function setupJobWS(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', function connection(ws) {
        ws.send(JSON.stringify({ type: 'info', message: 'Connected to Clippy Job Tracker' }));
    });

    return wss;
}