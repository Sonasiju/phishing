function analyzeUrl(url) {
  let score = 0;
  let reasons = [];

  // 1️⃣ Check HTTPS
  if (!url.startsWith("https://")) {
    score += 20;
    reasons.push("URL does not use HTTPS");
  }

  // 2️⃣ URL Length
  if (url.length > 75) {
    score += 15;
    reasons.push("URL is unusually long");
  }

  // 3️⃣ Count Dots
  const dotCount = (url.match(/\./g) || []).length;
  if (dotCount > 4) {
    score += 10;
    reasons.push("Too many subdomains");
  }

  // 4️⃣ Check IP Address
  const ipPattern = /https?:\/\/\d+\.\d+\.\d+\.\d+/;
  if (ipPattern.test(url)) {
    score += 30;
    reasons.push("Uses IP address instead of domain");
  }

  // 5️⃣ Suspicious Keywords
  const keywords = ["login", "verify", "secure", "update", "account", "bank"];
  keywords.forEach(word => {
    if (url.toLowerCase().includes(word)) {
      score += 20;
      reasons.push(`Contains suspicious keyword "${word}"`);
    }
  });

  // 6️⃣ Contains @
  if (url.includes("@")) {
    score += 15;
    reasons.push("Contains '@' symbol");
  }

  // Risk Level
  let riskLevel = "Safe";
  if (score > 60) {
    riskLevel = "Dangerous";
  } else if (score > 30) {
    riskLevel = "Suspicious";
  }

  return {
    riskScore: score,
    riskLevel,
    reasons
  };
}

module.exports = analyzeUrl;
