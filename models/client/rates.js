const mongoose = require("mongoose");
const rate = new mongoose.Schema({
  from: { type: String, required: true },
  fromcode: { type: String, required: true },
  fromlonglat: { type: String, required: true },
  to: { type: String, required: true },
  tocode: { type: String, required: true },
  tolonglat: { type: String, required: true },
  list: { type: Boolean, required: true },
  onecount: { type: Number, required: true },
  roundcount: { type: Number, required: true },
  results: [
    {
      _id: { type: String, required: true },
      ind: { type: Number, required: true },
      zero: { type: Boolean, required: true },
      distance: { type: Number, required: true },
      hours: { type: Number, required: true },
      isavilable: { type: Boolean, required: true },
      category: { type: String, required: true },
      name: { type: String, required: true },
      group_id: { type: Number, required: true },
      upvalid: { type: Array },
      cab_id: { type: Number, required: true },
      category: { type: String, required: true },
      rdr: { type: Number, required: true },
      minchrg: { type: Number, required: true },
      equivalent: {
        isequi: { type: Boolean, required: true },
        txt: { type: String },
      },
      regularamount: { type: Number, required: true },
      basefare: { type: Number, required: true },
      othercharges: {
        Tolltaxes: {
          isinclude: { type: Boolean },
          amount: { type: String },
        },
        Night: {
          amount: { type: Number, required: true },
        },
        GST: {
          isinclude: { type: Boolean, required: true },
        },
        Extrakm: {
          amount: { type: Number },
        },
        Extrahour: {
          amount: { type: Number },
        },
        Driveraid: {
          isinclude: { type: Boolean, required: true },
        },
      },
      totalpayable: { type: Number, required: true },
      oprtramt: { type: Number, required: true },
    },
  ],
  roundresults: [
    {
      _id: { type: String, required: true },
      ind: { type: Number, required: true },
      zero: { type: Boolean, required: true },
      isavilable: { type: Boolean, required: true },
      category: { type: String, required: true },
      name: { type: String, required: true },
      group_id: { type: Number, required: true },
      cab_id: { type: Number, required: true },
      upvalid: { type: Array },
      category: { type: String, required: true },
      rdr: { type: Number, required: true },
      basefare: { type: Number, required: true },
      equivalent: {
        isequi: { type: Boolean, required: true },
        txt: { type: String },
      },
      gropu_id: { type: String },
      car_id: { type: String },
      othercharges: {
        Tolltaxes: {
          isinclude: { type: Boolean },
          amount: { type: String },
        },
        Night: {
          amount: { type: Number, required: true },
        },
        GST: {
          isinclude: { type: Boolean, required: true },
        },
        Extrakm: {
          amount: { type: Number },
        },
        Extrahour: {
          amount: { type: Number },
        },
        Driveraid: {
          isinclude: { type: Boolean, required: true },
        },
      },
      dayrates: [
        {
          day: { type: Number, required: true },
          distance: { type: Number, required: true },
          regularamount: { type: Number, required: true },
          totalpayable: { type: Number, required: true },
          oprtramt: { type: Number, required: true },
          minchrg: { type: Number, required: true },
        },
      ],
      expand: {
        distance: { type: Number, required: true },
        regularamount: { type: Number, required: true },
        totalpayable: { type: Number, required: true },
        oprtramt: { type: Number, required: true },
        minchrg: { type: Number, required: true },
      },
    },
  ],
});
const Rate = new mongoose.model("rate", rate);
module.exports = Rate;
