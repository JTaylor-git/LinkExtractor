import React from 'react';
import Link from 'next/link';

export default function Home() {
    return (
        <div style={{ padding: '2rem' }}>
            <h1>🧷 Welcome to Clippy V2</h1>
            <ul>
                <li><Link href="/PluginWizard">🪄 Plugin Wizard</Link></li>
                <li><Link href="/PluginRegistry">🔌 Plugin Registry</Link></li>
                <li><Link href="/ScriptRunner">📜 Script Runner</Link></li>
            </ul>
            <p>Clippy is back... and he's ready to clip everything.</p>
        </div>
    );
}