import { Clock, Coffee } from "lucide-react";
import { useEffect, useState } from "react";

export function POSHeader() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Coffee className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight">CaféPOS</h1>
          <p className="text-[11px] text-muted-foreground">Bar & Café System</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium tabular-nums">
          {time.toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span className="text-xs hidden sm:inline">
          {time.toLocaleDateString("sl-SI", { weekday: "short", day: "numeric", month: "short" })}
        </span>
      </div>
    </header>
  );
}
