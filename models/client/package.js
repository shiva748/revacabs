const mongoose = require("mongoose");
const package = new mongoose.Schema({
  id: { type: String, required: true },
  meta: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords:{type:String, required:true},
  },
  name: { type: String, required: true },
  url: { type: String, required: true },
  citys: [
    {
      cityname: { type: String, required: true },
      citycode: { type: String, required: true },
    },
  ],
  days: { type: Number, required: true },
  nights: { type: Number, required: true },
  plan: [
    {
      day: { type: Number },
      title: { type: String },
      description: { type: String, required: true },
    },
  ],
  bnrimg: { type: String, required: true },
});
const Package = new mongoose.model("package", package);
module.exports = Package;
