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

// Helper to enforce a maximum wait time (15 seconds) so Vercel never hangs forever
const fetchWithTimeout = (promise, ms = 15000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Gemini API request timed out")), ms)
  );
  return Promise.race([promise, timeout]);
};

// ── POST /api/claude ──
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
      error: "GEMINI_API_KEY is not configured on Vercel environment variables.",
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use a stable fallback model name
    const targetModel = model || "gemini-2.5-flash-lite";

    const geminiModel = genAI.getGenerativeModel({
      model: targetModel,
      systemInstruction: system,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    // Execute API call wrapped in the 15s timeout safeguard
    const result = await fetchWithTimeout(geminiModel.generateContent(userContent));
    const rawText = result.response.text().trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (_) {
      // Clean up markdown fences if fallback parsing is required
      const clean = rawText.replace(/```json|```/g, "").trim();
      const match = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        throw new Error(`Model returned non-JSON text: ${clean.slice(0, 150)}`);
      }
    }

    return res.json({ ok: true, result: parsed });
  } catch (err) {
    console.error("[gemini] Error:", err.message);

    // Always respond with JSON so frontend stops showing loading/fetching states
    return res.status(500).json({
      ok: false,
      error: err.message || "Unknown error from Gemini API",
    });
  }
});

module.exports = router;
