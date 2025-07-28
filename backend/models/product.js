const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    image: { type: String, default: "" },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // <—
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
