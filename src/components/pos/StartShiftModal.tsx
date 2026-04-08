import { useState } from "react";
import { Banknote, Delete, LogIn } from "lucide-react";

interface StartShiftModalProps {
  staffName: string;
  onConfirm: (startingCash: number) => void;
}

export function StartShiftModal({ staffName, onConfirm }: StartShiftModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border bg-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Začetek izmene</h2>
              <p className="text-xs text-muted-foreground">{staffName}</p>
            </div>
          </div>
        </div>

        {/* Starting cash input */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Menjalnina (€)</label>
            <div className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-3">
              <Banknote className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold tabular-nums flex-1">
                {value || "0"}
              </span>
              <span className="text-lg text-muted-foreground">€</span>
            </div>
          </div>

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

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!value || parseFloat(value) < 0}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Začni izmeno
          </button>
        </div>
      </div>
    </div>
  );
}
