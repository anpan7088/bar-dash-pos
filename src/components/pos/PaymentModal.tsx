import { PaymentMethod } from "@/types/pos";
import { CreditCard, Banknote, Split, X, Check } from "lucide-react";
import { useState } from "react";

interface PaymentModalProps {
  total: number;
  tableName: string;
  onConfirm: (method: PaymentMethod) => void;
  onClose: () => void;
}

const methods: { id: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "split", label: "Split", icon: Split },
];

export function PaymentModal({ total, tableName, onConfirm, onClose }: PaymentModalProps) {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!selected) return;
    setConfirmed(true);
    setTimeout(() => onConfirm(selected), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md mx-4 overflow-hidden">
        {confirmed ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-success" />
            </div>
            <p className="text-lg font-bold">Payment Confirmed!</p>
            <p className="text-muted-foreground text-sm">{tableName} • €{total.toFixed(2)}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="text-lg font-bold">Payment</h3>
                <p className="text-sm text-muted-foreground">{tableName}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-center text-3xl font-extrabold text-primary mb-6">
                €{total.toFixed(2)}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all active:scale-95 ${
                      selected === m.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <m.icon className={`w-6 h-6 ${selected === m.id ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm font-semibold">{m.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                disabled={!selected}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
              >
                Confirm Payment
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
