"use client";

import { useEffect, useState } from "react";
import { healthCheck, API_URL } from "../lib/api";
import { cn } from "../lib/utils";

type Status = "checking" | "online" | "offline";

export function StatusIndicator() {
  const [status, setStatus] = useState<Status>("checking");
  const [service, setService] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const data = await healthCheck();
        if (!cancelled) {
          setStatus("online");
          setService(data.service);
        }
      } catch {
        if (!cancelled) setStatus("offline");
      }
    }
    poll();
    const id = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const dot = {
    checking: "bg-muted animate-pulse",
    online: "bg-success",
    offline: "bg-danger",
  }[status];

  const label = {
    checking: "Connecting",
    online: "Online",
    offline: "Offline",
  }[status];

  return (
    <div
      className="flex items-center gap-1.5 text-xs text-muted"
      title={`${API_URL}${service ? ` · ${service}` : ""}`}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      <span>{label}</span>
    </div>
  );
}
