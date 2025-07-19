import React, { useState, useEffect } from 'react';

export default function PluginWizard() {
    const [pluginId, setPluginId] = useState("example-plugin");
    const [input, setInput] = useState("<td>One</td><td>Two</td>");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const runPlugin = async () => {
        setLoading(true);
        const res = await fetch(`/api/v1/plugins/${pluginId}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input })
        });
        const data = await res.json();
        setResult(data.result || data.error);
        setLoading(false);
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h1>🧙 Clippy Plugin Wizard</h1>
            <label>
                Plugin ID:
                <input type="text" value={pluginId} onChange={e => setPluginId(e.target.value)} />
            </label>
            <br />
            <label>
                Input:
                <textarea rows={5} cols={60} value={input} onChange={e => setInput(e.target.value)} />
            </label>
            <br />
            <button onClick={runPlugin} disabled={loading}>
                {loading ? "Running..." : "Run Plugin"}
            </button>
            <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
    );
}