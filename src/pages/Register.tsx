import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Coffee, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { refreshProfiles, pinLogin } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) {
      toast.error("PIN mora biti 4-mestno število");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: name, pin },
      },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // If email confirmation is required, no session is returned
    if (!data.session) {
      setLoading(false);
      toast.success("Registracija uspešna! Preveri e-pošto za potrditev.");
      await refreshProfiles();
      navigate("/");
      return;
    }

    // Auto-confirmed: sign out the auth session (POS uses PIN login) and start shift via PIN
    await refreshProfiles();
    const userId = data.session.user.id;
    await supabase.auth.signOut();
    const ok = await pinLogin(userId, pin, 0);
    setLoading(false);
    if (ok) {
      toast.success("Registracija uspešna! Dobrodošel.");
      navigate("/");
    } else {
      toast.success("Registracija uspešna!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Nazaj
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Coffee className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Registracija</h1>
            <p className="text-xs text-muted-foreground">Ustvari nov račun za osebje</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Ime</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Janez"
              className="w-full h-12 rounded-xl bg-card border border-border px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">E-pošta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="janez@cafe.si"
              className="w-full h-12 rounded-xl bg-card border border-border px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Geslo</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full h-12 rounded-xl bg-card border border-border px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              4-mestni PIN (za hitro prijavo)
            </label>
            <input
              type="text"
              required
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="1234"
              className="w-full h-12 rounded-xl bg-card border border-border px-4 text-foreground text-center text-2xl font-bold tracking-[0.5em] placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-base placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-base transition-all active:scale-[0.98] disabled:opacity-40 hover:brightness-110"
          >
            {loading ? "Registracija..." : "Registracija"}
          </button>
        </form>
      </div>
    </div>
  );
}
