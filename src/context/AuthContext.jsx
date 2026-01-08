import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      init();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function init() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    setUser(user);

    // 🔑 IMPORTANT FIX: query by id, NOT auth_id
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.error("ROLE FETCH ERROR:", error);
      alert("Failed to load user role");
      setRole(null);
    } else {
      setRole(data.role);
    }

    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
