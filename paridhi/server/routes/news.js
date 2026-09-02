/**
 * server/routes/news.js
 * GET /api/news/:symbol
 *
 * Returns up to 8 recent headlines for a ticker.
 * Primary: Finnhub.io company-news  (requires FINNHUB_API_KEY)
 * Fallback: Google News RSS          (no key required)
 */

const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");

const router = express.Router();

// ── GET /api/news/:symbol ─────────────────────────────────────────────────────
router.get("/:symbol", async (req, res) => {
  try {
    const rawSymbol = req.params.symbol;

    if (!rawSymbol || typeof rawSymbol !== "string") {
      return res.status(400).json({
        ok: false,
        error: "Valid stock symbol parameter is required.",
      });
    }

    const symbol = rawSymbol.toUpperCase().trim();

    // ── Primary: Finnhub ────────────────────────────────────────────────────────
    const finnhubKey = process.env.FINNHUB_API_KEY;
    if (finnhubKey) {
      try {
        const today = new Date();
        const from = new Date(today);
        from.setDate(from.getDate() - 7);

        const fmt = (d) => d.toISOString().split("T")[0];
        const fRes = await axios.get("https://finnhub.io/api/v1/company-news", {
          params: { symbol, from: fmt(from), to: fmt(today), token: finnhubKey },
          timeout: 6000, // Slightly reduced timeout for fast fallback
        });

        const headlines = (fRes.data || [])
          .slice(0, 8)
          .map((a) => a.headline)
          .filter(Boolean);

        if (headlines.length > 0) {
          return res.json({ ok: true, source: "finnhub", symbol, headlines });
        }
      } catch (err) {
        console.warn(`[news] Finnhub failed for ${symbol}:`, err.message);
      }
    }

    // ── Fallback: Google News RSS ────────────────────────────────────────────────
    try {
      const searchTerm = symbol.replace(/\.(NS|BO|L|T)$/i, "");
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
        searchTerm + " stock"
      )}&hl=en-IN&gl=IN&ceid=IN:en`;

      const rssRes = await axios.get(rssUrl, {
        timeout: 8000,
        headers: {
          // Standard browser User-Agent prevents Google's 403 bot-block
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      const parsed = await xml2js.parseStringPromise(rssRes.data, {
        explicitArray: false,
      });

      const items = parsed?.rss?.channel?.item || [];
      const arr = Array.isArray(items) ? items : [items];

      const headlines = arr
        .slice(0, 8)
        .map((i) => i.title?.replace(/<[^>]+>/g, "").trim())
        .filter(Boolean);

      if (headlines.length > 0) {
        return res.json({ ok: true, source: "google-rss", symbol, headlines });
      }

      throw new Error("RSS returned no items");
    } catch (rssErr) {
      console.warn(`[news] Google RSS failed for ${symbol}:`, rssErr.message);

      // Return a 200 payload with empty headlines array instead of crashing frontend
      return res.json({
        ok: false,
        source: "none",
        symbol,
        headlines: [],
        error: "News unavailable from Finnhub and Google RSS",
      });
    }
  } catch (globalErr) {
    console.error(`[news] Unexpected router error:`, globalErr.message);
    return res.status(500).json({
      ok: false,
      error: globalErr.message || "Internal server error fetching news.",
    });
  }
});

module.exports = router;