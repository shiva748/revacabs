const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admn = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["employe", "manager", "admin", "super-admin"],
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cPassword: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  approved: {
    type: Boolean,
    required: true,
  },
  Locked: {
    islocked: { type: Boolean },
    reason: { type: String },
  },
  activepin: {
    code: {
      type: String,
    },
    validtill: { type: Date },
  },
  isactive: { type: Boolean },
  Records: {
    Date: {
      type: Date,
    },
    failed: {
      type: Number,
    },
    Logintime: {
      type: Date,
    },
    Logouttime: {
      type: Date,
    },
  },
  tokens: [
    {
      token: {
        type: String,
      },
      active: { type: Boolean },
    },
  ],
});
admn.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashpass = await bcrypt.hash(this.password, 12);
    this.password = hashpass;
    this.cPassword = hashpass;
  }
  next();
});

admn.pre("updateOne", async function (next) {
  let data = this.getUpdate();
  if (data.password) {
    const hashpass = await bcrypt.hash(data.$set.password, 15);
    data.password = hashpass;
    data.cPassword = hashpass;
  }
  next();
});

// token
admn.methods.genrateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY, {
      expiresIn: "36000 seconds",
    });
    this.tokens = this.tokens.concat({ token: token, active: false });
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};
const Admns = new mongoose.model("webAdmins", admn);
module.exports = Admns;
