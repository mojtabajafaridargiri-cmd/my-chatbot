// api/ai.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server config error: API key missing" });
    }

    const payload = {
      contents: [{ parts: [{ text: message }] }]
    };

    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const json = await r.json();

    if (!r.ok) {
      return res.status(502).json({ error: "Upstream API error", status: r.status, body: json });
    }

    return res.status(200).json(json);
  } catch (err) {
    return res.status(500).json({ error: "Unexpected internal server error", detail: err.message || String(err) });
  }
}
