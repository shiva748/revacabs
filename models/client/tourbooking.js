const mongoose = require("mongoose");
const tourbooking = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  startdate: { type: Number, required: true },
  person: { type: Number, required: true },
  tour: { type: String, required: true },
  createdon: { type: Number, required: true },
  status: { type: String, required: true },
  messgae: { type: String },
  url: { type: String },
});
const Tourbooking = new mongoose.model("tourbooking", tourbooking);
module.exports = Tourbooking;
