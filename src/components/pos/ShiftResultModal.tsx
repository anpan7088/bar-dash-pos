import { TrendingUp, TrendingDown, Minus, Receipt, CreditCard } from "lucide-react";

interface ShiftResultModalProps {
  staffName: string;
  startingCash: number | null;
  cashRevenue: number;
  cardRevenue: number;
  cashHanded: number;
  onClose: () => void;
}

export function ShiftResultModal({ staffName, startingCash, cashRevenue, cardRevenue, cashHanded, onClose }: ShiftResultModalProps) {
  const diff = cashHanded - cashRevenue;

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
            {cardRevenue > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />Kartični promet</span>
                <span className="font-medium">€{cardRevenue.toFixed(2)}</span>
              </div>
            )}
            {startingCash != null && (
              <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                <span>Menjalnina</span>
                <span className="font-medium">€{startingCash.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex items-center justify-between text-sm font-semibold text-foreground">
              <span>Skupni promet</span>
              <span>€{(cashRevenue + cardRevenue).toFixed(2)}</span>
            </div>
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
