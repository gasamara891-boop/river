import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
  );
}

/**
 * Browser Supabase client
 * - persistSession: true ensures sessions persist in the browser (localStorage).
 * - autoRefreshToken: true enables automatic token refresh.
 * - detectSessionInUrl: false avoids auto-parsing OAuth redirect fragments which can
 *   sometimes cause transient AuthSessionMissingError in client code.
 *
 * If you need server-side session access, use the auth-helpers (createServerComponentClient / serverSupabaseClient).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});