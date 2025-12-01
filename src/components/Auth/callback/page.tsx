'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading"|"error"|"done">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This will run on first render
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const type = searchParams.get("type");
    const name = searchParams.get("name");
    const email = searchParams.get("email");

    if (type === "signup" && access_token && refresh_token) {
      // Attempt to sign in using the tokens from the Supabase email link
      supabase.auth.setSession({
        access_token,
        refresh_token
      }).then(async ({ error }) => {
        if (error) {
          setError(error.message);
          setStatus("error");
          return;
        }

        // session set - try to ensure the user's profile has the display name entered at signup
        try {
          // get current user
          const {
            data: { user },
            error: getUserError,
          } = await supabase.auth.getUser();

          if (getUserError) {
            console.warn("getUser after setSession error:", getUserError);
          }

          const userId = user?.id ?? null;
          if (userId) {
            // fetch existing profile
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", userId)
              .single();

            if (profileError && profileError.code !== "PGRST116") {
              // PGRST116 is "No rows found" in some setups; ignore that if no row exists
              console.warn("profiles select error:", profileError);
            }

            const existingName = profile?.name ?? null;

            // If a name was provided in the signup flow and profile either missing or has a placeholder like "New User", update it.
            if (name && name.trim().length > 0 && (!existingName || existingName === "New User")) {
              const { error: upsertErr } = await supabase.from("profiles").upsert({
                id: userId,
                name: name.trim(),
                email: email ?? undefined,
              });

              if (upsertErr) {
                console.warn("Error upserting profile name after confirmation:", upsertErr);
              }
            }
          }
        } catch (e) {
          console.error("Error reconciling profile after confirmation:", e);
        }

        setStatus("done");
        // You can change '/profile' to your dashboard/main page!
        // Replace so history doesn't keep the token params
        router.replace("/profile");
      });
    } else {
      setStatus("error");
      setError("Invalid or missing confirmation link.");
    }
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-3">Activating your account...</p>
          <p className="text-sm text-gray-400">Please wait while we finish sign-in.</p>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-green-500 font-semibold text-lg">
          Account activated successfully. Redirecting...
        </p>
      </div>
    );
  }

  // error case
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 font-bold mb-2">Activation failed</p>
        <p className="text-gray-400 text-sm">{error ?? "Unknown error."}</p>
      </div>
    </div>
  );
}