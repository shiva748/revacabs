const mongoose = require("mongoose");
const car = new mongoose.Schema({
  cabid: {
    type: String,
    required: true,
  },
  carNumber: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  group_id: {
    type: Number,
    required: true,
  },
  cab_id: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  carLink: {
    type: String,
    required: true,
  },
  regyear: {
    type: Number,
    required: true,
  },
  rcLink: {
    type: String,
    required: true,
  },
  policyNo: {
    type: String,
    required: true,
  },
  verification: {
    request: { type: Boolean, required: true },
    status: { type: String },
    isverified: {
      type: Boolean,
      required: true,
    },
  },
  status: {
    type: String,
    enum: ["Active", "Suspended", "Inactive", "Dispute", "OnDuty"],
  },
  policyValidity: {
    type: Number,
    required: true,
  },
  policyLink: {
    type: String,
    required: true,
  },
  permitType: {
    type: String,
    required: true,
  },
  permitValidity: {
    type: Number,
    required: true,
  },
  operatedby: {
    type: String,
    required: true,
  },
  permitLink: {
    type: String,
    required: true,
  },
  faultin: {
    car: { type: Boolean },
    rc: { type: Boolean },
    policy: { type: Boolean },
    permit: { type: Boolean },
  },
  history: [
    {
      bookingid: { type: String },
      pickupdate: { type: Number },
      from: { type: String },
      to: { type: String },
      amount: { type: Number },
    },
  ],
});
const Car = new mongoose.model("car", car);
module.exports = Car;
