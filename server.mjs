import { createServer } from "node:http";
import { parse } from "node:url";
import { join, resolve, normalize } from "node:path";
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from "node:fs";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const DATA_DIR = process.env.DATA_DIR ? resolve(process.env.DATA_DIR) : resolve("data");
const EVENTS_FILE = join(DATA_DIR, "events.jsonl");
const DIST_DIR = resolve("dist");

const VERSION = "0.1.0";

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function loadEventIds() {
  const ids = new Set();
  if (!existsSync(EVENTS_FILE)) return ids;
  const content = readFileSync(EVENTS_FILE, "utf-8");
  for (const line of content.split("\n")) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line);
      if (event.event_id) ids.add(event.event_id);
    } catch {
      // ignora linhas malformadas
    }
  }
  return ids;
}

const knownEventIds = loadEventIds();

function aggregate() {
  if (!existsSync(EVENTS_FILE)) {
    return {
      respostas: 0,
      acertos: 0,
      xp: 0,
      aparelhos: 0,
      por_tema: {},
    };
  }
  const content = readFileSync(EVENTS_FILE, "utf-8");
  const deviceSet = new Set();
  let respostas = 0;
  let acertos = 0;
  let xp = 0;
  const por_tema = {};

  for (const line of content.split("\n")) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line);
      if (event.type === "answer") {
        respostas++;
        if (event.correct) acertos++;
        xp += event.xp ?? 0;
      }
      if (event.device_id) deviceSet.add(event.device_id);
      if (event.theme) {
        if (!por_tema[event.theme]) {
          por_tema[event.theme] = { respostas: 0, acertos: 0, xp: 0 };
        }
        if (event.type === "answer") {
          por_tema[event.theme].respostas++;
          if (event.correct) por_tema[event.theme].acertos++;
          por_tema[event.theme].xp += event.xp ?? 0;
        }
      }
    } catch {
      // ignora
    }
  }

  return {
    respostas,
    acertos,
    xp,
    aparelhos: deviceSet.size,
    por_tema,
  };
}

function safeJoin(base, requested) {
  const requestedPath = normalize(join(base, requested));
  if (!requestedPath.startsWith(base)) {
    return null;
  }
  return requestedPath;
}

function serveStatic(req, res) {
  const parsed = parse(req.url, true);
  let pathname = parsed.pathname;

  if (pathname === "/") pathname = "/index.html";

  if (pathname.startsWith("/api/")) return false;

  const filePath = safeJoin(DIST_DIR, pathname.slice(1));
  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return true;
  }

  if (existsSync(filePath)) {
    const ext = filePath.split(".").pop();
    const types = {
      html: "text/html; charset=utf-8",
      js: "application/javascript; charset=utf-8",
      css: "text/css; charset=utf-8",
      json: "application/json; charset=utf-8",
      svg: "image/svg+xml",
      png: "image/png",
      ico: "image/x-icon",
      woff2: "font/woff2",
      txt: "text/plain; charset=utf-8",
    };
    const contentType = types[ext] || "application/octet-stream";
    const content = readFileSync(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
    return true;
  }

  const indexPath = join(DIST_DIR, "index.html");
  if (existsSync(indexPath)) {
    const content = readFileSync(indexPath, "utf-8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(content);
    return true;
  }

  return false;
}

const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (serveStatic(req, res)) return;

  const parsed = parse(req.url, true);

  if (parsed.pathname === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", version: VERSION }));
    return;
  }

  if (parsed.pathname === "/api/aggregate" && req.method === "GET") {
    const agg = aggregate();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(agg));
    return;
  }

  if (parsed.pathname === "/api/sync" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const deviceId = body.device_id;
      const events = Array.isArray(body.events) ? body.events : [];

      if (!deviceId || !events.length) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ accepted: 0, duplicates: 0, error: "Missing device_id or events" }));
        return;
      }

      let accepted = 0;
      let duplicates = 0;
      const lines = [];

      for (const event of events) {
        if (!event.event_id) {
          duplicates++;
          continue;
        }
        if (knownEventIds.has(event.event_id)) {
          duplicates++;
          continue;
        }
        knownEventIds.add(event.event_id);
        accepted++;
        lines.push(JSON.stringify({ ...event, device_id: deviceId }));
      }

      if (lines.length > 0) {
        appendFileSync(EVENTS_FILE, lines.join("\n") + "\n");
      }

      const agg = aggregate();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ accepted, duplicates, aggregate: agg }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ accepted: 0, duplicates: 0, error: e.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

mkdirSync(DATA_DIR, { recursive: true });

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Data dir: ${DATA_DIR}`);
  console.log(`Dist dir: ${DIST_DIR}`);
});