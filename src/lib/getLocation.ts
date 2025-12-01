// Utility to fetch user IP and geolocation for activity logging
// Uses ipapi.co (free tier, no auth required) - you may swap for any other geo API if preferred

export type LocationData = {
  ip: string;
  country: string;
  region: string;
  city: string;
};

export async function getLocation(): Promise<LocationData> {
  // You may swap out for any other public geo API if you hit rate limits
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("Failed to fetch geo/IP");
    const data = await res.json();
    return {
      ip: data.ip || "",
      country: data.country_name || "",
      region: data.region || "",
      city: data.city || "",
    };
  } catch (err) {
    console.warn("getLocation failed:", err);
    return { ip: "", country: "", region: "", city: "" };
  }
}