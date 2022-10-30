const mongoose = require("mongoose");
const stats = new mongoose.Schema({
  partner: {
    count: { type: Number },
    verified: { type: Number },
  },
  car: {
    count: { type: Number },
    verified: { type: Number },
  },
  driver: {
    count: { type: Number },
    verified: { type: Number },
  },
  coustumer: {
    count: { type: Number },
  },
  booking: {
    count: { type: Number },
    completed: { type: Number },
    cancelled: { type: Number },
    inquiry: { type: Number },
    pending:{type:Number}
  },
  city: {
    count: { type: Number },
  },
  locality: {
    count: { type: Number },
  },
  package: {
    count: { type: Number },
  },
  models: {
    count: { type: Number },
  },
  tour: {
    count: { type: Number },
  },
  penalty: {
    count: { type: Number },
  },
});
const Stats = new mongoose.model("stat", stats);
module.exports = Stats;
