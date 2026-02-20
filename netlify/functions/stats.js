import { getStore } from "@netlify/blobs";

const STORE_KEY = "visits-data";

export default async function handler(req) {
  const store = getStore("visits");

  let data = { count: 0, ipStats: {} };
  try {
    const stored = await store.get(STORE_KEY, { type: "json" });
    if (stored) data = { ipStats: {}, ...stored };
  } catch {
    // Start fresh
  }

  const rows = Object.entries(data.ipStats)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count);

  return new Response(JSON.stringify({ total: data.count, rows }), {
    headers: { "Content-Type": "application/json" },
  });
}

export const config = {
  path: "/api/stats",
};
