const mongoose = require("mongoose");
const booking = new mongoose.Schema({
  bookingid: { type: String, required: true, unique: true },
  // coustumerid: { type: String, required: true },
  orderid: { type: String, required: true, unique: true },
  bookingtype: { type: String, required: true },
  outstation: { type: String },
  sourcecity: {
    from: { type: String, required: true },
    fromcode: { type: String, required: true },
    pickupadress: { type: String },
    geocode: { type: String },
    code: { type: String },
  },
  endcity: { to: { type: String }, tocode: { type: String } },
  pickupat: { type: Number, required: true },
  returnat: { type: Number },
  pickupdate: { type: Number, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  bookingstatus: { type: String, required: true },
  close: {
    rsn: {
      type: String,
      enum: [
        "Advance problem",
        "High price",
        "Cab model",
        "State tax & tolls",
        "Night charges",
        "Fake Inquiry",
        "Other",
      ],
    },
    rsndes: { type: String },
    by: { type: String },
  },
  status: { type: String, required: true },
  tripinfo: { type: Object, required: true },
  bids: [
    {
      amount: { type: Number },
      operatorid: { type: String },
      phone: { type: Number },
      aPhone: { type: Number },
      cancel: { type: Boolean },
      name: { type: String },
      email: { type: String },
    },
  ],
  assignedto: {
    assigned: { type: Boolean },
    amount: { type: Number },
    operatorid: { type: String },
    phone: { type: Number },
    aPhone: { type: Number },
    name: { type: String },
    email: { type: String },
  },
  driverinfo: {
    assigned: { type: Boolean },
    driverid: { type: String },
    name: { type: String },
    phone: { type: String },
    aPhone: { type: String },
  },
  cabinfo: {
    assigned: { type: Boolean },
    cabid: { type: String },
    name: { type: String },
    carNumber: { type: String },
    category: { type: String },
  },
  tripreason: { type: String, required: true },
  gst: {
    number: { type: String },
    name: { type: String },
    address: { type: String },
  },
  billing: {
    tripstats: {
      startkm: { type: Number },
      endkm: { type: Number },
      startat: { type: Number },
      endat: { type: Number },
    },
    extrakm: {
      company: { type: Number },
      partner: { type: Number },
    },
    extrahour: {
      company: { type: Number },
      partner: { type: Number },
    },
    billamount: { type: Number },
    oprtramt: { type: Number },
    cash: { type: Number },
    companybal: {
      amount: { type: Number },
      rzp_orderid: { type: String },
      status: { type: Boolean },
      date: { type: Number },
    },
    partnerbal: {
      amount: { type: Number },
      date: { type: Number },
      processedto: { type: String },
      status: { type: Boolean },
    },
    cancel: {
      cancelon: { type: Number },
      cancelrsn: { type: String },
      cancelfee: { type: Number },
      refund: { type: Number },
      refunded: { type: Boolean },
      refundedon: { type: Number },
    },
    billed: { type: Boolean },
  },
  payable: { type: Number, required: true },
  oprtramt: { type: Number, required: true },
  advance: { type: Number, required: true },
  remaning: { type: Number, required: true },
  bookingdate: { type: Number, required: true },
  verificationkey: { type: String },
  advanceoptn: [
    {
      Atype: { type: String },
      Amount: { type: Number },
      Remaning: { type: Number },
    },
  ],
  otp: {
    start: {
      code: { type: Number },
      validity: { type: Number },
    },
    end: {
      code: { type: Number },
      validity: { type: Number },
    },
  },
  reschedule: {
    isreschedule: {type:Boolean},
    count: {type:Number},
    before:[
      {
        pickupat: Number,
        pickupdate: Number,
        attime: Number,
      }
    ]}
});

const Booking = new mongoose.model("Booking", booking);
module.exports = Booking;
