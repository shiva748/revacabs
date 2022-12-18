const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const partner = new mongoose.Schema({
  operatorid: {
    type: String,
  },
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
  },
  aPhone: {
    type: String,
  },
  email: {
    type: String,
    required: true,
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
  approved: {
    type: Boolean,
    required: true,
  },
  verification: {
    request: { type: Boolean, required: true },
    status: { type: String },
    isverified: {
      type: Boolean,
      required: true,
    },
  },
  Profile: {
    type: String,
  },
  Date: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Number,
  },
  city: {
    type: String,
  },
  Doc: {
    Aadhaar: {
      Verify: {
        type: Boolean,
      },
      Number: {
        type: String,
      },
      Link: {
        type: String,
      },
    },
    Drivinglicense: {
      Verify: {
        type: Boolean,
      },
      Number: {
        type: String,
      },
      Link: {
        type: String,
      },
      Validity: {
        type: Number,
      },
    },
  },
  Bankaccount: {
    Name: { type: String },
    Ifsc: { type: Number },
    AccNumber: { type: Number },
    BankName: { type: String },
    Link: { type: String },
  },
  faultin: {
    basc: { type: Boolean },
    prfl: { type: Boolean },
    aadh: { type: Boolean },
    dl: { type: Boolean },
  },
  phonever:{type: Boolean},
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
  Securityfee: {
    amount: { type: Number },
    received: { type: Boolean, required: true },
    refunded: { type: Boolean },
    refundedon: { type: Number },
  },
});
partner.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashpass = await bcrypt.hash(this.password, 12);
    this.password = hashpass;
    this.cPassword = hashpass;
  }
  next();
});

partner.pre("updateOne", async function (next) {
  let data = this.getUpdate();
  if (data.password) {
    const hashpass = await bcrypt.hash(data.password, 12);
    data.password = hashpass;
    data.cPassword = hashpass;
  }
  next();
});

// token
partner.methods.genrateAuthToken = async function () {
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
const Partner = new mongoose.model("partner", partner);
module.exports = Partner;
