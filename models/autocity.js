const mongoose = require("mongoose");
const city_schema = new mongoose.Schema({
  cityname: { type: String, unique: true, required: true },
  citycode: { type: String, unique: true, required: true },
  longlat: { type: String },
  localitycount: { type: Number, required: true },
  locality: [
    {
      name: { type: String },
      longlat: { type: String },
      code: { type: String },
      ind: { type: String },
    },
  ],
});
const City = new mongoose.model("place", city_schema);
module.exports = City;
