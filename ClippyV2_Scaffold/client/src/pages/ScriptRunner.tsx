import React, { useState } from 'react';

export default function ScriptRunner() {
    const [script, setScript] = useState(`# Example Python Script
print("Hello from Clippy!")`);
    const [output, setOutput] = useState("");

    const runScript = async () => {
        const res = await fetch('/api/v1/run-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ script })
        });
        const data = await res.json();
        setOutput(data.output);
    };

    return (
        <div>
            <h1>Python Runner</h1>
            <textarea rows={10} cols={80} value={script} onChange={e => setScript(e.target.value)} />
            <button onClick={runScript}>Run</button>
            <pre>{output}</pre>
        </div>
    );
}