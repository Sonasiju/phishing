const express = require("express");
const cors = require("cors");
const analyzeRoutes = require("./routes/analyzeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", analyzeRoutes);

const PORT = 5000;
const path = require("path");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
