import { spawn } from "node:child_process";
import express from "express";
import cors from "cors";

const CMD = process.env.MCP_CMD || "node";
const ARGS = (process.env.MCP_ARGS || "dist/index.js").split(" ");
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const PORT = process.env.PORT || 3000;

const proc = spawn(CMD, ARGS, { stdio: ["pipe", "pipe", "inherit"] });
proc.on("exit", (code) => { console.error("MCP child exited:", code); process.exit(code || 1); });

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const hdr = req.headers.authorization || "";
  if (!AUTH_TOKEN || hdr !== `Bearer ${AUTH_TOKEN}`) return res.status(401).json({ error: "Unauthorized" });
  next();
});

app.post("/mcp/message", async (req, res) => {
  try {
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
    setTimeout(onDone, 50);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/healthz", (_, res) => res.send("ok"));
app.listen(PORT, () => console.log("Bridge up on", PORT));
