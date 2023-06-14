import mongoose from "mongoose";
// Defining Schema
const bikeCount = new mongoose.Schema({
  bikeId: { type: String, required: true, trim: true },
  count: { type: Number, required: true, trim: true },
});

// Model
const bikecountModel = mongoose.model("bikecount", bikeCount);
//returning value
export default bikecountModel;
