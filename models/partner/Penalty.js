const mongoose = require("mongoose");
const penalty = new mongoose.Schema({
  penaltyid: { type: String, required: true, unique: true },
  bookingid: { type: String, required: true },
  reason: { type: String, required: true },
  amount: { type: Number, required: true },
  received: { type: Boolean, required: true },
  receivedon: { type: Number },
  operatorid: { type: String, required: true },
  close: { type: Boolean, required: true },
  closereason: { type: String },
  createdon: { type: Number, required: true },
  phone: { type: String, required: true },
});

const Penalty = new mongoose.model("penalty", penalty);
module.exports = Penalty;
