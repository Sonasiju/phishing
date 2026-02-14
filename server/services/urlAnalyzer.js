require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function analyzeUrl(url) {

  let score = 0;
  let lexicalScore = 0;
  let contentScore = 0;
  let aiScore = 0;

  let reasons = [];
  let aiAnalysis = null;
  let domainAgeDays = null;
  let confidence = "Medium";

  let parsedUrl;

  // -------------------------
  // URL VALIDATION
  // -------------------------

  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      riskScore: 100,
      riskLevel: "High Risk",
      confidence: "High",
      reasons: ["Invalid URL format"],
      aiAnalysis: null,
      domainAgeDays: null,
      breakdown: { lexical: 0, content: 0, ai: 0 }
    };
  }

  const hostname = parsedUrl.hostname;
  const fullUrl = url.toLowerCase();

  const parts = hostname.split(".");
  const domainName =
    parts.length > 2 ? parts[parts.length - 2] : parts[0];

  // -------------------------
  // RDAP DOMAIN AGE CHECK
  // -------------------------

  try {
    const rdapResponse = await axios.get(
      `https://rdap.org/domain/${hostname}`,
      {
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      }
    );

    const events = rdapResponse.data?.events;

    if (events) {
      const registrationEvent = events.find(
        e => e.eventAction === "registration"
      );

      if (registrationEvent) {
        const creationDate = new Date(registrationEvent.eventDate);
        const now = new Date();

        if (!isNaN(creationDate)) {
          domainAgeDays = Math.floor(
            (now - creationDate) / (1000 * 60 * 60 * 24)
          );

          if (domainAgeDays < 30) {
            score += 20;
            reasons.push(`Domain is very new (${domainAgeDays} days old)`);
          } else if (domainAgeDays < 180) {
            score += 10;
            reasons.push(`Domain is relatively new (${domainAgeDays} days old)`);
          }
        }
      }
    }
  } catch (err) {
    console.log("RDAP lookup failed:", err.message);
  }

  // -------------------------
  // LEXICAL FEATURES
  // -------------------------

  if (!url.startsWith("https://")) {
    score += 8;
    lexicalScore += 8;
    reasons.push("URL does not use HTTPS");
  }

  if (url.length > 75) {
    score += 8;
    lexicalScore += 8;
    reasons.push("URL is unusually long");
  }

  const ipPattern = /https?:\/\/\d+\.\d+\.\d+\.\d+/;
  if (ipPattern.test(url)) {
    score += 20;
    lexicalScore += 20;
    reasons.push("Uses IP address instead of domain");
  }

  const suspiciousKeywords = [
    "login", "verify", "secure",
    "update", "account", "bank"
  ];

  suspiciousKeywords.forEach(word => {
    if (fullUrl.includes(word)) {
      score += 6;
      lexicalScore += 6;
      reasons.push(`URL contains suspicious keyword "${word}"`);
    }
  });

  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    score += 8;
    lexicalScore += 8;
    reasons.push("Domain contains multiple hyphens");
  }

  if (domainName.length <= 3) {
    score += 6;
    lexicalScore += 6;
    reasons.push("Domain name is unusually short");
  }

  // -------------------------
  // CONTENT FEATURES
  // -------------------------

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = response.data;

    if (html && html.length > 300) {

      const $ = cheerio.load(html);
      const bodyText = $("body").text().toLowerCase();

      const urgencyWords = [
        "urgent",
        "verify immediately",
        "account suspended",
        "act now"
      ];

      urgencyWords.forEach(word => {
        if (bodyText.includes(word)) {
          score += 8;
          contentScore += 8;
          reasons.push(`Page contains suspicious phrase "${word}"`);
        }
      });

      const forms = $("form");

      forms.each((i, form) => {
        const action = $(form).attr("action") || "";
        const method = ($(form).attr("method") || "").toLowerCase();

        const passwordFields =
          $(form).find("input[type='password']").length;

        const emailFields =
          $(form).find("input[type='email']").length;

        if (passwordFields > 0) {
          score += 15;
          contentScore += 15;
          reasons.push("Form contains password field");

          if (emailFields > 0) {
            score += 10;
            contentScore += 10;
            reasons.push("Form collects email and password");
          }

          if (method === "post") {
            score += 6;
            contentScore += 6;
            reasons.push("Sensitive form uses POST method");
          }
        }

        if (action && !action.includes(hostname)) {
          score += 15;
          contentScore += 15;
          reasons.push("Form submits data to external domain");
        }
      });

      // -------------------------
      // GROQ AI ANALYSIS
      // -------------------------

      try {
        const structuredContent = bodyText.substring(0, 1200);

       const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",

          messages: [
            {
              role: "user",
              content: `
Analyze the following webpage content and determine if it is phishing.

Respond ONLY with JSON:
{
 "isPhishing": true or false,
 "confidence": number,
 "reasoning": "short explanation"
}

Content:
${structuredContent}
`
            }
          ],
          temperature: 0.3
        });

        const text = completion.choices[0].message.content;
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          aiAnalysis = JSON.parse(jsonMatch[0]);

          if (aiAnalysis.isPhishing === true) {
            score += 25;
            aiScore += 25;
            reasons.push("AI detected phishing pattern");
          }
        }

      } catch (err) {
        console.log("Groq AI error:", err.message);
      }

    }

  } catch (err) {
    console.log("Content fetch failed:", err.message);
  }

  // -------------------------
  // FINAL CLASSIFICATION
  // -------------------------

  let riskLevel;

  if (score >= 80) {
    riskLevel = "High Risk";
    confidence = "High";
  } else if (score >= 40) {
    riskLevel = "Medium Risk";
    confidence = "Medium";
  } else {
    riskLevel = "Low Risk";
    confidence = "Low";
  }

  return {
    riskScore: score,
    riskLevel,
    confidence,
    reasons,
    aiAnalysis,
    domainAgeDays,
    breakdown: {
      lexical: lexicalScore,
      content: contentScore,
      ai: aiScore
    }
  };
}

module.exports = analyzeUrl;
