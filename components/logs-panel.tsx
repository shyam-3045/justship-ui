"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type LogEntry = {
  id: number;
  level: "info" | "error" | "success";
  message: string;
};

type LogsPanelProps = {
  initialLogs: readonly LogEntry[];
  className?: string;
};

const logColorMap: Record<LogEntry["level"], string> = {
  info: "text-blue-600 dark:text-blue-300",
  success: "text-emerald-600 dark:text-emerald-300",
  error: "text-red-600 dark:text-red-300",
};

export function LogsPanel({ initialLogs, className }: LogsPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([...initialLogs]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [logs]);

  useEffect(() => {
    // Placeholder for future WebSocket event stream integration.
    const timer = window.setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          level: "info",
          message: "Waiting for next build event...",
        },
      ]);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  const renderedLogs = useMemo(
    () =>
      logs.map((log) => (
        <p key={log.id} className={cn("leading-6", logColorMap[log.level])}>
          <span className="mr-2 text-muted-foreground">[{log.level}]</span>
          {log.message}
        </p>
      )),
    [logs],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-[360px] overflow-y-auto rounded-2xl border border-border/70 bg-card/60 p-4 font-mono text-sm shadow-inner shadow-black/30",
        className,
      )}
    >
      {renderedLogs}
    </div>
  );
}
