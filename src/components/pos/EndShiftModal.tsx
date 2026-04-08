import { useState } from "react";
import { LogOut, DollarSign, Delete, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface EndShiftModalProps {
  staffName: string;
  startingCash: number | null;
  onConfirm: (revenue: number) => void;
  onClose: () => void;
}

export function EndShiftModal({ staffName, startingCash, onConfirm, onClose }: EndShiftModalProps) {
  const [value, setValue] = useState("");

  const handleDigit = (d: string) => {
    if (value.length < 8) setValue((v) => v + d);
  };

  const handleDot = () => {
    if (!value.includes(".")) setValue((v) => v + ".");
  };

  const handleDelete = () => setValue((v) => v.slice(0, -1));

  const handleSubmit = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    onConfirm(num);
  };

  const revenue = parseFloat(value) || 0;
  const diff = startingCash != null ? revenue - startingCash : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden">
        {/* Header */}
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

        {/* Revenue input */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Promet izmene (€)</label>
            <div className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold tabular-nums flex-1">
                {value || "0"}
              </span>
              <span className="text-lg text-muted-foreground">€</span>
            </div>
          </div>

          {/* Difference display */}
          {startingCash != null && (
            <div className="bg-secondary/50 rounded-xl px-4 py-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Menjalnina</span>
                <span className="font-medium">€{startingCash.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Promet</span>
                <span className="font-medium">€{revenue.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Razlika</span>
                <div className="flex items-center gap-1">
                  {diff != null && diff > 0 && <TrendingUp className="w-3.5 h-3.5 text-green-500" />}
                  {diff != null && diff < 0 && <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                  {diff != null && diff === 0 && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span
                    className={`text-sm font-bold ${
                      diff != null && diff > 0
                        ? "text-green-500"
                        : diff != null && diff < 0
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {diff != null && diff > 0 ? "+" : ""}
                    €{diff != null ? diff.toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Numpad */}
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

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-secondary text-sm font-semibold hover:bg-secondary/80 transition-colors"
            >
              Prekliči
            </button>
            <button
              onClick={handleSubmit}
              disabled={!value || parseFloat(value) < 0}
              className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
            >
              Odjavi se
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
