const mongoose = require("mongoose");
const cabmodel = new mongoose.Schema({
  name: { type: String, required: true },
  cab_id: { type: Number, required: true },
  group_id: { type: Number, required: true },
  upvalid: { type: Array },
  rdr: { type: Number, required: true },
  category: { type: String, required: true },
  charge: {
    oneway: {
      type: Number,
      required: true,
    },
    roundtrip: {
      type: Number,
      required: true,
    },
    night: {
      type: Number,
      required: true,
    },
    extrahour: {
      type: Number,
      required: true,
    },
    driveraid: {
      type: Number,
      required: true,
    },
  },
});
const Cabmodel = new mongoose.model("cabmodel", cabmodel);
module.exports = Cabmodel;
