const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
const { authMiddleware, requireRole } = require("../middleware/auth");

// Multer…
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// PUBLIC — list all
router.get("/", async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// SELLER — list **my** products
router.get("/mine", authMiddleware, requireRole("seller"), async (req, res) => {
  const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
  res.json(products);
});

// SELLER — create
router.post("/", authMiddleware, requireRole("seller"), upload.single("image"), async (req, res) => {
  const { name, price, description } = req.body;
  const product = await Product.create({
    name,
    price,
    description,
    image: req.file ? `/uploads/${req.file.filename}` : "",
    seller: req.user.id, // <-- ownership!
  });
  res.status(201).json(product);
});

// SELLER — update **only own**
router.put("/:id", authMiddleware, requireRole("seller"), upload.single("image"), async (req, res) => {
  const { name, price, description } = req.body;
  const update = { name, price, description };
  if (req.file) update.image = `/uploads/${req.file.filename}`;

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, seller: req.user.id }, // ensure ownership
    update,
    { new: true }
  );
  if (!product) return res.status(404).json({ message: "Not found or not yours" });
  res.json(product);
});

// SELLER — delete **only own**
router.delete("/:id", authMiddleware, requireRole("seller"), async (req, res) => {
  const deleted = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user.id });
  if (!deleted) return res.status(404).json({ message: "Not found or not yours" });
  res.json({ message: "Deleted" });
});

module.exports = router;
