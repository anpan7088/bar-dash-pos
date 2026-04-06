import { OrderItem } from "@/types/pos";
import { Minus, Plus, Trash2 } from "lucide-react";

interface OrderPanelProps {
  tableName: string;
  items: OrderItem[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onPay: () => void;
  onBack: () => void;
}

export function OrderPanel({ tableName, items, onUpdateQty, onRemove, onPay, onBack }: OrderPanelProps) {
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div className="flex flex-col h-full border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-bold text-lg">{tableName}</h3>
          <span className="text-xs text-muted-foreground">{items.length} item(s)</span>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Tables
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">
            Tap products to add to order
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.product.name}</p>
              <p className="text-xs text-muted-foreground">
                €{item.product.price.toFixed(2)} each
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateQty(item.product.id, -1)}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-muted hover:bg-muted/80 active:scale-90 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
              <button
                onClick={() => onUpdateQty(item.product.id, 1)}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-muted hover:bg-muted/80 active:scale-90 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-sm font-bold w-14 text-right">
              €{(item.product.price * item.quantity).toFixed(2)}
            </span>

            <button
              onClick={() => onRemove(item.product.id)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 active:scale-90 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">€{total.toFixed(2)}</span>
        </div>
        <button
          onClick={onPay}
          disabled={items.length === 0}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
        >
          Pay €{total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
