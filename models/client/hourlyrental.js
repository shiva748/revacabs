const mongoose = require("mongoose");
const hourly = new mongoose.Schema({
  from: { type: String, required: true },
  fromcode: { type: String, required: true },
  list: { type: Boolean, required: true },
  longlat: { type: String, required: true },
  count: { type: Number, required: true },
  results: [
    {
      _id: { type: String, required: true },
      ind: { type: String, required: true },
      zero: { type: Boolean, required: true },
      distance: { type: Number, required: true },
      hour: { type: Number, required: true },
      isavilable: { type: Boolean, required: true },
      category: { type: String, required: true },
      name: { type: String, required: true },
      group_id: { type: Number, required: true },
      cab_id: { type: Number, required: true },
      upvalid: { type: Array },
      category: { type: String, required: true },
      rdr: { type: Number, required: true },
      minchrg: { type: Number, required: true },
      basefare: { type: Number, required: true },
      equivalent: {
        isequi: { type: Boolean, required: true },
        txt: { type: String },
      },
      regularamount: { type: Number, required: true },
      offerprice: { type: Number, required: true },
      othercharges: {
        Tolltaxes: {
          isinclude: { type: Boolean, required: true },
          amount: { type: String },
        },
        Night: {
          amount: { type: Number },
        },
        GST: {
          isinclude: { type: Boolean, required: true },
          amount: { type: Number, required: true },
        },
        Extrakm: {
          amount: { type: Number },
        },
        Extrahour: {
          amount: { type: Number },
        },
        Driveraid: {
          isinclude: { type: Boolean, required: true },
          amount: { type: Number, required: true },
        },
      },
      totalpayable: { type: Number, required: true },
      oprtramt: { type: Number, required: true },
    },
  ],
});

const Hourly = new mongoose.model("hourly", hourly);
module.exports = Hourly;
