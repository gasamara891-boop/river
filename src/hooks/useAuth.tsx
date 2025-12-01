"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
      setLoading(false);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  return { user, loading };
}