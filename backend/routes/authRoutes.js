const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// ----- Customer signup (role forced) -----
router.post("/customer/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password, role: "customer" });
    await user.save();
    res.status(201).json({ message: "Customer registered successfully" });
  } catch (err) {
    res.status(400).json({ message: "Signup failed" });
  }
});

// ----- Seller signup (role forced) -----
router.post("/seller/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password, role: "seller" });
    await user.save();
    res.status(201).json({ message: "Seller registered successfully" });
  } catch (err) {
    res.status(400).json({ message: "Signup failed" });
  }
});

// ----- Login (same for both; we’ll check role on the client to redirect) -----
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
