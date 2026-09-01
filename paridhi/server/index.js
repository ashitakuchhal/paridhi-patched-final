require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const stockRouter = require("./routes/stock");
const newsRouter = require("./routes/news");
const claudeRouter = require("./routes/claude");
const filingsRouter = require("./routes/filings");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Static frontend ─────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../public")));

// ── API routes ───────────────────────────────────────────────────────────────
app.use("/api/stock", stockRouter);
app.use("/api/news", newsRouter);
app.use("/api/claude", claudeRouter);
app.use("/api/filings", filingsRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// ── Catch-all → index.html (SPA) ─────────────────────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🟢 Paridhi server running → http://localhost:${PORT}\n`);
  if (!process.env.GEMINI_API_KEY)       console.warn("  ⚠  GEMINI_API_KEY not set in .env — agents will fail. Get one free at https://aistudio.google.com/apikey");
  if (!process.env.FINNHUB_API_KEY)      console.warn("  ⚠  FINNHUB_API_KEY not set in .env (news will fall back to RSS)");
  if (!process.env.ALPHA_VANTAGE_API_KEY) console.warn("  ⚠  ALPHA_VANTAGE_API_KEY not set in .env (price will use Yahoo only)");
});
