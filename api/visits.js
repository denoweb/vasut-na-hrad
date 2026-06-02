import { put, list } from "@vercel/blob";

const BLOB_KEY = "visits-data.json";
const ONE_MINUTE = 60 * 1000;
const CLEANUP_AFTER = 2 * ONE_MINUTE;

// Načte aktuální data z Vercel Blob (nebo null, pokud ještě neexistují)
async function readData() {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
    if (blobs.length === 0) return null;
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Uloží data zpět do Vercel Blob pod stálým názvem (bez náhodného suffixu)
async function writeData(data) {
  await put(BLOB_KEY, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

export default async function handler(req, res) {
  // Resolve client IP
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";

  const now = Date.now();

  // Load persisted data
  const data = (await readData()) || { count: 0, ips: {}, ipStats: {} };
  data.ips ??= {};
  data.ipStats ??= {};

  // Remove stale IP entries to keep storage small
  for (const [storedIp, ts] of Object.entries(data.ips)) {
    if (now - ts > CLEANUP_AFTER) {
      delete data.ips[storedIp];
    }
  }

  // Přeskočit počítání pokud má návštěvník cookie skip_count=1
  const cookies = req.headers.cookie || "";
  const skip = cookies.split(";").some((c) => c.trim() === "skip_count=1");

  // Count this visit only if the IP hasn't visited in the last minute
  const lastVisit = data.ips[ip] ?? 0;
  if (!skip && now - lastVisit >= ONE_MINUTE) {
    data.count++;
    data.ips[ip] = now;
    const prev = data.ipStats[ip];
    const prevCount = typeof prev === "object" ? prev.count : (prev ?? 0);
    data.ipStats[ip] = { count: prevCount + 1, lastVisit: now };
    await writeData(data);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ count: data.count }));
}
