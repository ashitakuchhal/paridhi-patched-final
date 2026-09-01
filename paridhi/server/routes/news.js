/**
 * server/routes/news.js
 * GET /api/news/:symbol
 *
 * Returns up to 8 recent headlines for a ticker.
 * Primary: Finnhub.io company-news  (requires FINNHUB_API_KEY)
 * Fallback: Google News RSS          (no key required)
 */

const express = require("express");
const axios   = require("axios");
const xml2js  = require("xml2js");

const router = express.Router();

// ── GET /api/news/:symbol ─────────────────────────────────────────────────────
router.get("/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase().trim();

  // ── Primary: Finnhub ────────────────────────────────────────────────────────
  const finnhubKey = process.env.FINNHUB_API_KEY;
  if (finnhubKey) {
    try {
      const today = new Date();
      const from  = new Date(today);
      from.setDate(from.getDate() - 7);

      const fmt = d => d.toISOString().split("T")[0];
      const fRes = await axios.get("https://finnhub.io/api/v1/company-news", {
        params: { symbol, from: fmt(from), to: fmt(today), token: finnhubKey },
        timeout: 8000,
      });

      const headlines = (fRes.data || [])
        .slice(0, 8)
        .map(a => a.headline)
        .filter(Boolean);

      if (headlines.length > 0) {
        return res.json({ ok: true, source: "finnhub", symbol, headlines });
      }
      // Finnhub returned no articles — fall through to RSS
    } catch (err) {
      console.warn(`[news] Finnhub failed for ${symbol}:`, err.message);
    }
  }

  // ── Fallback: Google News RSS ────────────────────────────────────────────────
  try {
    // For Indian tickers, strip the exchange suffix for a cleaner search
    const searchTerm = symbol.replace(/\.(NS|BO|L|T)$/i, "");
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchTerm + " stock")}&hl=en-IN&gl=IN&ceid=IN:en`;

    const rssRes = await axios.get(rssUrl, {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ParidhiBot/1.0)" },
    });

    const parsed = await xml2js.parseStringPromise(rssRes.data, { explicitArray: false });
    const items  = parsed?.rss?.channel?.item || [];
    const arr    = Array.isArray(items) ? items : [items];

    const headlines = arr
      .slice(0, 8)
      .map(i => i.title?.replace(/<[^>]+>/g, "").trim()) // strip any HTML entities
      .filter(Boolean);

    if (headlines.length > 0) {
      return res.json({ ok: true, source: "google-rss", symbol, headlines });
    }

    throw new Error("RSS returned no items");
  } catch (rssErr) {
    console.warn(`[news] Google RSS failed for ${symbol}:`, rssErr.message);
    return res.status(502).json({
      ok: false,
      error: `Could not fetch news for "${symbol}". Both Finnhub and Google RSS failed.`,
      headlines: [],
    });
  }
});

module.exports = router;
