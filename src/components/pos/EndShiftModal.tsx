import { useState } from "react";
import { LogOut, Delete, Banknote } from "lucide-react";

interface EndShiftModalProps {
  staffName: string;
  onConfirm: (cashHanded: number) => void;
  onClose: () => void;
}

export function EndShiftModal({ staffName, onConfirm, onClose }: EndShiftModalProps) {
  const [cashHandedValue, setCashHandedValue] = useState("");

  const handleDigit = (d: string) => {
    if (cashHandedValue.length < 8) setCashHandedValue((v) => v + d);
  };

  const handleDot = () => {
    if (!cashHandedValue.includes(".")) setCashHandedValue((v) => v + ".");
  };

  const handleDelete = () => setCashHandedValue((v) => v.slice(0, -1));

  const handleSubmit = () => {
    const ch = parseFloat(cashHandedValue);
    if (isNaN(ch) || ch < 0) return;
    onConfirm(ch);
  };

  const canSubmit = cashHandedValue && parseFloat(cashHandedValue) >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-destructive/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Konec izmene</h2>
              <p className="text-xs text-muted-foreground">{staffName}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="w-full flex items-center gap-2 rounded-xl px-4 py-3 bg-primary/10 border-2 border-primary">
            <Banknote className="w-5 h-5 text-primary" />
            <div className="flex-1 text-left">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gotovina v blagajni</p>
              <span className="text-xl font-bold tabular-nums">
                {cashHandedValue || "0"}
              </span>
            </div>
            <span className="text-lg text-muted-foreground">€</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="h-14 rounded-xl bg-secondary border border-border text-lg font-bold hover:bg-secondary/80 active:scale-95 transition-all"
              >
                {d}
              </button>
            ))}
            <button
              onClick={handleDot}
              className="h-14 rounded-xl bg-secondary border border-border text-lg font-bold hover:bg-secondary/80 active:scale-95 transition-all"
            >
              .
            </button>
            <button
              onClick={() => handleDigit("0")}
              className="h-14 rounded-xl bg-secondary border border-border text-lg font-bold hover:bg-secondary/80 active:scale-95 transition-all"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-14 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 active:scale-95 transition-all"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-secondary text-sm font-semibold hover:bg-secondary/80 transition-colors"
            >
              Prekliči
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
            >
              Odjava
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
