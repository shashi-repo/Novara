const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/database");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.url);
    next();
});

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Novara AI Backend is running 🚀"
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT 1 AS database_connected");

    res.json({
      success: true,
      message: "Backend and MySQL are connected",
      database: result[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});