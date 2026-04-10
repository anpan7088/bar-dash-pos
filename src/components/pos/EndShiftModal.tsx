import { useState } from "react";
import { LogOut, Delete, Banknote, CheckCircle, TrendingUp, TrendingDown, Minus, Receipt } from "lucide-react";

interface EndShiftModalProps {
  staffName: string;
  startingCash: number | null;
  cashRevenue: number;
  onConfirm: (cashHanded: number) => void;
  onClose: () => void;
}

export function EndShiftModal({ staffName, startingCash, cashRevenue, onConfirm, onClose }: EndShiftModalProps) {
  const [step, setStep] = useState<"input" | "result">("input");
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
    setStep("result");
  };

  const cashHanded = parseFloat(cashHandedValue) || 0;
  const diff = cashHanded - cashRevenue;
  const canSubmit = cashHandedValue && parseFloat(cashHandedValue) >= 0;

  if (step === "result") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Obračun izmene</h2>
                <p className="text-xs text-muted-foreground">{staffName}</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="bg-secondary/50 rounded-xl px-4 py-3 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Gotovinski promet (računi)</span>
                <span className="font-medium">€{cashRevenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Oddana gotovina</span>
                <span className="font-medium">€{cashHanded.toFixed(2)}</span>
              </div>
              {startingCash != null && (
                <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                  <span>Menjalnina</span>
                  <span className="font-medium">€{startingCash.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="rounded-xl border-2 px-5 py-4 flex flex-col items-center gap-1"
              style={{
                borderColor: Math.abs(diff) < 0.005 ? 'hsl(var(--primary))' : diff > 0 ? '#22c55e' : 'hsl(var(--destructive))',
                background: Math.abs(diff) < 0.005 ? 'hsl(var(--primary) / 0.1)' : diff > 0 ? 'rgba(34,197,94,0.1)' : 'hsl(var(--destructive) / 0.1)',
              }}
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {diff > 0.005 && <TrendingUp className="w-4 h-4 text-green-500" />}
                {diff < -0.005 && <TrendingDown className="w-4 h-4 text-destructive" />}
                {Math.abs(diff) < 0.005 && <Minus className="w-4 h-4 text-primary" />}
                <span>Razlika</span>
              </div>
              <span
                className={`text-2xl font-bold ${
                  Math.abs(diff) < 0.005 ? "text-primary" : diff > 0 ? "text-green-500" : "text-destructive"
                }`}
              >
                {diff > 0 ? "+" : ""}€{diff.toFixed(2)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {Math.abs(diff) < 0.005 ? "Promet se ujema ✓" : diff > 0 ? "Višek gotovine" : "Manko gotovine"}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-secondary text-sm font-semibold hover:bg-secondary/80 transition-colors"
            >
              Zapri
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              Naprej
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
