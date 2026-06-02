import { get } from "@vercel/blob";

const BLOB_KEY = "visits-data.json";

// Načte aktuální data z (private) Vercel Blob, nebo null pokud ještě neexistují
async function readData() {
  try {
    const result = await get(BLOB_KEY, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return await new Response(result.stream).json();
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const data = (await readData()) || { count: 0, ipStats: {} };
  data.ipStats ??= {};

  const rows = Object.entries(data.ipStats)
    .map(([ip, val]) => {
      const count = typeof val === "object" ? val.count : val;
      const lastVisit = typeof val === "object" ? val.lastVisit : null;
      return { ip, count, lastVisit };
    })
    .sort((a, b) => b.count - a.count);

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ total: data.count, rows }));
}
