/**
 * server/lib/corpus.js
 *
 * Tiny in-memory "filings corpus" of synthetic disclosure snippets, used so
 * the fundamentals agent can do real retrieval-augmented generation instead
 * of just asking the LLM to recall facts from memory.
 *
 * Each entry simulates a line from an earnings call, an annual report, or a
 * regulatory filing. In a production system this would be a vector DB over
 * real SEBI/SEC filings; here it's a small keyword-searchable JSON corpus,
 * which satisfies the PS-01 dependency: "a document corpus of regulatory and
 * financial disclosures ... or equivalent synthetic documents suitable for
 * semantic retrieval."
 */

const CORPUS = [
  // ── Generic / ticker-agnostic fallback facts ──────────────────────────
  { id: "GEN-001", ticker: "*", text: "Sector-wide analyst commentary (Q_current) notes that valuation multiples across large-cap equities remain above their 5-year median, raising downside risk if earnings growth disappoints." },
  { id: "GEN-002", ticker: "*", text: "Macro filing note: rising benchmark interest rates increase the discount rate applied to future cash flows, compressing valuations for high-growth, low-current-earnings companies more than for mature dividend payers." },
  { id: "GEN-003", ticker: "*", text: "Regulatory disclosure trend: companies citing 'input cost inflation' and 'supply chain normalization' in recent quarterly filings have shown mixed correlation with subsequent margin recovery." },

  // ── Example large-cap synthetic snippets ──────────────────────────────
  { id: "AAPL-001", ticker: "AAPL", text: "10-K excerpt (synthetic): Services revenue grew double-digit percentage year-over-year, now representing a growing share of total revenue and carrying materially higher gross margin than hardware segments." },
  { id: "AAPL-002", ticker: "AAPL", text: "Earnings call excerpt (synthetic): Management flagged continued softness in Greater China hardware demand while reiterating an active capital-return program via buybacks and dividends." },

  { id: "MSFT-001", ticker: "MSFT", text: "10-K excerpt (synthetic): Cloud/Azure segment revenue growth continues to outpace the broader company average, with management citing AI-services demand as a growth driver." },
  { id: "MSFT-002", ticker: "MSFT", text: "Filing note (synthetic): Capital expenditure guidance was raised to fund data-center capacity, which management expects to pressure near-term free cash flow before benefiting long-term revenue." },

  { id: "TSLA-001", ticker: "TSLA", text: "Earnings call excerpt (synthetic): Automotive gross margin declined year-over-year following multiple price cuts intended to defend delivery volume amid rising EV competition." },
  { id: "TSLA-002", ticker: "TSLA", text: "10-Q excerpt (synthetic): Energy generation and storage segment revenue grew faster than the automotive segment, partially offsetting automotive margin pressure." },

  { id: "RELIANCE-001", ticker: "RELIANCE.NS", text: "Annual report excerpt (synthetic): Jio (digital services) and Retail segments contributed a growing share of consolidated EBITDA, reducing the group's historical dependence on refining/petrochemicals margins." },
  { id: "RELIANCE-002", ticker: "RELIANCE.NS", text: "SEBI filing note (synthetic): Refining margins (GRMs) were reported as volatile quarter-over-quarter, tracking global crude and product-spread movements." },

  { id: "TATAMOTORS-001", ticker: "TATAMOTORS.NS", text: "Filing excerpt (synthetic): Jaguar Land Rover (JLR) subsidiary reported improved order backlog and margin recovery, a key swing factor for consolidated profitability." },
  { id: "TATAMOTORS-002", ticker: "TATAMOTORS.NS", text: "Earnings call excerpt (synthetic): Domestic commercial vehicle demand was described as steady, while passenger EV segment investment remains a near-term cash outflow." },

  { id: "INFY-001", ticker: "INFY.NS", text: "Annual report excerpt (synthetic): Management cited cautious discretionary IT spending among large enterprise clients in North America and Europe as a near-term headwind to revenue growth guidance." },
  { id: "INFY-002", ticker: "INFY.NS", text: "Filing note (synthetic): Large deal total contract value (TCV) signings were reported as healthy, which management framed as a leading indicator for revenue growth 2-3 quarters out." },
];

/**
 * Retrieve the top-N most relevant snippets for a given ticker.
 * Simple retrieval strategy (keyword/ticker match) — swap for a real
 * embeddings + vector DB lookup later without changing the call site.
 */
function retrieveFilings(symbol, limit = 3) {
  const sym = (symbol || "").toUpperCase().trim();
  const exact = CORPUS.filter(c => c.ticker === sym);
  const generic = CORPUS.filter(c => c.ticker === "*");
  const combined = [...exact, ...generic].slice(0, limit);
  return combined.map(({ id, text }) => ({ id, text }));
}

module.exports = { retrieveFilings };
