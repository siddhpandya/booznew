import mongoose from "mongoose";
// Defining Schema
const bikeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  bikeId: { type: String, required: true, trim: true },
  userId: { type: String, required: true, trim: true },
  start_time: { type: String, required: true, trim: true },
  date: { type: Date, required: true, trim: true },
  numberOfBike: { type: String, required: true, trim: true },
  end_time: { type: Date, required: true, trim: true },
  cost: { type: Number, required: true, trim: true },
});

// Model
const bikeModel = mongoose.model("bike", bikeSchema);
//returning value
export default bikeModel;
