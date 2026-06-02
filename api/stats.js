import { list } from "@vercel/blob";

const BLOB_KEY = "visits-data.json";

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
