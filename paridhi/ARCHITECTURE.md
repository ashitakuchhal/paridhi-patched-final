# Paridhi — Architecture & Decision Logic Summary
### PS-01: Multi-Agent Autonomous Financial Intelligence System for Retail Investors

## 1. Overview
Paridhi is a multi-agent research desk that turns live market data, news, and
filing disclosures into a single, explainable, risk-profile-aware
recommendation for a retail investor, in under a few seconds per ticker.

## 2. Data pipeline
- **Price/volume**: Yahoo Finance (`yahoo-finance2`, no key) → Alpha Vantage
  (fallback, key required). Server-side `indicators.js` computes SMA-5/20,
  Wilder RSI-14, Bollinger Bands, and a volume z-score — never sent raw to
  the LLM without pre-computation, so agent reasoning is grounded in
  numbers, not guesses.
- **News**: Finnhub company-news (fallback: Google News RSS, no key).
- **Filings**: a local synthetic filings corpus (`server/lib/corpus.js`)
  retrieved by ticker via `GET /api/filings/:symbol` — the retrieval step
  for the fundamentals agent's RAG pipeline.

## 3. Multi-agent architecture
Three specialist agents run **in parallel** (`Promise.all`), each with a
fixed output contract `{label, confidence, reasoning, citedIds?}`:

| Agent | Input | Dimension |
|---|---|---|
| Technical/Momentum | computed price/volume stats | price action |
| Sentiment/News | fetched headlines | market narrative |
| Fundamentals (RAG) | **retrieved** filing snippets (ids + text) | company quality |

The fundamentals agent is instructed to ground every claim in the retrieved
snippet ids it was given and to cite them explicitly — it cannot fabricate
facts beyond the retrieved context. Citation ids are rendered in the UI as
chips (hoverable to show the underlying source text), giving visible
attribution.

A fourth **synthesis agent** receives all three structured outputs plus the
user's active risk profile and produces one final call:
`{recommendation, confidence, suggestedPositionPct, reasoning, degradedNote}`.

## 4. User profiling
Two profiles (Conservative / Aggressive) carry different weighting
instructions into the synthesis prompt — same market inputs, different
`minConfidenceToAct` and `maxPositionPct`, producing demonstrably different
recommendations for the same ticker on the same run.

## 5. Degraded-mode handling
A "simulate outage" control can kill any one of the three data feeds. The
affected agent returns a structured `unavailable` result (never a fabricated
value); the synthesis agent is told which signal is missing, explicitly
lowers confidence, and surfaces a degraded-mode banner in the UI — the
pipeline never crashes or silently drops the gap.

## 6. Performance logging
Each run appends a row to an in-session metrics table with: total pipeline
latency (ms), combined agent confidence, and per-agent latency (shown per
signal card). Portfolio-level risk concentration (Herfindahl-Hirschman Index)
is computed live from watchlist allocations as a fourth, portfolio-level
metric.

## 7. Known limitations (for transparency to judges)
- The filings corpus is a small synthetic dataset, not a live SEBI/EDGAR
  feed or a real vector database — swapping `corpus.js`'s keyword match for
  an embeddings index is the natural next step.
- Signal accuracy against realized forward returns is not tracked in this
  build (no historical backtest loop); only latency/confidence/HHI are
  logged live.
