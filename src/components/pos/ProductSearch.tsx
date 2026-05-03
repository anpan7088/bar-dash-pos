import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Clock } from "lucide-react";
import { Product } from "@/types/pos";
import { DBProduct } from "@/hooks/useProducts";

interface Category {
  id: string;
  label: string;
  emoji: string;
}

interface ProductSearchProps {
  products: DBProduct[];
  categories: Category[];
  onSelect: (product: Product) => void;
}

const RECENT_KEY = "pos.recentSearches";

function levenshteinScore(a: string, b: string): number {
  if (b.includes(a)) return 0;
  // simple fuzzy: count matching chars in order
  let i = 0,
    j = 0,
    matches = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      matches++;
      i++;
    }
    j++;
  }
  return a.length - matches;
}

export function ProductSearch({ products, categories, onSelect }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    let pool = products.filter((p) => p.active);
    if (categoryFilter !== "all") pool = pool.filter((p) => p.category === categoryFilter);
    if (!q) return pool.slice(0, 8);
    return pool
      .map((p) => ({ p, score: levenshteinScore(q, p.name.toLowerCase()) }))
      .filter((x) => x.score <= Math.max(2, Math.floor(q.length / 2)))
      .sort((a, b) => a.score - b.score)
      .slice(0, 8)
      .map((x) => x.p);
  }, [query, products, categoryFilter]);

  useEffect(() => {
    setHighlight(0);
  }, [query, categoryFilter]);

  const recordRecent = (name: string) => {
    const next = [name, ...recent.filter((r) => r !== name)].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleSelect = (p: DBProduct) => {
    if (p.stock <= 0) return;
    onSelect(p);
    recordRecent(p.name);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = suggestions[highlight];
      if (pick) handleSelect(pick);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 px-3 h-10 rounded-lg bg-background border border-border focus-within:ring-2 focus-within:ring-ring">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Išči izdelek (Enter za izbiro)"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-secondary text-xs rounded-md px-2 h-7 border-0 outline-none"
        >
          <option value="all">Vse</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      </div>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          {!query && recent.length > 0 && (
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Nedavno
              <div className="flex flex-wrap gap-1.5 ml-2">
                {recent.map((r) => (
                  <button
                    key={r}
                    onClick={() => setQuery(r)}
                    className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-[11px] hover:bg-primary hover:text-primary-foreground"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
          {suggestions.length === 0 ? (
            <div className="px-3 py-6 text-sm text-center text-muted-foreground">Ni zadetkov</div>
          ) : (
            suggestions.map((p, idx) => {
              const out = p.stock <= 0;
              const low = !out && p.stock <= p.lowStockThreshold;
              return (
                <button
                  key={p.id}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => handleSelect(p)}
                  disabled={out}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                    idx === highlight ? "bg-secondary" : ""
                  } ${out ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary"}`}
                >
                  <span className="text-xl">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">€{p.price.toFixed(2)}</p>
                    <p
                      className={`text-[10px] ${
                        out
                          ? "text-destructive font-bold"
                          : low
                          ? "text-primary font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      Zaloga: {p.stock}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
