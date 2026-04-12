import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Clock, Edit2, Save, User, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface MonthlyStats {
  month: string;
  label: string;
  totalMs: number;
  shifts: number;
}

function formatDuration(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}u ${m}min`;
}

export default function Settings() {
  const { profile, refreshProfiles } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [pin, setPin] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editingPin, setEditingPin] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingPin, setSavingPin] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchMonthlyStats = async () => {
      setLoading(true);
      const since = new Date();
      since.setMonth(since.getMonth() - 6);

      const { data } = await supabase
        .from("time_entries")
        .select("*")
        .eq("user_id", profile.user_id)
        .gte("clock_in", since.toISOString())
        .order("clock_in", { ascending: false });

      if (data) {
        const groups: Record<string, MonthlyStats> = {};
        data.forEach((entry: any) => {
          const d = new Date(entry.clock_in);
          const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
          const label = d.toLocaleDateString("sl-SI", { month: "long", year: "numeric" });
          if (!groups[key]) {
            groups[key] = { month: key, label, totalMs: 0, shifts: 0 };
          }
          const end = entry.clock_out ? new Date(entry.clock_out).getTime() : Date.now();
          groups[key].totalMs += end - new Date(entry.clock_in).getTime();
          groups[key].shifts += 1;
        });
        setMonthlyStats(
          Object.values(groups).sort((a, b) => b.month.localeCompare(a.month))
        );
      }
      setLoading(false);
    };
    fetchMonthlyStats();
  }, [profile]);

  const handleSaveName = async () => {
    if (!profile || !displayName.trim()) return;
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() } as any)
      .eq("id", profile.id);
    setSavingName(false);
    if (error) {
      toast.error("Napaka pri shranjevanju");
    } else {
      toast.success("Ime posodobljeno");
      setEditingName(false);
      await refreshProfiles();
    }
  };

  const handleSavePin = async () => {
    if (!profile || !/^\d{4}$/.test(pin)) {
      toast.error("PIN mora biti 4-mestno število");
      return;
    }
    setSavingPin(true);
    const { error } = await supabase
      .from("profiles")
      .update({ pin } as any)
      .eq("id", profile.id);
    setSavingPin(false);
    if (error) {
      toast.error("Napaka pri shranjevanju PIN-a");
    } else {
      toast.success("PIN posodobljen");
      setEditingPin(false);
      setPin("");
    }
  };

  if (!profile) {
    navigate("/");
    return null;
  }

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
          <h1 className="text-lg font-bold">Nastavitve</h1>
          <p className="text-xs text-muted-foreground">{profile.display_name}</p>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">
        {/* Profile section */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Profil</h2>

          {/* Display name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            {editingName ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 h-10 rounded-lg bg-background border border-border px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {savingName ? "..." : "Shrani"}
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="font-medium">{profile.display_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                </div>
                <button
                  onClick={() => setEditingName(true)}
                  className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>

          {/* PIN change */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-muted-foreground" />
            </div>
            {editingPin ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="Nov 4-mestni PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="flex-1 h-10 rounded-lg bg-background border border-border px-3 text-foreground text-center text-xl font-bold tracking-[0.4em] placeholder:text-sm placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <button
                  onClick={handleSavePin}
                  disabled={savingPin || pin.length !== 4}
                  className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {savingPin ? "..." : "Shrani"}
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="font-medium">PIN koda</p>
                  <p className="text-xs text-muted-foreground">••••</p>
                </div>
                <button
                  onClick={() => setEditingPin(true)}
                  className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Monthly hours */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Mesečne ure
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Nalaganje...</div>
          ) : monthlyStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Ni zapisov</div>
          ) : (
            <div className="divide-y divide-border">
              {monthlyStats.map((stat) => (
                <div key={stat.month} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium capitalize">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.shifts} izmen</p>
                  </div>
                  <p className="text-lg font-bold text-primary">{formatDuration(stat.totalMs)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
