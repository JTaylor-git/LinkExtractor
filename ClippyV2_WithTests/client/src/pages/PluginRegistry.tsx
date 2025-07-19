import React, { useState, useEffect } from 'react';

export default function PluginRegistry() {
    const [plugins, setPlugins] = useState([]);

    useEffect(() => {
        fetch('/api/v1/plugins/list')
            .then(res => res.json())
            .then(data => setPlugins(data.plugins || []));
    }, []);

    return (
        <div style={{ padding: '1rem' }}>
            <h1>🔌 Plugin Registry</h1>
            <ul>
                {plugins.map(p => (
                    <li key={p.id} style={{ marginBottom: '1rem' }}>
                        <strong>{p.name}</strong>: {p.description}
                        <br />
                        <button onClick={() => navigator.clipboard.writeText(p.id)}>
                            Copy Plugin ID
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}