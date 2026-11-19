require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const submissionsRouter = require("./routes/submissions");

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/submissions", submissionsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File is too large. Maximum size is 5 MB." });
  }
  if (err.message && err.message.startsWith("Unsupported file type")) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Something went wrong on the server." });
});

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to MySQL database.");
  } catch (error) {
    console.warn("Database connection is not ready:", error.message);
    console.warn("The API will start, but database operations will fail until DB settings are configured.");
  }

  app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
}

start();
