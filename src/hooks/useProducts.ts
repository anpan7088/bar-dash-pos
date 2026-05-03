import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product, OrderItem } from "@/types/pos";

export interface DBProduct extends Product {
  stock: number;
  lowStockThreshold: number;
  active: boolean;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  coffee: { label: "Coffee", emoji: "☕" },
  drinks: { label: "Drinks", emoji: "🥤" },
  cocktails: { label: "Cocktails", emoji: "🍸" },
  beer: { label: "Beer & Wine", emoji: "🍺" },
  food: { label: "Food", emoji: "🍕" },
  desserts: { label: "Desserts", emoji: "🍰" },
};

function mapRow(r: any): DBProduct {
  return {
    id: r.id,
    name: r.name,
    price: Number(r.price),
    category: r.category,
    emoji: r.emoji,
    stock: r.stock,
    lowStockThreshold: r.low_stock_threshold,
    active: r.active,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("category")
      .order("name");
    if (data) setProducts(data.map(mapRow));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
    const channel = supabase
      .channel("products-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  const categories = Array.from(new Set(products.filter((p) => p.active).map((p) => p.category))).map(
    (id) => ({ id, ...(CATEGORY_LABELS[id] ?? { label: id, emoji: "📦" }) })
  );

  const decrementStockForOrder = useCallback(async (items: OrderItem[], userId?: string) => {
    for (const item of items) {
      const current = products.find((p) => p.id === item.product.id);
      const currentStock = current?.stock ?? item.product.stock ?? 0;
      const newStock = Math.max(0, currentStock - item.quantity);
      await supabase.from("products").update({ stock: newStock }).eq("id", item.product.id);
      await supabase.from("stock_movements").insert({
        product_id: item.product.id,
        change: -item.quantity,
        reason: "sale",
        user_id: userId ?? null,
      });
    }
    fetchProducts();
  }, [products, fetchProducts]);

  return { products, loading, categories, fetchProducts, decrementStockForOrder };
}
