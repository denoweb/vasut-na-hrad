// Lokální dev server: Vite (frontend + HMR + SPA fallback) + přímé volání /api funkcí.
// Náhrada za `vercel dev`, který se na Windows přes dashboard spawnuje nespolehlivě
// (serverless funkce dostávaly port `undefined` → FUNCTION_INVOCATION_FAILED).
import { readFileSync } from "node:fs";
import http from "node:http";
import express from "express";
import { createServer as createViteServer } from "vite";

// Načti .env do process.env — funkce potřebují BLOB_* proměnné
// (Vite samo vystavuje klientovi jen VITE_*).
try {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // .env nemusí existovat
}

const PORT = Number(process.env.PORT) || 5177;

const app = express();
const server = http.createServer(app);

// API funkce (Vercel/Express-style handlery se signaturou (req, res))
const visits = (await import("./api/visits.js")).default;
const stats = (await import("./api/stats.js")).default;
app.all("/api/visits", (req, res) => visits(req, res));
app.all("/api/stats", (req, res) => stats(req, res));

// Vite jako middleware: dev assety, HMR (přes stejný server) a SPA fallback na index.html
const vite = await createViteServer({
  server: { middlewareMode: true, hmr: { server } },
  appType: "spa",
});
app.use(vite.middlewares);

server.listen(PORT, () => {
  console.log(`Local dev na http://localhost:${PORT}  (Vite + /api funkce)`);
});
