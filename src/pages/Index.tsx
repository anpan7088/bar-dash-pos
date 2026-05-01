import { useState, useCallback } from "react";
import { Table, OrderItem, Product, ViewMode, PaymentMethod } from "@/types/pos";
import { initialTables } from "@/data/tables";
import { POSHeader } from "@/components/pos/POSHeader";
import { TableGrid } from "@/components/pos/TableGrid";
import { CategoryBar } from "@/components/pos/CategoryBar";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { OrderPanel } from "@/components/pos/OrderPanel";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { ShiftResultModal } from "@/components/pos/ShiftResultModal";
import { useAuth } from "@/contexts/AuthContext";
import PinLogin from "@/pages/PinLogin";
import { toast } from "sonner";

interface ShiftResult {
  staffName: string;
  startingCash: number | null;
  cashRevenue: number;
  cardRevenue: number;
  cashHanded: number;
}

const Index = () => {
  const { profile, loading, addCashRevenue, addCardRevenue, logout, startingCash, shiftCashRevenue, shiftCardRevenue } = useAuth();
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [view, setView] = useState<ViewMode>("tables");
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [category, setCategory] = useState("coffee");
  const [showPayment, setShowPayment] = useState(false);
  const [shiftResult, setShiftResult] = useState<ShiftResult | null>(null);

  const selectTable = useCallback((table: Table) => {
    setActiveTable(table);
    setOrderItems(table.order || []);
    setView("order");
  }, []);

  const addProduct = useCallback((product: Product) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQty = useCallback((productId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const goBack = useCallback(() => {
    if (activeTable) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === activeTable.id
            ? { ...t, order: orderItems, status: orderItems.length > 0 ? "occupied" : "free" }
            : t
        )
      );
    }
    setView("tables");
    setActiveTable(null);
    setOrderItems([]);
  }, [activeTable, orderItems]);

  const handlePayment = useCallback(
    (method: PaymentMethod, splitCash?: number, splitCard?: number) => {
      if (!activeTable) return;
      const total = orderItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
      if (method === "split" && splitCash != null && splitCard != null) {
        addCashRevenue(splitCash);
        addCardRevenue(splitCard);
      } else if (method === "cash") {
        addCashRevenue(total);
      } else if (method === "card") {
        addCardRevenue(total);
      }
      setTables((prev) =>
        prev.map((t) =>
          t.id === activeTable.id ? { ...t, status: "free" as const, order: [] } : t
        )
      );
      setShowPayment(false);
      setView("tables");
      setActiveTable(null);
      setOrderItems([]);
      toast.success(`Plačilo €${total.toFixed(2)} (${method}) potrjeno za ${activeTable.name}`);
    },
    [activeTable, orderItems, addCashRevenue, addCardRevenue]
  );

  const handleEndShift = useCallback(async (cashHanded: number) => {
    if (!profile) return;
    const result: ShiftResult = {
      staffName: profile.display_name,
      startingCash,
      cashRevenue: shiftCashRevenue,
      cardRevenue: shiftCardRevenue,
      cashHanded,
    };
    await logout(cashHanded);
    setShiftResult(result);
  }, [profile, startingCash, shiftCashRevenue, shiftCardRevenue, logout]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Nalaganje...</div>
      </div>
    );
  }

  // Show shift result modal even when logged out
  if (shiftResult) {
    return (
      <ShiftResultModal
        staffName={shiftResult.staffName}
        startingCash={shiftResult.startingCash}
        cashRevenue={shiftResult.cashRevenue}
        cardRevenue={shiftResult.cardRevenue}
        cashHanded={shiftResult.cashHanded}
        onClose={() => setShiftResult(null)}
      />
    );
  }

  if (!profile) {
    return <PinLogin />;
  }

  const total = orderItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <POSHeader staffName={profile.display_name} staffRole={profile.role} onEndShift={handleEndShift} />

      {view === "tables" ? (
        <div className="flex-1 overflow-y-auto">
          <TableGrid tables={tables} onSelectTable={selectTable} />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <CategoryBar selected={category} onSelect={setCategory} />
            <div className="flex-1 overflow-y-auto">
              <ProductGrid category={category} onAddProduct={addProduct} />
            </div>
          </div>
          <div className="w-80 lg:w-96 flex-shrink-0">
            <OrderPanel
              tableName={activeTable?.name || ""}
              items={orderItems}
              onUpdateQty={updateQty}
              onRemove={removeItem}
              onPay={() => setShowPayment(true)}
              onBack={goBack}
            />
          </div>
        </div>
      )}

      {showPayment && activeTable && (
        <PaymentModal
          total={total}
          tableName={activeTable.name}
          onConfirm={handlePayment}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};

export default Index;
