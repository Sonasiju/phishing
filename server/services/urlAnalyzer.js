const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

async function fetchWithAxios(url) {
  const response = await axios.get(url, {
    timeout: 6000,
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });
  return response.data;
}

async function fetchWithPuppeteer(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });

  const content = await page.content();
  await browser.close();
  return content;
}

async function analyzeUrl(url) {
  let score = 0;
  let reasons = [];
  let contentFetched = true;

  // ===============================
  // 1️⃣ URL FEATURE EXTRACTION
  // ===============================

  if (!url.startsWith("https://")) {
    score += 10;
    reasons.push("URL does not use HTTPS");
  }

  if (url.length > 75) {
    score += 10;
    reasons.push("URL is unusually long");
  }

  const ipPattern = /https?:\/\/\d+\.\d+\.\d+\.\d+/;
  if (ipPattern.test(url)) {
    score += 25;
    reasons.push("Uses IP address instead of domain");
  }

  const suspiciousKeywords = ["login", "verify", "secure", "update", "account", "bank"];
  suspiciousKeywords.forEach(word => {
    if (url.toLowerCase().includes(word)) {
      score += 10;
      reasons.push(`URL contains suspicious keyword "${word}"`);
    }
  });

  // ===============================
  // 2️⃣ CONTENT FETCH (Axios → Puppeteer Fallback)
  // ===============================

  let html;

  try {
    html = await fetchWithAxios(url);
  } catch (err) {
    try {
      html = await fetchWithPuppeteer(url);
      reasons.push("Used advanced rendering for dynamic content");
    } catch (err2) {
      contentFetched = false;
      reasons.push("Content analysis unavailable (protected or unreachable)");
    }
  }

  // ===============================
  // 3️⃣ CONTENT FEATURE EXTRACTION
  // ===============================

  if (contentFetched && html) {
    const $ = cheerio.load(html);

    const title = $("title").text().toLowerCase();
    if (title.includes("login") || title.includes("verify")) {
      score += 15;
      reasons.push("Page title contains login/verification wording");
    }

    const formCount = $("form").length;
    const passwordFields = $("input[type='password']").length;

    if (passwordFields > 0) {
      score += 20;
      reasons.push("Page contains password input field");
    } else if (formCount > 0) {
      score += 5;
      reasons.push("Page contains basic form elements");
    }

    const bodyText = $("body").text().toLowerCase();
    const urgencyWords = [
      "urgent",
      "verify immediately",
      "account suspended",
      "act now",
      "limited time"
    ];

    urgencyWords.forEach(word => {
      if (bodyText.includes(word)) {
        score += 10;
        reasons.push(`Page contains urgency phrase "${word}"`);
      }
    });
  }

  // ===============================
  // 4️⃣ FINAL CLASSIFICATION
  // ===============================

  let riskLevel;
  let confidence;

  if (!contentFetched && score < 20) {
    riskLevel = "Analysis Incomplete";
    confidence = "Low";
  } else if (score >= 70) {
    riskLevel = "High Risk";
    confidence = contentFetched ? "High" : "Medium";
  } else if (score >= 40) {
    riskLevel = "Medium Risk";
    confidence = contentFetched ? "High" : "Medium";
  } else {
    riskLevel = "Low Risk";
    confidence = contentFetched ? "High" : "Medium";
  }

  return {
    riskScore: score,
    riskLevel,
    confidence,
    reasons
  };
}

module.exports = analyzeUrl;
