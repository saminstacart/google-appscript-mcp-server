import express from "express";
import cors from "cors";
import { spawn } from "node:child_process";
import crypto from "node:crypto";

// -------------------- Config --------------------
const AUTH_TOKEN = process.env.AUTH_TOKEN;                   // for MCP HTTP calls
const PORT = process.env.PORT || 3000;

// GAS MCP stdio command
const CMD = process.env.MCP_CMD || "node";
const ARGS = (process.env.MCP_ARGS || "mcpServer.js").split(" ");

// Google OAuth config (from Google Cloud Console)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET || "";

// The public base URL of this service (your Render URL), no trailing slash
// e.g. https://gas-mcp-bridge.onrender.com
const BASE_URL = process.env.BASE_URL || "";

// Where we keep the refresh token at runtime.
// On free Render we can’t write to keychain or persist a disk,
// so we read it from env. You’ll set REFRESH_TOKEN later.
let REFRESH_TOKEN = process.env.REFRESH_TOKEN || "";

// Scopes: least-privilege set for Apps Script management
const SCOPES = [
  "https://www.googleapis.com/auth/script.projects",
  "https://www.googleapis.com/auth/script.projects.readonly",
  "https://www.googleapis.com/auth/script.deployments",
  "https://www.googleapis.com/auth/script.deployments.readonly",
  "https://www.googleapis.com/auth/script.processes",
  "https://www.googleapis.com/auth/script.metrics"
];

// -------------------- Minimal helpers --------------------
function urlEncode(obj) {
  return Object.entries(obj).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}

// Build Google OAuth URLs without extra deps
function buildAuthUrl() {
  const state = crypto.randomBytes(16).toString("hex");
  const params = {
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  `${BASE_URL}/oauth/callback`,
    response_type: "code",
    access_type:   "offline",
    prompt:        "consent",
    scope:         SCOPES.join(" "),
    state
  };
  return `https://accounts.google.com/o/oauth2/v2/auth?${urlEncode(params)}`;
}

async function exchangeCodeForTokens(code) {
  const body = urlEncode({
    code,
    client_id:     GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri:  `${BASE_URL}/oauth/callback`,
    grant_type:    "authorization_code"
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return res.json(); // contains refresh_token (on first consent)
}

// -------------------- Express app --------------------
const app = express();
app.use(cors());
app.use(express.json());

// PUBLIC: health check (Render hits this without auth)
app.get("/healthz", (_, res) => res.send("ok"));

// PUBLIC: landing page
app.get("/", (_, res) => {
  res.type("html").send(`
    <h1>GAS MCP Bridge</h1>
    <p>Status: ${REFRESH_TOKEN ? "Authorized ✅" : "Not authorized ❌"}</p>
    <ul>
      <li><a href="/oauth/start">Start Google OAuth</a></li>
      <li><code>/healthz</code> should say <b>ok</b></li>
    </ul>
  `);
});

// PUBLIC: start OAuth (no shell needed)
app.get("/oauth/start", (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !BASE_URL) {
    return res.status(500).send("Missing GOOGLE_APP_SCRIPT_API_CLIENT_ID / GOOGLE_APP_SCRIPT_API_CLIENT_SECRET / BASE_URL env vars.");
  }
  const url = buildAuthUrl();
  res.redirect(url);
});

// PUBLIC: OAuth callback — shows refresh token for you to copy to Render env
app.get("/oauth/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing ?code");
    const tokens = await exchangeCodeForTokens(code);
    const rt = tokens.refresh_token || "";
    if (!rt) return res.status(400).send("No refresh_token returned; try again with 'prompt=consent' and ensure this is the first approval for this client.");
    REFRESH_TOKEN = rt; // use immediately for this runtime
    res.type("html").send(`
      <h2>OAuth success</h2>
      <p>Copy this Refresh Token, then in Render → Settings → Environment set <code>REFRESH_TOKEN</code> to this exact value and redeploy:</p>
      <pre style="white-space: pre-wrap; word-wrap: break-word; border: 1px solid #ddd; padding: 8px;">${rt}</pre>
      <p>After saving the env var, click "Manual Deploy → Deploy latest commit".</p>
    `);
  } catch (e) {
    console.error(e);
    res.status(500).send(String(e));
  }
});

// AUTH middleware for MCP endpoints
app.use((req, res, next) => {
  const hdr = req.headers.authorization || "";
  if (!AUTH_TOKEN || hdr !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// MCP bridge: proxy a single JSON message to stdio MCP child
let proc = null;
function ensureChild() {
  // Spawn only once per process; pass REFRESH_TOKEN to child env
  if (!proc) {
    const childEnv = { ...process.env };
    if (REFRESH_TOKEN) childEnv.REFRESH_TOKEN = REFRESH_TOKEN;
    proc = spawn(CMD, ARGS, { stdio: ["pipe", "pipe", "inherit"], env: childEnv });
    proc.on("exit", (code) => { console.error("MCP child exited:", code); proc = null; });
  }
}

app.post("/mcp/message", async (req, res) => {
  try {
    ensureChild();
    const payload = JSON.stringify(req.body) + "\n";
    proc.stdin.write(payload);
    let data = "";
    const onData = (chunk) => { data += chunk.toString(); };
    const onDone = () => {
      proc.stdout.off("data", onData);
      res.setHeader("content-type", "application/json");
      res.send(data.trim());
    };
    proc.stdout.once("data", onData);
    setTimeout(onDone, 60);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log("Bridge up on", PORT));
