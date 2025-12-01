"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * AdminRedirect
 * - Uses supabase.auth.getSession() instead of getUser() to avoid AuthSessionMissingError.
 * - Subscribes to auth state changes and re-checks the profile when sign-in occurs.
 * - Defensively unsubscribes on unmount.
 */
export default function AdminRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function checkAndRedirect() {
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          console.warn("AdminRedirect: getSession warning:", sessionErr);
        }

        const user = sessionData?.session?.user ?? null;
        if (!user || !mounted) return;

        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();

        if (profileErr) {
          console.error("AdminRedirect: error fetching profile", profileErr);
          return;
        }

        if (profile?.is_admin && !pathname?.startsWith("/admin")) {
          router.replace("/admin");
        }
      } catch (err: any) {
        // handle known auth missing error gracefully
        if (err?.name === "AuthSessionMissingError" || (err?.message && err.message.includes("AuthSessionMissingError"))) {
          console.warn("AdminRedirect: auth session missing (caught):", err);
          return;
        }
        console.error("AdminRedirect error:", err);
      }
    }

    // initial check
    checkAndRedirect();

    // subscribe to auth state changes
    const subscription = supabase.auth.onAuthStateChange((_event, _session) => {
      if (!mounted) return;
      // Whenever auth changes, re-check profile & redirect if admin
      checkAndRedirect();
    });

    return () => {
      mounted = false;
      try {
        const maybeSub = (subscription as any)?.data?.subscription ?? (subscription as any)?.subscription ?? subscription;
        if (maybeSub?.unsubscribe) maybeSub.unsubscribe();
      } catch (e) {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router]);

  return null;
}