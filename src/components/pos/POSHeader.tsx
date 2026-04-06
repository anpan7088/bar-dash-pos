import { Clock, Coffee, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface POSHeaderProps {
  staffName?: string;
  staffRole?: string;
}

export function POSHeader({ staffName, staffRole }: POSHeaderProps) {
  const { logout } = useAuth();
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

      <div className="flex items-center gap-4">
        {staffName && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium leading-tight">{staffName}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{staffRole}</p>
            </div>
            <button
              onClick={logout}
              className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-destructive/20 hover:text-destructive transition-colors"
              title="Odjava"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium tabular-nums">
            {time.toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="text-xs hidden sm:inline">
            {time.toLocaleDateString("sl-SI", { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>
      </div>
    </header>
  );
}
