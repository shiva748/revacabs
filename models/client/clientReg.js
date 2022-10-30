const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const client = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  aPhone: {
    type: String,
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
  termCondition: {
    type: String,
    required: true,
  },
  isverified: {
    type: String,
    required: true,
  },
  verification: {
    email: {
      type: Boolean,
      required: true,
    },
    phone: { type: Boolean, required: true },
  },
  Date: {
    type: Date,
    default: Date.now(),
  },
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
  Records: {
    date: {
      type: String,
    },
    failed: {
      type: Number,
    },
    block: {
      type: Boolean,
    },
  },
});
client.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashpass = await bcrypt.hash(this.password, 12);
    this.password = hashpass;
    this.cPassword = hashpass;
  }
  next();
});

client.pre("updateOne", async function (next) {
  let data = this.getUpdate();
  if (data.password) {
    const hashpass = await bcrypt.hash(data.password, 12);
    data.password = hashpass;
    data.cPassword = hashpass;
  }
  next();
});

// token
client.methods.genrateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY, {
      expiresIn: "432000 seconds",
    });
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};
const Client = new mongoose.model("client", client);
module.exports = Client;
