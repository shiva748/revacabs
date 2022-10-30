const mongoose = require("mongoose");
const contact_req = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, required: true, default: "pending" },
});
const Contact = new mongoose.model("contact", contact_req);
module.exports = Contact;
