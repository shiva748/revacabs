const mongoose = require("mongoose");
const order_schema = new mongoose.Schema({
  rzp_orderid: { type: String, required: true },
  bookingid: { type: String },
  orderid: { type: String },
  status: { type: String, required: true },
  amount: { type: Number, required: true },
  operatorid: { type: String },
  penaltyid: { type: String },
  reason: { type: String },
});
const Order = new mongoose.model("order", order_schema);
module.exports = Order;
