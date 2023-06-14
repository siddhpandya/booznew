import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
  bikeId: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  method: { type: String, required: true, trim: true },
});

// Model
const paymentModel = mongoose.model("payments", paymentSchema);
//returning value
export default paymentModel;
