/**
 * server/routes/stock.js
 * GET /api/stock/:symbol?range=30
 *
 * Fetches live OHLCV data via yahoo-finance2 (no API key required).
 * Falls back to Alpha Vantage on error (requires ALPHA_VANTAGE_API_KEY).
 * Returns normalised price stats + series array to the frontend.
 */

const express = require("express");
const axios = require("axios");
const { fetchHistory } = require("../lib/yahoo");
const { computeStats } = require("../lib/indicators");

const router = express.Router();

// Helper to enforce a strict timeout (10 seconds) on async calls
const fetchWithTimeout = (promise, ms = 10000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Data fetch timed out")), ms)
  );
  return Promise.race([promise, timeout]);
};

// ── GET /api/stock/:symbol ────────────────────────────────────────────────────
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

    // Parse and validate query range safely to prevent NaN issues
    const parsedRange = parseInt(req.query.range || "30", 10);
    const days = Number.isNaN(parsedRange) ? 30 : Math.min(Math.max(parsedRange, 5), 365);

    // ── Primary: Yahoo Finance ───────────────────────────────────────────────
    try {
      const requiredDays = Math.max(days, 25); // Need >= 25 data points for indicators
      const data = await fetchWithTimeout(fetchHistory(symbol, requiredDays), 10000);

      if (!data || !data.series || data.series.length === 0) {
        throw new Error("Yahoo Finance returned an empty series.");
      }

      let stats;
      try {
        stats = computeStats(data.series);
      } catch (_) {
        // Return partial stats if indicator computation fails
        stats = {
          currentPrice: data.currentPrice ?? null,
          prevClose: data.prevClose ?? null,
          pctChangeDay: data.pctChangeDay ?? null,
          pctChange10d: null,
          smaShort: null, smaLong: null,
          rsiApprox: null, volumeZScore: null,
          lastVolume: data.series[data.series.length - 1]?.volume ?? null,
        };
      }

      return res.json({
        ok: true,
        source: "yahoo",
        symbol: data.symbol || symbol,
        name: data.name || symbol,
        exchange: data.exchange || "",
        currency: data.currency || "USD",
        series: data.series.slice(-days),
        stats,
      });
    } catch (yahooErr) {
      console.warn(`[stock] Yahoo failed for ${symbol}:`, yahooErr.message);

      // ── Fallback: Alpha Vantage ──────────────────────────────────────────────
      const avKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!avKey) {
        return res.status(200).json({
          ok: false,
          source: "none",
          symbol,
          series: [],
          stats: {},
          error: `Could not fetch stock data for "${symbol}". Yahoo Finance failed and no Alpha Vantage key is configured.`,
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
          timeout: 8000,
        });

        const ts = avRes.data?.["Time Series (Daily)"];
        if (!ts) {
          const apiNote = avRes.data?.["Note"] || avRes.data?.["Information"] || "Alpha Vantage rate limit reached or symbol not found.";
          throw new Error(apiNote);
        }

        const entries = Object.entries(ts)
          .sort(([a], [b]) => (a < b ? 1 : -1))
          .slice(0, days)
          .reverse();

        const series = entries.map(([date, bar]) => ({
          date,
          price: Math.round(parseFloat(bar["4. close"]) * 100) / 100,
          volume: parseInt(bar["5. volume"], 10) || 0,
        }));

        let stats;
        try {
          stats = computeStats(series);
        } catch (_) {
          stats = {};
        }

        return res.json({
          ok: true,
          source: "alphavantage",
          symbol,
          name: symbol,
          exchange: "",
          currency: "USD",
          series,
          stats,
        });
      } catch (avErr) {
        console.warn(`[stock] Alpha Vantage failed for ${symbol}:`, avErr.message);

        // Return 200 with empty fallback payload to prevent UI hanging
        return res.status(200).json({
          ok: false,
          source: "none",
          symbol,
          series: [],
          stats: {},
          error: `Stock data temporarily unavailable for "${symbol}". Both Yahoo Finance and Alpha Vantage failed.`,
        });
      }
    }
  } catch (globalErr) {
    console.error("[stock] Unexpected router error:", globalErr.message);
    return res.status(500).json({
      ok: false,
      error: globalErr.message || "Internal server error fetching stock data.",
    });
  }
});

module.exports = router;
