import { useEffect, useState } from "react";
import { useAuth, StaffProfile } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, UserPlus, Edit2, Trash2, Save, X, Shield, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Role = "waiter" | "manager" | "admin";

export default function Staff() {
  const { profile, allProfiles, refreshProfiles } = useAuth();
  const navigate = useNavigate();
  const isManager = profile?.role === "manager" || profile?.role === "admin";

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    pin: "",
    role: "waiter" as Role,
  });
  const [editForm, setEditForm] = useState({ name: "", pin: "", role: "waiter" as Role });

  useEffect(() => {
    if (!profile) {
      navigate("/");
      return;
    }
    if (!isManager) {
      toast.error("Samo manager ali admin lahko upravlja zaposlene");
      navigate("/");
    }
  }, [profile, isManager, navigate]);

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", pin: "", role: "waiter" });
    setAdding(false);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6 || !/^\d{4}$/.test(form.pin)) {
      toast.error("Izpolni vsa polja (PIN 4 števke, geslo vsaj 6 znakov)");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: form.email.trim(),
          password: form.password,
          display_name: form.name.trim(),
          pin: form.pin,
        },
      });
      if (error || (data as any)?.error) {
        toast.error((data as any)?.error || error?.message || "Napaka");
        return;
      }
      // Update role if not waiter
      if (form.role !== "waiter" && (data as any)?.user?.id) {
        await supabase
          .from("profiles")
          .update({ role: form.role } as any)
          .eq("user_id", (data as any).user.id);
      }
      toast.success(`${form.name} dodan`);
      resetForm();
      await refreshProfiles();
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (p: StaffProfile) => {
    setEditingId(p.id);
    setEditForm({ name: p.display_name, pin: p.pin, role: p.role });
  };

  const handleSaveEdit = async (p: StaffProfile) => {
    if (!editForm.name.trim() || !/^\d{4}$/.test(editForm.pin)) {
      toast.error("Ime in 4-mestni PIN sta obvezna");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: editForm.name.trim(),
        pin: editForm.pin,
        role: editForm.role,
      } as any)
      .eq("id", p.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Posodobljeno");
    setEditingId(null);
    await refreshProfiles();
  };

  const handleDelete = async (p: StaffProfile) => {
    if (p.user_id === profile?.user_id) {
      toast.error("Ne moreš izbrisati sebe");
      return;
    }
    if (!confirm(`Izbriši ${p.display_name}? To je nepovratno.`)) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("delete-user", {
      body: { user_id: p.user_id },
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || "Napaka");
      return;
    }
    toast.success(`${p.display_name} izbrisan`);
    await refreshProfiles();
  };

  if (!profile || !isManager) return null;

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
          <h1 className="text-lg font-bold">Zaposleni</h1>
          <p className="text-xs text-muted-foreground">Upravljanje osebja</p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5 hover:brightness-110"
          >
            <UserPlus className="w-4 h-4" /> Dodaj
          </button>
        )}
      </header>

      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        {adding && (
          <div className="bg-card border border-primary/40 rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">Nov zaposleni</h2>
            <input
              type="text"
              placeholder="Ime in priimek"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-11 rounded-lg bg-background border border-border px-3 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="email"
              placeholder="E-pošta"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-11 rounded-lg bg-background border border-border px-3 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="password"
              placeholder="Geslo (vsaj 6 znakov)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full h-11 rounded-lg bg-background border border-border px-3 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="PIN"
                value={form.pin}
                onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                className="flex-1 h-11 rounded-lg bg-background border border-border px-3 text-center text-lg font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                className="flex-1 h-11 rounded-lg bg-background border border-border px-3 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="waiter">Natakar</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={resetForm}
                disabled={busy}
                className="flex-1 h-10 rounded-lg bg-secondary text-sm font-semibold hover:bg-secondary/80"
              >
                Prekliči
              </button>
              <button
                onClick={handleCreate}
                disabled={busy}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 disabled:opacity-40"
              >
                {busy ? "..." : "Ustvari"}
              </button>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
          {allProfiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Ni zaposlenih</div>
          ) : (
            allProfiles.map((p) => {
              const isEdit = editingId === p.id;
              const isMe = p.user_id === profile.user_id;
              return (
                <div key={p.id} className="p-4">
                  {isEdit ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full h-10 rounded-lg bg-background border border-border px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          value={editForm.pin}
                          onChange={(e) => setEditForm({ ...editForm, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                          className="flex-1 h-10 rounded-lg bg-background border border-border px-3 text-center font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                          className="flex-1 h-10 rounded-lg bg-background border border-border px-3"
                        >
                          <option value="waiter">Natakar</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
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
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        {p.role === "admin" || p.role === "manager" ? (
                          <Shield className="w-5 h-5 text-primary" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {p.display_name} {isMe && <span className="text-xs text-primary">(ti)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {p.role} · PIN ••••
                        </p>
                      </div>
                      <button
                        onClick={() => startEdit(p)}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                        title="Uredi"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {!isMe && (
                        <button
                          onClick={() => handleDelete(p)}
                          className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-destructive/20 hover:text-destructive"
                          title="Izbriši"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
