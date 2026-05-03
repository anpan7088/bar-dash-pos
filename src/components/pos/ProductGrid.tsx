import { Product } from "@/types/pos";
import { DBProduct } from "@/hooks/useProducts";
import { AlertTriangle } from "lucide-react";

interface ProductGridProps {
  category: string;
  products: DBProduct[];
  onAddProduct: (product: Product) => void;
}

export function ProductGrid({ category, products, onAddProduct }: ProductGridProps) {
  const filtered = products.filter((p) => p.category === category && p.active);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
      {filtered.map((product) => {
        const out = product.stock <= 0;
        const low = !out && product.stock <= product.lowStockThreshold;
        return (
          <button
            key={product.id}
            disabled={out}
            onClick={() => onAddProduct(product)}
            className="relative flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {(low || out) && (
              <span
                className={`absolute top-1.5 right-1.5 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  out ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                }`}
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                {out ? "0" : product.stock}
              </span>
            )}
            <span className="text-2xl">{product.emoji}</span>
            <span className="text-sm font-semibold text-center leading-tight">{product.name}</span>
            <span className="text-primary font-bold text-sm">€{product.price.toFixed(2)}</span>
            {!low && !out && (
              <span className="text-[10px] text-muted-foreground">Zaloga: {product.stock}</span>
            )}
          </button>
        );
      })}
      {filtered.length === 0 && (
        <p className="col-span-full text-center text-muted-foreground text-sm py-8">
          Ni izdelkov v tej kategoriji
        </p>
      )}
    </div>
  );
}
