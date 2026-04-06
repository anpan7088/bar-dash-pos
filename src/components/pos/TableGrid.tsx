import { Table } from "@/types/pos";
import { Users } from "lucide-react";

interface TableGridProps {
  tables: Table[];
  onSelectTable: (table: Table) => void;
}

const statusColors: Record<Table["status"], string> = {
  free: "border-table-free/50 bg-table-free/10 hover:bg-table-free/20",
  occupied: "border-table-occupied/50 bg-table-occupied/10 hover:bg-table-occupied/20",
  reserved: "border-table-reserved/50 bg-table-reserved/10 hover:bg-table-reserved/20",
};

const statusDot: Record<Table["status"], string> = {
  free: "bg-table-free",
  occupied: "bg-table-occupied",
  reserved: "bg-table-reserved",
};

export function TableGrid({ tables, onSelectTable }: TableGridProps) {
  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-6 mb-6">
        <h2 className="text-xl font-bold">Tables</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {(["free", "occupied", "reserved"] as const).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${statusDot[s]}`} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => onSelectTable(table)}
            className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 transition-all duration-150 active:scale-95 ${statusColors[table.status]}`}
          >
            <span className="text-lg font-bold">{table.name}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {table.seats}
            </span>
            {table.order && table.order.length > 0 && (
              <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {table.order.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
