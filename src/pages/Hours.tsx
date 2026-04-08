import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TimeEntry {
  id: string;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  revenue: number | null;
}

type ViewMode = "daily" | "weekly" | "monthly";

function formatDuration(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function getWeekNumber(d: Date): number {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - onejan.getTime()) / 86400000);
  return Math.ceil((days + onejan.getDay() + 1) / 7);
}

export default function Hours() {
  const { profile, allProfiles } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isManager = profile?.role === "manager" || profile?.role === "admin";
  const activeUserId = selectedUserId || profile?.user_id;

  useEffect(() => {
    if (!activeUserId) return;
    const fetchEntries = async () => {
      setLoading(true);
      // Fetch last 90 days
      const since = new Date();
      since.setDate(since.getDate() - 90);

      let query = supabase
        .from("time_entries")
        .select("*")
        .gte("clock_in", since.toISOString())
        .order("clock_in", { ascending: false });

      if (!isManager || selectedUserId) {
        query = query.eq("user_id", activeUserId);
      }

      const { data } = await query;
      setEntries((data as TimeEntry[]) || []);
      setLoading(false);
    };
    fetchEntries();
  }, [activeUserId, isManager, selectedUserId]);

  const getProfileName = (userId: string) => {
    return allProfiles.find((p) => p.user_id === userId)?.display_name || "Neznan";
  };

  const getDuration = (entry: TimeEntry): number => {
    const end = entry.clock_out ? new Date(entry.clock_out).getTime() : Date.now();
    return end - new Date(entry.clock_in).getTime();
  };

  const groupedData = () => {
    const groups: Record<string, { label: string; totalMs: number; totalRevenue: number; entries: TimeEntry[] }> = {};

    entries.forEach((entry) => {
      const d = new Date(entry.clock_in);
      let key: string;
      let label: string;

      if (viewMode === "daily") {
        key = d.toISOString().slice(0, 10);
        label = d.toLocaleDateString("sl-SI", { weekday: "long", day: "numeric", month: "long" });
      } else if (viewMode === "weekly") {
        const week = getWeekNumber(d);
        key = `${d.getFullYear()}-W${week}`;
        label = `Teden ${week}, ${d.getFullYear()}`;
      } else {
        key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        label = d.toLocaleDateString("sl-SI", { month: "long", year: "numeric" });
      }

      if (!groups[key]) {
        groups[key] = { label, totalMs: 0, totalRevenue: 0, entries: [] };
      }
      const duration = getDuration(entry);
      groups[key].totalMs += duration;
      groups[key].totalRevenue += entry.revenue || 0;
      groups[key].entries.push(entry);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  };

  const totalMs = entries.reduce((sum, e) => sum + getDuration(e), 0);
  const totalRevenue = entries.reduce((sum, e) => sum + (e.revenue || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-border bg-card/50">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Obdelane ure</h1>
          <p className="text-xs text-muted-foreground">Pregled delovnega časa</p>
        </div>
        {isManager && (
          <select
            value={selectedUserId || ""}
            onChange={(e) => setSelectedUserId(e.target.value || null)}
            className="h-9 rounded-lg bg-card border border-border px-3 text-sm text-foreground"
          >
            <option value="">Vsi zaposleni</option>
            {allProfiles.map((p) => (
              <option key={p.user_id} value={p.user_id}>
                {p.display_name}
              </option>
            ))}
          </select>
        )}
      </header>

      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        {/* Summary card */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Skupaj (zadnjih 90 dni)</p>
            <p className="text-2xl font-bold">{formatDuration(totalMs)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Promet</p>
            <p className="text-xl font-bold text-primary">€{totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* View mode tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
          {([
            { key: "daily" as ViewMode, label: "Dnevno" },
            { key: "weekly" as ViewMode, label: "Tedensko" },
            { key: "monthly" as ViewMode, label: "Mesečno" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                viewMode === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Entries */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Nalaganje...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Ni zapisov</div>
        ) : (
          <div className="space-y-4">
            {groupedData().map(([key, group]) => (
              <div key={key} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium capitalize">{group.label}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{formatDuration(group.totalMs)}</span>
                  {group.totalRevenue > 0 && (
                    <span className="text-xs text-muted-foreground ml-2">€{group.totalRevenue.toFixed(2)}</span>
                  )}
                </div>
                <div className="divide-y divide-border">
                  {group.entries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(entry.clock_in).toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" })}
                          {" → "}
                          {entry.clock_out
                            ? new Date(entry.clock_out).toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" })
                            : "v teku"}
                        </span>
                        {(!selectedUserId && isManager) && (
                          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            {getProfileName(entry.user_id)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.revenue != null && (
                          <span className="text-xs text-primary font-medium">€{entry.revenue.toFixed(2)}</span>
                        )}
                        <span className="text-xs text-muted-foreground">{formatDuration(getDuration(entry))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
