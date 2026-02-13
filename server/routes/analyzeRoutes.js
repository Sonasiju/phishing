const express = require("express");
const router = express.Router();
const analyzeUrl = require("../services/urlAnalyzer");

router.post("/analyze", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  const result = analyzeUrl(url);
  res.json(result);
});


module.exports = router;
