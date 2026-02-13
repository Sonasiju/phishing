const { parse } = require("tldts");

function containsIP(url) {
  const ipRegex = /(\d{1,3}\.){3}\d{1,3}/;
  return ipRegex.test(url);
}

function containsSuspiciousWords(url) {
  const suspiciousWords = [
    "login",
    "verify",
    "update",
    "secure",
    "account",
    "bank",
    "confirm",
    "password"
  ];

  return suspiciousWords.some(word =>
    url.toLowerCase().includes(word)
  );
}

function analyzeURL(url) {
  let riskScore = 0;

  const length = url.length;
  const dotCount = (url.match(/\./g) || []).length;
  const hasIP = containsIP(url);
  const hasHTTPS = url.startsWith("https");
  const suspiciousWord = containsSuspiciousWords(url);

  // Scoring Logic
  if (length > 100) riskScore += 20;
if (dotCount > 5) riskScore += 15;
if (url.includes("@")) riskScore += 15;
if (url.includes("//") && url.lastIndexOf("//") > 7) riskScore += 10;

  // Cap at 100
  if (riskScore > 100) riskScore = 100;

  const prediction = riskScore >= 50 ? "Phishing" : "Legitimate";

  return {
    prediction,
    riskScore,
    features: {
      length,
      dotCount,
      hasIP,
      hasHTTPS,
      suspiciousWord
    }
  };
}

module.exports = analyzeURL;
