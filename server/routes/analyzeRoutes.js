const express = require("express");
const analyzeURL = require("../services/urlAnalyzer");

const router = express.Router();

router.post("/analyze", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    const result = analyzeURL(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error analyzing URL" });
  }
});


module.exports = router;
