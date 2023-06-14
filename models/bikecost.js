import mongoose from "mongoose";
// Defining Schema
const costing = new mongoose.Schema({
  location: { type: String, required: true, trim: true },
  //   reason: { type: String, required: true, trim: true },
  rate: { type: Number, required: true, trim: true },
  minutes: { type: Number, required: true, trim: true },
});

// Model
const ridecost = mongoose.model("bikecosting", costing);
//returning value
export default ridecost;
