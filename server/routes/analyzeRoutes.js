const express = require("express");
const router = express.Router();
const analyzeUrl = require("../services/urlAnalyzer");

router.post("/analyze", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const result = await analyzeUrl(url);

    // Score breakdown
    const breakdown = {
      lexical: result.reasons.filter(r =>
        r.includes("URL") ||
        r.includes("Domain") ||
        r.includes("top-level")
      ).length * 5,

      content: result.reasons.filter(r =>
        r.includes("Form") ||
        r.includes("password") ||
        r.includes("phrase")
      ).length * 5,

      ai: result.aiAnalysis && result.aiAnalysis.isPhishing ? 25 : 0
    };

    const logEntry = {
      url,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      timestamp: new Date().toISOString(),
      aiDetected: result.aiAnalysis
        ? result.aiAnalysis.isPhishing
        : false
    };

    global.threatHistory.push(logEntry);

    if (global.threatHistory.length > 50) {
      global.threatHistory.shift();
    }

    res.json({
      ...result,
      breakdown
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

module.exports = router;
