import React, { useEffect, useState } from 'react';

export default function JobDashboard() {
    const [jobs, setJobs] = useState({});
    const wsRef = React.useRef(null);

    useEffect(() => {
        wsRef.current = new WebSocket('ws://localhost:3000');
        wsRef.current.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type.startsWith("job_")) {
                setJobs(prev => ({
                    ...prev,
                    [msg.id]: { ...prev[msg.id], ...msg }
                }));
            }
        };
        return () => wsRef.current.close();
    }, []);

    const submitJob = () => {
        const pluginId = prompt("Plugin ID?");
        const input = prompt("Input?");
        wsRef.current.send(JSON.stringify({ pluginId, input }));
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h1>📊 Job Dashboard</h1>
            <button onClick={submitJob}>Submit Job</button>
            <ul>
                {Object.entries(jobs).map(([id, job]) => (
                    <li key={id}>
                        <strong>{job.pluginId}</strong> – {job.status}
                        {job.result && <pre>{JSON.stringify(job.result, null, 2)}</pre>}
                    </li>
                ))}
            </ul>
        </div>
    );
}