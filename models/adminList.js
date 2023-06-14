import mongoose from "mongoose";
// Defining Schema
const admins = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
});

// Model
const adminsList = mongoose.model("Adminlists", admins);
//returning value
export default adminsList;
