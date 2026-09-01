# Paridhi — Multi-Stock Research Desk

A multi-agent retail investor research system backed by **live, free-tier market data**.  
Three specialist Claude agents (technical, sentiment, fundamentals) run in parallel, with a fourth synthesis agent weighted by your risk profile.

---

## Quick Start

### 1. Prerequisites
- **Node.js 22+** — [nodejs.org](https://nodejs.org)
- Three free API keys (no credit card required):

| Service | Signup | Used for | Required? |
|---------|--------|----------|-----------|
| Google Gemini | https://aistudio.google.com/apikey | All agent LLM calls | **Yes** |
| Finnhub.io | https://finnhub.io | Live news by ticker | No — falls back to Google News RSS |
| Alpha Vantage | https://www.alphavantage.co/support/#api-key | Price data fallback | No — falls back to Yahoo only |

> Yahoo Finance (primary price source) requires NO key. For a fast hackathon deploy, you only strictly need the Gemini key.

### 2. Configure your API keys

```bash
copy .env.example .env
```

Edit `.env` and replace the three placeholder values.

### 3. Install and run

```bash
npm install
npm start
```

Open http://localhost:3000 in your browser.

For live reload during development:

```bash
npm run dev    # uses nodemon
```

---

## Using the App

1. Type any ticker in the search bar (e.g. AAPL, MSFT, RELIANCE.NS, TATAMOTORS.NS)
2. Press Enter or GO — live price + indicators are fetched, three agents run in parallel
3. Switch profiles (Conservative / Aggressive) — re-run to see different synthesis
4. Add to Watchlist — click any watchlist item to switch the active ticker
5. Simulate outage — knock out a data feed to see degraded-mode handling

---

## Project Structure

```
paridhi/
├── server/
│   ├── index.js              <- Express server (port 3000)
│   ├── routes/
│   │   ├── stock.js          <- GET /api/stock/:symbol  (Yahoo -> Alpha Vantage)
│   │   ├── news.js           <- GET /api/news/:symbol   (Finnhub -> Google RSS)
│   │   └── claude.js         <- POST /api/claude        (Gemini proxy, endpoint name kept for compat)
│   └── lib/
│       ├── yahoo.js          <- yahoo-finance2 wrapper
│       └── indicators.js     <- SMA, RSI-14, BB, volume z-score
├── public/
│   └── index.html            <- Full frontend (served statically)
├── .env                      <- Your secrets (git-ignored)
├── .env.example              <- Template to commit
└── package.json
```

---

## Indian Stocks (NSE/BSE)

| Exchange | Suffix | Example |
|----------|--------|---------|
| NSE | .NS | RELIANCE.NS |
| BSE | .BO | RELIANCE.BO |
| Auto-detect | (none) | RELIANCE — app tries .NS as fallback |

---

## Disclaimer

This is a prototype. All analysis is AI-generated and purely illustrative.
Nothing here is financial advice.
