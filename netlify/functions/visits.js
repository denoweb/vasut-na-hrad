import { getStore } from "@netlify/blobs";

const STORE_KEY = "visits-data";
const ONE_MINUTE = 60 * 1000;
const CLEANUP_AFTER = 2 * ONE_MINUTE;

export default async function handler(req, context) {
  const store = getStore("visits");

  // Resolve client IP
  const ip =
    context.ip ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown";

  const now = Date.now();

  // Load persisted data
  let data = { count: 0, ips: {}, ipStats: {} };
  try {
    const stored = await store.get(STORE_KEY, { type: "json" });
    if (stored) data = { ipStats: {}, ...stored };
  } catch {
    // First run or unreadable — start fresh
  }

  // Remove stale IP entries to keep storage small
  for (const [storedIp, ts] of Object.entries(data.ips)) {
    if (now - ts > CLEANUP_AFTER) {
      delete data.ips[storedIp];
    }
  }

  // Přeskočit počítání pokud má návštěvník cookie skip_count=1
  const cookies = req.headers.get("cookie") || "";
  const skip = cookies.split(";").some((c) => c.trim() === "skip_count=1");

  // Count this visit only if the IP hasn't visited in the last minute
  const lastVisit = data.ips[ip] ?? 0;
  if (!skip && now - lastVisit >= ONE_MINUTE) {
    data.count++;
    data.ips[ip] = now;
    const prev = data.ipStats[ip];
    const prevCount = typeof prev === "object" ? prev.count : (prev ?? 0);
    data.ipStats[ip] = { count: prevCount + 1, lastVisit: now };
    await store.setJSON(STORE_KEY, data);
  }

  return new Response(JSON.stringify({ count: data.count }), {
    headers: { "Content-Type": "application/json" },
  });
}

export const config = {
  path: "/api/visits",
};