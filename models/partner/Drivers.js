const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const driver = new mongoose.Schema({
  driverid: {
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
  },
  cPassword: {
    type: String,
  },
  verification: {
    request: { type: Boolean, required: true },
    status: { type: String },
    isverified: {
      type: Boolean,
      required: true,
    },
  },
  status: {
    type: String,
    enum: ["Active", "Suspended", "Inactive", "Dispute", "OnDuty"],
  },
  approved: {
    type: Boolean,
  },
  Profile: {
    type: String,
  },
  Date: {
    type: String,
    required: true,
  },
  Credentials: {
    type: Boolean,
    required: true,
  },
  Doc: {
    Aadhaar: {
      Number: {
        type: Number,
      },
      Link: {
        type: String,
      },
    },
    Drivinglicense: {
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
  operatedby: { type: String },
  faultin: {
    basc: { type: Boolean },
    prfl: { type: Boolean },
    aadh: { type: Boolean },
    dl: { type: Boolean },
  },
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
});
driver.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashpass = await bcrypt.hash(this.password, 12);
    this.password = hashpass;
    this.cPassword = hashpass;
  }
  next();
});
driver.pre("updateOne", async function (next) {
  let data = this.getUpdate();
  if (data.password && data.cPassword) {
    const hashpass = await bcrypt.hash(data.password, 12);
    data.password = hashpass;
    data.cPassword = hashpass;
  }
  next();
});

// token
driver.methods.genrateAuthToken = async function () {
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
const Driver = new mongoose.model("driver", driver);
module.exports = Driver;
