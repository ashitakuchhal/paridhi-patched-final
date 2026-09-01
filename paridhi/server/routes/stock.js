/**
 * server/routes/stock.js
 * GET /api/stock/:symbol?range=30
 *
 * Fetches live OHLCV data via yahoo-finance2 (no API key required).
 * Falls back to Alpha Vantage on error (requires ALPHA_VANTAGE_API_KEY).
 * Returns normalised price stats + series array to the frontend.
 */

const express = require("express");
const axios   = require("axios");
const { fetchHistory } = require("../lib/yahoo");
const { computeStats } = require("../lib/indicators");

const router = express.Router();

// ── GET /api/stock/:symbol ────────────────────────────────────────────────────
router.get("/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase().trim();
  const days   = Math.min(parseInt(req.query.range || "30", 10), 365);

  try {
    // ── Primary: Yahoo Finance ───────────────────────────────────────────────
    const data = await fetchHistory(symbol, Math.max(days, 25)); // need ≥25 for indicators

    let stats;
    try {
      stats = computeStats(data.series);
    } catch (_) {
      // Not enough data for full indicator suite — return partial
      stats = {
        currentPrice: data.currentPrice,
        prevClose:    data.prevClose,
        pctChangeDay: data.pctChangeDay,
        pctChange10d: null,
        smaShort: null, smaLong: null,
        rsiApprox: null, volumeZScore: null,
        lastVolume: data.series[data.series.length - 1]?.volume ?? null,
      };
    }

    return res.json({
      ok: true,
      source: "yahoo",
      symbol:   data.symbol,
      name:     data.name,
      exchange: data.exchange,
      currency: data.currency,
      series:   data.series.slice(-days),
      stats,
    });
  } catch (yahooErr) {
    console.warn(`[stock] Yahoo failed for ${symbol}:`, yahooErr.message);

    // ── Fallback: Alpha Vantage ──────────────────────────────────────────────
    const avKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!avKey) {
      return res.status(502).json({
        ok: false,
        error: `Could not fetch data for "${symbol}". Yahoo Finance returned an error and no Alpha Vantage key is configured.`,
        detail: yahooErr.message,
      });
    }

    try {
      const avRes = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol,
          outputsize: "compact",
          apikey: avKey,
        },
        timeout: 15000,
      });

      const ts = avRes.data["Time Series (Daily)"];
      if (!ts) {
        throw new Error(avRes.data?.["Note"] || avRes.data?.["Information"] || "Alpha Vantage returned no data");
      }

      // Sort descending, take last `days` rows
      const entries = Object.entries(ts)
        .sort(([a], [b]) => a < b ? 1 : -1)
        .slice(0, days)
        .reverse();

      const series = entries.map(([date, bar]) => ({
        date,
        price:  Math.round(parseFloat(bar["4. close"]) * 100) / 100,
        volume: parseInt(bar["5. volume"], 10),
      }));

      let stats;
      try { stats = computeStats(series); } catch (_) { stats = {}; }

      return res.json({
        ok: true,
        source: "alphavantage",
        symbol,
        name:     symbol,
        exchange: "",
        currency: "USD",
        series,
        stats,
      });
    } catch (avErr) {
      return res.status(502).json({
        ok: false,
        error: `Both Yahoo Finance and Alpha Vantage failed for "${symbol}".`,
        detail: avErr.message,
      });
    }
  }
});

module.exports = router;
