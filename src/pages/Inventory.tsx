import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useProducts, DBProduct } from "@/hooks/useProducts";
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, History, AlertTriangle, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Movement {
  id: string;
  product_id: string;
  change: number;
  reason: string;
  created_at: string;
  note: string | null;
  user_id: string | null;
}

const CATEGORY_OPTIONS = [
  { id: "coffee", label: "Coffee ☕" },
  { id: "drinks", label: "Drinks 🥤" },
  { id: "cocktails", label: "Cocktails 🍸" },
  { id: "beer", label: "Beer & Wine 🍺" },
  { id: "food", label: "Food 🍕" },
  { id: "desserts", label: "Desserts 🍰" },
];

export default function Inventory() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isManager = profile?.role === "manager" || profile?.role === "admin";
  const { products, fetchProducts } = useProducts();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "coffee",
    emoji: "📦",
    stock: "",
    low_stock_threshold: "10",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    category: "",
    emoji: "",
    low_stock_threshold: "",
    active: true,
  });

  useEffect(() => {
    if (!profile) {
      navigate("/");
      return;
    }
    if (!isManager) {
      toast.error("Samo manager ali admin lahko upravlja zalogo");
      navigate("/");
    }
  }, [profile, isManager, navigate]);

  useEffect(() => {
    if (!showHistory) return;
    supabase
      .from("stock_movements")
      .select("*")
      .eq("product_id", showHistory)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setMovements((data as Movement[]) ?? []));
  }, [showHistory]);

  const reset = () => {
    setForm({ name: "", price: "", category: "coffee", emoji: "📦", stock: "", low_stock_threshold: "10" });
    setAdding(false);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.price || !form.category) {
      toast.error("Izpolni ime, ceno in kategorijo");
      return;
    }
    setBusy(true);
    const stockNum = parseInt(form.stock || "0", 10);
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: form.name.trim(),
        price: parseFloat(form.price),
        category: form.category,
        emoji: form.emoji || "📦",
        stock: stockNum,
        low_stock_threshold: parseInt(form.low_stock_threshold || "10", 10),
      })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      setBusy(false);
      return;
    }
    if (data && stockNum > 0) {
      await supabase.from("stock_movements").insert({
        product_id: data.id,
        change: stockNum,
        reason: "create",
        user_id: profile?.user_id,
        note: "Začetna zaloga",
      });
    }
    toast.success("Izdelek dodan");
    reset();
    fetchProducts();
    setBusy(false);
  };

  const startEdit = (p: DBProduct) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      price: String(p.price),
      category: p.category,
      emoji: p.emoji,
      low_stock_threshold: String(p.lowStockThreshold),
      active: p.active,
    });
  };

  const handleSaveEdit = async (p: DBProduct) => {
    setBusy(true);
    const { error } = await supabase
      .from("products")
      .update({
        name: editForm.name.trim(),
        price: parseFloat(editForm.price),
        category: editForm.category,
        emoji: editForm.emoji,
        low_stock_threshold: parseInt(editForm.low_stock_threshold, 10),
        active: editForm.active,
      })
      .eq("id", p.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Posodobljeno");
    setEditingId(null);
    fetchProducts();
  };

  const handleDelete = async (p: DBProduct) => {
    if (!confirm(`Izbriši "${p.name}"? Vsa zgodovina zaloge bo izgubljena.`)) return;
    setBusy(true);
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Izbrisano");
    fetchProducts();
  };

  const handleRestock = async (p: DBProduct) => {
    const amt = parseInt(restockAmount, 10);
    if (!amt || isNaN(amt)) {
      toast.error("Vnesi količino");
      return;
    }
    setBusy(true);
    const newStock = Math.max(0, p.stock + amt);
    await supabase.from("products").update({ stock: newStock }).eq("id", p.id);
    await supabase.from("stock_movements").insert({
      product_id: p.id,
      change: amt,
      reason: amt > 0 ? "restock" : "adjustment",
      user_id: profile?.user_id,
    });
    toast.success(`Zaloga posodobljena (${amt > 0 ? "+" : ""}${amt})`);
    setRestockId(null);
    setRestockAmount("");
    fetchProducts();
    setBusy(false);
  };

  if (!profile || !isManager) return null;

  const lowStock = products.filter((p) => p.active && p.stock <= p.lowStockThreshold);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-border bg-card/50">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Inventar</h1>
          <p className="text-xs text-muted-foreground">Upravljanje zaloge in izdelkov</p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5 hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> Dodaj izdelek
          </button>
        )}
      </header>

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        {lowStock.length > 0 && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-primary mb-1">
                {lowStock.length} izdelkov ima nizko zalogo
              </p>
              <p className="text-xs text-muted-foreground">
                {lowStock.map((p) => `${p.name} (${p.stock})`).join(", ")}
              </p>
            </div>
          </div>
        )}

        {adding && (
          <div className="bg-card border border-primary/40 rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Nov izdelek
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Ime"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="col-span-2 h-10 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                placeholder="Cena (€)"
                type="number"
                step="0.10"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="h-10 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                placeholder="Emoji"
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-10 rounded-lg bg-background border border-border px-3 text-sm"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                placeholder="Začetna zaloga"
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="h-10 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                placeholder="Prag opozorila"
                type="number"
                value={form.low_stock_threshold}
                onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                className="col-span-2 h-10 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="flex-1 h-10 rounded-lg bg-secondary text-sm font-semibold hover:bg-secondary/80"
              >
                Prekliči
              </button>
              <button
                onClick={handleCreate}
                disabled={busy}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 disabled:opacity-40"
              >
                Ustvari
              </button>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Ni izdelkov</div>
          ) : (
            products.map((p) => {
              const isEdit = editingId === p.id;
              const isRestock = restockId === p.id;
              const out = p.stock <= 0;
              const low = !out && p.stock <= p.lowStockThreshold;
              return (
                <div key={p.id} className="p-3">
                  {isEdit ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="col-span-2 h-9 rounded-lg bg-background border border-border px-3 text-sm"
                        />
                        <input
                          type="number"
                          step="0.10"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          className="h-9 rounded-lg bg-background border border-border px-3 text-sm"
                        />
                        <input
                          value={editForm.emoji}
                          onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                          className="h-9 rounded-lg bg-background border border-border px-3 text-sm text-center"
                        />
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="h-9 rounded-lg bg-background border border-border px-2 text-sm"
                        >
                          {CATEGORY_OPTIONS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Prag"
                          value={editForm.low_stock_threshold}
                          onChange={(e) =>
                            setEditForm({ ...editForm, low_stock_threshold: e.target.value })
                          }
                          className="h-9 rounded-lg bg-background border border-border px-3 text-sm"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={editForm.active}
                          onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                        />
                        Aktiven (viden v POS)
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 h-9 rounded-lg bg-secondary text-sm font-semibold flex items-center justify-center gap-1"
                        >
                          <X className="w-4 h-4" /> Prekliči
                        </button>
                        <button
                          onClick={() => handleSaveEdit(p)}
                          disabled={busy}
                          className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-1 disabled:opacity-40"
                        >
                          <Save className="w-4 h-4" /> Shrani
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                        {p.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {p.name}{" "}
                          {!p.active && (
                            <span className="text-[10px] text-muted-foreground">(skrit)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {p.category} · €{p.price.toFixed(2)}
                        </p>
                      </div>
                      <div
                        className={`text-right px-2 py-1 rounded-md ${
                          out
                            ? "bg-destructive/10 text-destructive"
                            : low
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary"
                        }`}
                      >
                        <p className="text-[10px] uppercase tracking-wider">Zaloga</p>
                        <p className="text-sm font-bold tabular-nums">{p.stock}</p>
                      </div>
                      <button
                        onClick={() => {
                          setRestockId(p.id);
                          setRestockAmount("");
                        }}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                        title="Dopolni zalogo"
                      >
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => setShowHistory(p.id)}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                        title="Zgodovina"
                      >
                        <History className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => startEdit(p)}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                        title="Uredi"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-destructive/20 hover:text-destructive"
                        title="Izbriši"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {isRestock && (
                    <div className="mt-3 flex gap-2 items-center bg-secondary/50 rounded-lg p-2">
                      <input
                        type="number"
                        autoFocus
                        placeholder="+/- količina"
                        value={restockAmount}
                        onChange={(e) => setRestockAmount(e.target.value)}
                        className="flex-1 h-9 rounded-lg bg-background border border-border px-3 text-sm"
                      />
                      <button
                        onClick={() => {
                          setRestockId(null);
                          setRestockAmount("");
                        }}
                        className="h-9 px-3 rounded-lg bg-secondary text-sm font-semibold"
                      >
                        Prekliči
                      </button>
                      <button
                        onClick={() => handleRestock(p)}
                        disabled={busy}
                        className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-bold disabled:opacity-40"
                      >
                        Potrdi
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {showHistory && (
        <div
          onClick={() => setShowHistory(null)}
          className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold">Zgodovina sprememb</h3>
              <button
                onClick={() => setShowHistory(null)}
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {movements.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">Ni zapisov</p>
              ) : (
                movements.map((m) => (
                  <div key={m.id} className="p-3 flex items-center gap-3 text-sm">
                    <span
                      className={`font-bold tabular-nums w-12 text-right ${
                        m.change > 0 ? "text-green-500" : "text-destructive"
                      }`}
                    >
                      {m.change > 0 ? "+" : ""}
                      {m.change}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="capitalize text-xs font-medium">{m.reason}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(m.created_at).toLocaleString("sl-SI")}
                      </p>
                      {m.note && <p className="text-[11px] text-muted-foreground">{m.note}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
