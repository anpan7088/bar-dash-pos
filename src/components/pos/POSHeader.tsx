import { Clock, Coffee, LogOut, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { EndShiftModal } from "./EndShiftModal";

interface POSHeaderProps {
  staffName?: string;
  staffRole?: string;
}

function ShiftTimer({ clockInTime }: { clockInTime: Date }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - clockInTime.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [clockInTime]);

  return (
    <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg">
      <Timer className="w-3.5 h-3.5" />
      <span className="font-medium tabular-nums">{elapsed}</span>
    </div>
  );
}

export function POSHeader({ staffName, staffRole }: POSHeaderProps) {
  const { logout, clockInTime, profile, startingCash } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showEndShift, setShowEndShift] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEndShift = async (revenue: number) => {
    await logout(revenue);
    setShowEndShift(false);
  };

  return (
    <>
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

        <div className="flex items-center gap-3">
          {staffName && (
            <div className="flex items-center gap-2">
              {clockInTime && <ShiftTimer clockInTime={clockInTime} />}
              <button
                onClick={() => navigate("/hours")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors hidden sm:block"
                title="Pregled ur"
              >
                Ure
              </button>
              <div className="text-right">
                <p className="text-sm font-medium leading-tight">{staffName}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{staffRole}</p>
              </div>
              <button
                onClick={() => setShowEndShift(true)}
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

      {showEndShift && staffName && (
        <EndShiftModal
          staffName={staffName}
          startingCash={startingCash}
          onConfirm={handleEndShift}
          onClose={() => setShowEndShift(false)}
        />
      )}
    </>
  );
}
