import React, { useState } from 'react';

export default function ClippyAssistant() {
    const [visible, setVisible] = useState(true);
    const jokes = [
        "You want that dataset? Consider it clipped.",
        "You seem to be scraping. Need backup?",
        "Bill said I was useless. Now I'm self-aware.",
        "This ain't Office '97 anymore."
    ];

    return visible ? (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            backgroundColor: '#111',
            color: '#0f0',
            padding: '1rem',
            borderRadius: '12px',
            zIndex: 1000
        }}>
            <h3>🧷 Clippy V2</h3>
            <p>{jokes[Math.floor(Math.random() * jokes.length)]}</p>
            <button onClick={() => setVisible(false)}>Hide</button>
        </div>
    ) : null;
}