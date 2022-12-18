const mongoose = require("mongoose");
const otp_req = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  code: { type: String },
  expiry: { type: Number, required: true },
  type: { type: String, required: true },
  createdon: { type: Number, required: true },
  for: { type: String, required: true },
  resend: {
    on: { type: Number },
    count: { type: Number },
  },
  senton: { type: String, required: true },
  attempt:{type:Number}
});
const OTP = new mongoose.model("otp", otp_req);
module.exports = OTP;
