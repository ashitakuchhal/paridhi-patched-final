/**
 * server/lib/indicators.js
 * Pure functions for computing technical indicators from a price/volume series.
 * Moved server-side so the frontend never has to compute them.
 */

/**
 * @param {Array<{price: number, volume: number}>} series
 * @returns {object} computed stats ready to pass to the technical agent
 */
function computeStats(series) {
  const n = series.length;
  if (n < 20) throw new Error(`Need at least 20 data points, got ${n}`);

  const prices  = series.map(p => p.price);
  const volumes = series.map(p => p.volume);

  const currentPrice = prices[n - 1];
  const prevClose    = prices[n - 2];
  const pctChangeDay  = pct(currentPrice, prevClose);
  const pctChange10d  = pct(currentPrice, prices[n - 10]);

  const smaShort = avg(prices.slice(-5));
  const smaLong  = avg(prices.slice(-20));

  // RSI-14 (Wilder's smoothed)
  const rsiApprox = computeRSI(prices, 14);

  // Volume z-score (last bar vs trailing 20 bars)
  const recentVols  = volumes.slice(-20);
  const meanVol     = avg(recentVols);
  const stdVol      = std(recentVols) || 1;
  const volumeZScore = round((volumes[n - 1] - meanVol) / stdVol);

  // Bollinger Band width (20-period, 2σ)
  const bbMean = smaLong;
  const bbStd  = std(prices.slice(-20));
  const bbUpper = round(bbMean + 2 * bbStd);
  const bbLower = round(bbMean - 2 * bbStd);

  return {
    currentPrice: round(currentPrice),
    prevClose:    round(prevClose),
    pctChangeDay: round(pctChangeDay),
    pctChange10d: round(pctChange10d),
    smaShort:     round(smaShort),
    smaLong:      round(smaLong),
    rsiApprox,
    volumeZScore,
    lastVolume:   volumes[n - 1],
    bbUpper,
    bbLower,
    priceVsSmaShort: round(((currentPrice - smaShort) / smaShort) * 100),
    priceVsSmaLong:  round(((currentPrice - smaLong)  / smaLong)  * 100),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr) {
  const m = avg(arr);
  return Math.sqrt(avg(arr.map(v => (v - m) ** 2)));
}

function pct(a, b) {
  return ((a - b) / b) * 100;
}

function round(n, decimals = 2) {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

function computeRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50; // not enough data

  const deltas = prices.slice(1).map((p, i) => p - prices[i]);
  let gains = 0, losses = 0;

  // Seed with simple average of first `period` deltas
  for (let i = 0; i < period; i++) {
    if (deltas[i] > 0) gains  += deltas[i];
    else               losses -= deltas[i];
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Wilder smoothing for remaining deltas
  for (let i = period; i < deltas.length; i++) {
    const d = deltas[i];
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Math.round(100 - 100 / (1 + rs));
}

module.exports = { computeStats };
