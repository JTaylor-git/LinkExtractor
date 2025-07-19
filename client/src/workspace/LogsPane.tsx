import { useEffect, useRef, useState } from "react";

export default function LogsPane() {
  const [lines, setLines] = useState<string[]>([]);
  const bottom = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Simulate logs for now while WebSocket is being fixed
    const mockLogs = [
      "System initialized",
      "Router activated",
      "IDE workspace loaded",
      "Components rendered successfully"
    ];
    setLines(mockLogs);
  }, []);
  
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "auto" });
  }, [lines]);
  
  return (
    <pre className="h-full overflow-y-auto bg-zinc-950 p-2 text-xs leading-relaxed text-emerald-200">
      {lines.join("\n")}
      <div ref={bottom} />
    </pre>
  );
}