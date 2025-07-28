require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Routes
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());

// Static: uploads (product images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Static: serve the frontend
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND_DIR));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// API 404
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Root -> home.html
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "home.html"));
});

// SPA-style fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "home.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err.message && err.message.toLowerCase().includes("only")) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal server error" });
});

// Start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
