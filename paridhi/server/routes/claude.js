/**
 * server/routes/claude.js
 * POST /api/claude
 *
 * Body: { system: string, userContent: string }
 * Returns: parsed JSON from the model's response.
 *
 * Now powered by Google Gemini 2.5 Flash — completely FREE tier.
 * Get your key at: https://aistudio.google.com/apikey
 *
 * Keeps the Gemini API key entirely server-side —
 * the browser never sees it.
 */

const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// ── POST /api/claude  (endpoint name kept for backwards compat with frontend) ──
router.post("/", async (req, res) => {
  const { system, userContent, model } = req.body;

  if (!system || !userContent) {
    return res.status(400).json({
      ok: false,
      error: "Missing system or userContent in request body.",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      ok: false,
      error: "GEMINI_API_KEY is not configured. Add it to your .env file. Get a free key at https://aistudio.google.com/apikey",
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const geminiModel = genAI.getGenerativeModel({
      model: model || "gemini-3.6-flash",   // Best free model — fast + accurate
      systemInstruction: system,             // System prompt goes here in Gemini SDK
      generationConfig: {
        temperature: 0.2,                    // Low temp = more consistent JSON output
        maxOutputTokens: 8192,
        responseMimeType: "application/json", // Ask Gemini to return JSON directly
      },
    });

    const result = await geminiModel.generateContent(userContent);
    const rawText = result.response.text().trim();

    // Strip any accidental markdown fences (shouldn't happen with responseMimeType,
    // but good to be defensive)
    const clean = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (_) {
      // Try to pull out a JSON object/array from inside the text
      const match = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        throw new Error(`Model returned non-JSON text: ${clean.slice(0, 300)}`);
      }
    }

    return res.json({ ok: true, result: parsed });
  } catch (err) {
    console.error("[gemini] Error:", err.message);
    return res.status(500).json({
      ok: false,
      error: err.message || "Unknown error from Gemini API",
    });
  }
});

module.exports = router;
