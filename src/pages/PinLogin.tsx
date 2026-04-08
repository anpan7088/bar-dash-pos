import { useState } from "react";
import { useAuth, StaffProfile } from "@/contexts/AuthContext";
import { Coffee, User, Delete, LogIn } from "lucide-react";
import { toast } from "sonner";
import { StartShiftModal } from "@/components/pos/StartShiftModal";

export default function PinLogin() {
  const { allProfiles, pinLogin } = useAuth();
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [showStartShift, setShowStartShift] = useState(false);
  const [verifiedPin, setVerifiedPin] = useState("");

  const handleDigit = (d: string) => {
    if (pin.length < 4) setPin((p) => p + d);
  };

  const handleDelete = () => setPin((p) => p.slice(0, -1));

  const handleSubmit = async () => {
    if (!selectedStaff || pin.length !== 4) return;
    setLoading(true);
    // Verify PIN first without starting shift
    const { data } = await (await import("@/integrations/supabase/client")).supabase
      .from("profiles")
      .select("*")
      .eq("user_id", selectedStaff.user_id)
      .eq("pin", pin)
      .eq("approved", true)
      .single();

    setLoading(false);
    if (!data) {
      toast.error("Napačen PIN");
      setPin("");
      return;
    }
    // PIN is correct, show starting cash modal
    setVerifiedPin(pin);
    setShowStartShift(true);
  };

  const handleStartShift = async (startingCash: number) => {
    if (!selectedStaff) return;
    setLoading(true);
    const ok = await pinLogin(selectedStaff.user_id, verifiedPin, startingCash);
    setLoading(false);
    if (!ok) {
      toast.error("Napaka pri prijavi");
      setShowStartShift(false);
      setPin("");
    }
  };

  const handleBack = () => {
    setSelectedStaff(null);
    setPin("");
    setShowStartShift(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <Coffee className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">CaféPOS</h1>
          <p className="text-xs text-muted-foreground">Izberi profil za prijavo</p>
        </div>
      </div>

      {!selectedStaff ? (
        /* Staff selection grid */
        <div className="w-full max-w-md">
          {allProfiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Ni registriranih uporabnikov</p>
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
              >
                <LogIn className="w-4 h-4" />
                Registracija
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {allProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedStaff(p)}
                    className="flex flex-col items-center gap-2 p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all active:scale-95"
                  >
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <span className="font-semibold text-sm">{p.display_name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {p.role}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-6 text-center">
                <a
                  href="/register"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  + Nov uporabnik
                </a>
              </div>
            </>
          )}
        </div>
      ) : (
        /* PIN entry */
        <div className="w-full max-w-xs">
          <button
            onClick={handleBack}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            ← Nazaj
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold">{selectedStaff.display_name}</h2>
            <p className="text-xs text-muted-foreground">Vnesi 4-mestni PIN</p>
          </div>

          {/* PIN dots */}
          <div className="flex justify-center gap-3 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all ${
                  i < pin.length ? "bg-primary scale-110" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="h-16 rounded-xl bg-card border border-border text-xl font-bold hover:bg-secondary active:scale-95 transition-all"
              >
                {d}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className="h-16 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-secondary active:scale-95 transition-all"
            >
              <Delete className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDigit("0")}
              className="h-16 rounded-xl bg-card border border-border text-xl font-bold hover:bg-secondary active:scale-95 transition-all"
            >
              0
            </button>
            <button
              onClick={handleSubmit}
              disabled={pin.length !== 4 || loading}
              className="h-16 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
            >
              {loading ? "..." : "OK"}
            </button>
          </div>
        </div>
      )}

      {showStartShift && selectedStaff && (
        <StartShiftModal
          staffName={selectedStaff.display_name}
          onConfirm={handleStartShift}
        />
      )}
    </div>
  );
}
