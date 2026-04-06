import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
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
  pinLogin: (userId: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // We use a hybrid approach:
  // 1. Supabase Auth for initial registration (email/password)
  // 2. PIN-based "session" stored in state for daily shift login
  // The PIN login validates against profiles table without requiring email/password each time

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("approved", true)
      .order("display_name");
    if (data) setAllProfiles(data as StaffProfile[]);
  };

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Fetch this user's profile
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

    // Check existing session
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

    // Fetch all approved profiles for PIN login screen
    fetchProfiles();

    return () => subscription.unsubscribe();
  }, []);

  const pinLogin = async (userId: string, pin: string): Promise<boolean> => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .eq("pin", pin)
      .eq("approved", true)
      .single();

    if (data) {
      setProfile(data as StaffProfile);
      return true;
    }
    return false;
  };

  const logout = async () => {
    setProfile(null);
    // Don't sign out of Supabase - just clear the PIN session
    // This way the PIN login screen stays available without re-entering email/password
  };

  const refreshProfiles = async () => {
    await fetchProfiles();
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, allProfiles, loading, pinLogin, logout, refreshProfiles }}
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
