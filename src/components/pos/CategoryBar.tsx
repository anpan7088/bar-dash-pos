interface Category {
  id: string;
  label: string;
  emoji: string;
}

interface CategoryBarProps {
  selected: string;
  categories: Category[];
  onSelect: (id: string) => void;
}

export function CategoryBar({ selected, categories, onSelect }: CategoryBarProps) {
  return (
    <div className="flex gap-2 p-4 pb-0 overflow-x-auto scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all active:scale-95 ${
            selected === cat.id
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <span className="text-base">{cat.emoji}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
