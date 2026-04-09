import { useState } from "react";
import { LogOut, DollarSign, Delete, TrendingUp, TrendingDown, Minus, Banknote, Receipt } from "lucide-react";

interface EndShiftModalProps {
  staffName: string;
  startingCash: number | null;
  onConfirm: (cashRevenue: number, cashHanded: number) => void;
  onClose: () => void;
}

type InputField = "cashRevenue" | "cashHanded";

export function EndShiftModal({ staffName, startingCash, onConfirm, onClose }: EndShiftModalProps) {
  const [cashRevenueValue, setCashRevenueValue] = useState("");
  const [cashHandedValue, setCashHandedValue] = useState("");
  const [activeField, setActiveField] = useState<InputField>("cashRevenue");

  const activeValue = activeField === "cashRevenue" ? cashRevenueValue : cashHandedValue;
  const setActiveValue = activeField === "cashRevenue" ? setCashRevenueValue : setCashHandedValue;

  const handleDigit = (d: string) => {
    if (activeValue.length < 8) setActiveValue((v) => v + d);
  };

  const handleDot = () => {
    if (!activeValue.includes(".")) setActiveValue((v) => v + ".");
  };

  const handleDelete = () => setActiveValue((v) => v.slice(0, -1));

  const handleSubmit = () => {
    const cr = parseFloat(cashRevenueValue);
    const ch = parseFloat(cashHandedValue);
    if (isNaN(cr) || cr < 0 || isNaN(ch) || ch < 0) return;
    onConfirm(cr, ch);
  };

  const cashRevenue = parseFloat(cashRevenueValue) || 0;
  const cashHanded = parseFloat(cashHandedValue) || 0;
  const diff = cashRevenue - cashHanded;

  const canSubmit = cashRevenueValue && cashHandedValue && parseFloat(cashRevenueValue) >= 0 && parseFloat(cashHandedValue) >= 0;

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

        <div className="p-5 space-y-4">
          {/* Two input fields */}
          <div className="space-y-2">
            {/* Cash Revenue */}
            <button
              onClick={() => setActiveField("cashRevenue")}
              className={`w-full flex items-center gap-2 rounded-xl px-4 py-3 transition-all ${
                activeField === "cashRevenue"
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-secondary border-2 border-transparent"
              }`}
            >
              <Receipt className={`w-5 h-5 ${activeField === "cashRevenue" ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1 text-left">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gotovinski promet</p>
                <span className="text-xl font-bold tabular-nums">
                  {cashRevenueValue || "0"}
                </span>
              </div>
              <span className="text-lg text-muted-foreground">€</span>
            </button>

            {/* Cash Handed */}
            <button
              onClick={() => setActiveField("cashHanded")}
              className={`w-full flex items-center gap-2 rounded-xl px-4 py-3 transition-all ${
                activeField === "cashHanded"
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-secondary border-2 border-transparent"
              }`}
            >
              <Banknote className={`w-5 h-5 ${activeField === "cashHanded" ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1 text-left">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Oddana gotovina</p>
                <span className="text-xl font-bold tabular-nums">
                  {cashHandedValue || "0"}
                </span>
              </div>
              <span className="text-lg text-muted-foreground">€</span>
            </button>
          </div>

          {/* Difference display */}
          <div className="bg-secondary/50 rounded-xl px-4 py-3 space-y-1.5">
            {startingCash != null && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Menjalnina</span>
                <span className="font-medium">€{startingCash.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Gotovinski promet</span>
              <span className="font-medium">€{cashRevenue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Oddana gotovina</span>
              <span className="font-medium">€{cashHanded.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Razlika</span>
              <div className="flex items-center gap-1">
                {diff > 0 && <TrendingUp className="w-3.5 h-3.5 text-green-500" />}
                {diff < 0 && <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                {diff === 0 && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
                <span
                  className={`text-sm font-bold ${
                    diff > 0 ? "text-green-500" : diff < 0 ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {diff > 0 ? "+" : ""}€{diff.toFixed(2)}
                </span>
              </div>
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
              disabled={!canSubmit}
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
