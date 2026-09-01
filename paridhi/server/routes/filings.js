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
  const symbol = req.params.symbol.toUpperCase().trim();
  const snippets = retrieveFilings(symbol, 3);
  res.json({ ok: true, symbol, snippets });
});

module.exports = router;
