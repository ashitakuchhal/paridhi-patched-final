/**
 * server/lib/yahoo.js
 * Thin wrapper around yahoo-finance2 for OHLCV + quote data.
 *
 * Ticker normalisation rules:
 *   - If the ticker already contains "." (e.g. "RELIANCE.NS") → use as-is
 *   - If the ticker matches an NSE/BSE pattern heuristic → append ".NS"
 *   - Otherwise → treat as US ticker
 */

const YahooFinance = require("yahoo-finance2").default;

// v3+: instantiate the class (breaking change from v2)
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

/**
 * Normalise a user-entered ticker to a Yahoo Finance symbol.
 * NSE stocks need a ".NS" suffix; BSE stocks need ".BO".
 * We default to .NS for Indian tickers (most common).
 */
function normaliseSymbol(raw) {
  const s = raw.trim().toUpperCase();
  if (s.includes(".")) return s; // already qualified
  // Simple heuristic: all-alpha Indian tickers ≤ 10 chars that aren't in the
  // set of well-known US tickers get .NS appended when the caller explicitly
  // sets the exchange — or we let Yahoo resolve it automatically.
  return s;
}

/**
 * Fetch historical daily closes + volumes.
 * @param {string} symbol  — e.g. "AAPL" | "RELIANCE.NS"
 * @param {number} days    — how many trading days of history to return (≥10)
 * @returns {{ symbol, name, currentPrice, prevClose, pctChangeDay, series }}
 */
async function fetchHistory(symbol, days = 30) {
  const sym = normaliseSymbol(symbol);

  // Compute a start date far enough back to get `days` trading days of data
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Math.ceil(days * 1.6)); // buffer for weekends/holidays

  let chart, quote;
  try {
    [chart, quote] = await Promise.all([
      yf.chart(sym, {
        period1: startDate.toISOString().split("T")[0],
        interval: "1d",
      }),
      yf.quoteSummary(sym, { modules: ["price", "summaryProfile"] }),
    ]);
  } catch (err) {
    // Try appending .NS if bare ticker failed (common for Indian equities)
    if (!sym.includes(".") && !sym.includes(".NS")) {
      const nsSym = sym + ".NS";
      [chart, quote] = await Promise.all([
        yf.chart(nsSym, {
          period1: startDate.toISOString().split("T")[0],
          interval: "1d",
        }),
        yf.quoteSummary(nsSym, { modules: ["price", "summaryProfile"] }),
      ]);
    } else {
      throw err;
    }
  }

  const indicators = chart.indicators?.quote?.[0];
  const timestamps = chart.timestamp || [];

  if (!indicators || timestamps.length === 0) {
    throw new Error(`No historical data returned for ${sym}`);
  }

  // Build a clean series array
  const rawSeries = timestamps.map((ts, i) => ({
    date: new Date(ts * 1000).toISOString().split("T")[0],
    price: indicators.close?.[i] ?? null,
    volume: indicators.volume?.[i] ?? 0,
  })).filter(d => d.price !== null && d.price > 0);

  // Take the last `days` data points
  const series = rawSeries.slice(-days);

  const priceInfo = quote.price;
  const currentPrice = priceInfo?.regularMarketPrice ?? series[series.length - 1]?.price;
  const prevClose   = priceInfo?.regularMarketPreviousClose ?? series[series.length - 2]?.price;
  const pctChangeDay = prevClose
    ? ((currentPrice - prevClose) / prevClose) * 100
    : 0;

  return {
    symbol: sym,
    name: priceInfo?.longName || priceInfo?.shortName || sym,
    exchange: priceInfo?.exchangeName || "",
    currency: priceInfo?.currency || "USD",
    currentPrice: round(currentPrice),
    prevClose:    round(prevClose),
    pctChangeDay: round(pctChangeDay),
    series,
  };
}

function round(n, decimals = 2) {
  if (n == null) return null;
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

module.exports = { fetchHistory, normaliseSymbol };
