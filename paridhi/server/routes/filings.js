/**
 * server/routes/filings.js
 * GET /api/filings/:symbol
 *
 * Retrieval endpoint for the fundamentals agent. Returns the top-matching
 * snippets from the local synthetic filings corpus so the LLM call can be
 * grounded in retrieved source material (RAG), with IDs the model can cite
 * and the frontend can display as attribution.
 */

const express = require("express");
const { retrieveFilings } = require("../lib/corpus");

const router = express.Router();

router.get("/:symbol", (req, res) => {
  try {
    const rawSymbol = req.params.symbol;

    if (!rawSymbol || typeof rawSymbol !== "string") {
      return res.status(400).json({
        ok: false,
        error: "Valid stock symbol parameter is required.",
      });
    }

    const symbol = rawSymbol.toUpperCase().trim();

    // Retrieve filings safely
    const snippets = retrieveFilings(symbol, 3) || [];

    return res.json({ ok: true, symbol, snippets });
  } catch (err) {
    console.error(`[filings] Error retrieving filings for ${req.params.symbol}:`, err.message);

    // Prevents the request from hanging on Vercel if corpus retrieval fails
    return res.status(500).json({
      ok: false,
      error: err.message || "Failed to retrieve SEC filings context.",
    });
  }
});

module.exports = router;