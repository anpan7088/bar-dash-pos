import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface StaffProfile {
  id: string;
  user_id: string;
  display_name: string;
  pin: string;
  role: "waiter" | "manager" | "admin";
  approved: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: StaffProfile | null;
  allProfiles: StaffProfile[];
  loading: boolean;
  activeTimeEntryId: string | null;
  startingCash: number | null;
  clockInTime: Date | null;
  shiftCashRevenue: number;
  addCashRevenue: (amount: number) => void;
  pinLogin: (userId: string, pin: string, startingCash?: number) => Promise<boolean>;
  logout: (cashHanded: number) => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimeEntryId, setActiveTimeEntryId] = useState<string | null>(null);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [startingCash, setStartingCash] = useState<number | null>(null);
  const [shiftCashRevenue, setShiftCashRevenue] = useState(0);

  const addCashRevenue = (amount: number) => {
    setShiftCashRevenue((prev) => prev + amount);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("approved", true)
      .order("display_name");
    if (data) setAllProfiles(data as StaffProfile[]);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
          if (data) setProfile(data as StaffProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data as StaffProfile);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    fetchProfiles();
    return () => subscription.unsubscribe();
  }, []);

  const clockIn = async (userId: string, startingCashAmount?: number) => {
    const { data } = await supabase
      .from("time_entries")
      .insert({ user_id: userId, clock_in: new Date().toISOString(), starting_cash: startingCashAmount ?? null } as any)
      .select("id, clock_in")
      .single();
    if (data) {
      setActiveTimeEntryId(data.id);
      setClockInTime(new Date(data.clock_in));
      setStartingCash(startingCashAmount ?? null);
      setShiftCashRevenue(0);
    }
  };

  const clockOut = async (cashHanded?: number) => {
    if (activeTimeEntryId) {
      await supabase
        .from("time_entries")
        .update({
          clock_out: new Date().toISOString(),
          cash_revenue: shiftCashRevenue,
          cash_handed: cashHanded ?? null,
        } as any)
        .eq("id", activeTimeEntryId);
      setActiveTimeEntryId(null);
      setClockInTime(null);
      setStartingCash(null);
      setShiftCashRevenue(0);
    }
  };
  const pinLogin = async (userId: string, pin: string, startingCash?: number): Promise<boolean> => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .eq("pin", pin)
      .eq("approved", true)
      .single();

    if (data) {
      setProfile(data as StaffProfile);
      await clockIn(userId, startingCash);
      return true;
    }
    return false;
  };

  const logout = async (cashHanded: number) => {
    await clockOut(cashHanded);
    setProfile(null);
  };

  const refreshProfiles = async () => {
    await fetchProfiles();
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, allProfiles, loading, activeTimeEntryId, clockInTime, startingCash, shiftCashRevenue, addCashRevenue, pinLogin, logout, refreshProfiles }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
