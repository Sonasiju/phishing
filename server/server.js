require("dotenv").config();

const express = require("express");
const path = require("path");
const analyzeRoutes = require("./routes/analyzeRoutes");

const app = express();
const PORT = 5000;

// In-memory telemetry
global.threatHistory = [];

app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", analyzeRoutes);

app.get("/api/history", (req, res) => {
  res.json(global.threatHistory);
});
console.log("WHOIS KEY:", process.env.WHOIS_API_KEY);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
