import { Product } from "@/types/pos";
import { products } from "@/data/products";

interface ProductGridProps {
  category: string;
  onAddProduct: (product: Product) => void;
}

export function ProductGrid({ category, onAddProduct }: ProductGridProps) {
  const filtered = products.filter((p) => p.category === category);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
      {filtered.map((product) => (
        <button
          key={product.id}
          onClick={() => onAddProduct(product)}
          className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all active:scale-95"
        >
          <span className="text-2xl">{product.emoji}</span>
          <span className="text-sm font-semibold text-center leading-tight">{product.name}</span>
          <span className="text-primary font-bold text-sm">€{product.price.toFixed(2)}</span>
        </button>
      ))}
    </div>
  );
}
