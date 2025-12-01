import { supabase } from "@/lib/supabaseClient";
import { getLocation } from "@/lib/getLocation";

// event: e.g. "login", "signup", "investment_created", etc.
// description: human readable, e.g. "User logged in", "User signed up", "BTC 100 invested"

export async function logUserActivity(
  user_id: string,
  event: string,
  description: string
) {
  try {
    const location = await getLocation();
    const payload = {
      user_id,
      event,
      description,
      ip: location.ip,
      country: location.country,
      region: location.region,
      city: location.city,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("user_activity").insert([payload]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("logUserActivity error:", err);
    throw err;
  }
}