import mongoose from "mongoose";
// Defining Schema
const discount = new mongoose.Schema({
  location: { type: String, required: true, trim: true },
  //   reason: { type: String, required: true, trim: true },
  reason: { type: String, required: true, trim: true },
  prize: { type: Number, required: true, trim: true },
});

// Model
const discountPrize = mongoose.model("discounts", discount);
//returning value
export default discountPrize;
