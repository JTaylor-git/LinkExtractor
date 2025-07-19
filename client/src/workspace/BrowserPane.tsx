import { useState } from "react";

export default function BrowserPane() {
  const [url, setUrl] = useState("https://example.com");
  
  return (
    <div className="flex h-full flex-col">
      <form 
        onSubmit={e => {
          e.preventDefault();
          setUrl((e.currentTarget.elements[0] as HTMLInputElement).value);
        }}
        className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-2 py-1"
      >
        <input 
          defaultValue={url} 
          className="w-full rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100" 
        />
        <button className="rounded bg-emerald-500 px-2 py-1 text-xs text-zinc-900">
          Go
        </button>
      </form>
      <iframe 
        title="browser" 
        src={url} 
        className="flex-1 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}