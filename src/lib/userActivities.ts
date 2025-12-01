

import { supabase } from "@/lib/supabaseClient";

export async function logUserActivity(user_id: string | null | undefined, event: string, description = "") {
  try {
    if (!user_id) {
      console.warn("logUserActivity called without user_id; skipping log.");
      return null;
    }

    // Try to get public IP. Wrap in try/catch so failures don't block logging.
    let ip = "Unknown";
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      if (ipRes.ok) {
        const ipJson = await ipRes.json();
        ip = ipJson?.ip || ip;
      }
    } catch (err) {
      // ignore - keep ip as "Unknown"
    }

    // Try to get location data from ipapi.co (best-effort)
    let city = "Unknown";
    let region = "Unknown";
    let country = "Unknown";
    if (ip && ip !== "Unknown") {
      try {
        const locRes = await fetch(`https://ipapi.co/${ip}/json/`);
        if (locRes.ok) {
          const locationData = await locRes.json();
          city = locationData?.city || city;
          region = locationData?.region || region;
          country = locationData?.country_name || country;
        }
      } catch (err) {
        // ignore
      }
    }

    // Prepare payload and insert
    const payload = {
      user_id,
      event,
      description,
      ip,
      city,
      region,
      country,
    };

    const { data, error } = await supabase.from("user_activity").insert([payload]).select("*").maybeSingle();
    if (error) {
      console.error("logUserActivity: failed to insert:", error.message || error);
      return null;
    }
    // Return the inserted row so caller can use it if needed
    return data || null;
  } catch (err) {
    console.error("logUserActivity unexpected error:", err);
    return null;
  }
}

export async function fetchUserActivities(user_id: string | null | undefined, page = 1, limit = 10, admin = false) {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("user_activity")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!admin) {
      query = query.eq("user_id", user_id);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    const totalPages = Math.max(1, Math.ceil((count || 0) / limit));

    return {
      activities: data || [],
      totalPages,
      currentPage: page,
    };
  } catch (err: any) {
    console.error("fetchUserActivities error:", err?.message ?? err);
    return { activities: [], totalPages: 1, currentPage: 1 };
  }
}

export async function resetUserActivityTable() {
  try {
    const { error } = await supabase.rpc("truncate_user_activity");
    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error("resetUserActivityTable error:", err?.message ?? err);
    return false;
  }
}