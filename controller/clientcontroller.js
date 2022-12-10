const Client = require("../models/client/clientReg");
const validator = require("validator");
const Stats = require("../models/stats");
// ==== ==== ==== registration controller ==== ==== ====//

exports.register_client = async (req, res) => {
  const { firstName, lastName, phone, email, password, cPassword } = req.body;
  if (!firstName || !lastName || !phone || !email || !password || !cPassword) {
    return res.status(422).json({ error: "please fill all the fields" });
  }
  if (
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof phone !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof cPassword !== "string"
  ) {
    return res.status(422).json("invalid data type");
  }
  if (password !== cPassword) {
    return res
      .status(422)
      .json({ error: "password and confirm password do not match" });
  }
  const isStrongPassword = validator.isStrongPassword(password);
  if (!isStrongPassword) {
    return res.status(422).json({ error: "please enter a strong password" });
  }
  const isemail = validator.isEmail(email);
  if (!isemail) {
    return res
      .status(422)
      .json({ error: "please enter a valid email address" });
  }
  const isMobilePhone = validator.isMobilePhone(phone, "en-IN");
  if (!isMobilePhone) {
    return res
      .status(422)
      .json({ error: "please enter a valid 10 digit indian phone no" });
  }
  try {
    let regex = new RegExp(["^", email, "$"].join(""), "i");
    const epexists = await Client.findOne(
      {
        $or: [{ email: regex }, { phone: phone }, { aPhone: phone }],
      },
      { email: 1, phone: 1, aPhone: 1 }
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (epexists === "block") {
      return;
    }
    if (epexists) {
      if (epexists.email === email) {
        return res.status(403).json({ error: "email already exists" });
      } else if (epexists.phone === phone || epexists.aPhone === phone) {
        return res.status(403).json({ error: "phone already exists" });
      }
    }
    const stats = await Stats.findOne({}, { coustumer: 1, _id: 0 })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (stats === "block") {
      return;
    }
    const id = "Cstm-".concat(100001 + stats.coustumer.count);
    const user = new Client({
      id,
      firstName,
      lastName,
      phone,
      email,
      password,
      cPassword,
      termCondition: "accepted",
      isverified: "unauthorised",
      verification: {
        email: false,
        phone: false,
      },
    });
    let pr;
    const result = await user
      .save()
      .then((res) => {
        pr = true;
      })
      .catch((error) => {
        pr = false;
      });
    if (pr) {
      const updtst = await Stats.updateOne(
        {},
        { "coustumer.count": stats.coustumer.count + 1 }
      )
        .then((res) => {
          res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (updtst === "block") {
        return;
      }

      // === === === sending otp === === === //

      function generateOTP() {
        var digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
      }
      const otp = generateOTP();

      const date = new Date().getTime();
      const otpreq = new Otp({
        email,
        phone,
        code: otp,
        expiry: date + 300 * 1000,
        type: "verification",
        createdon: date,
        for: "customer",
        resend: {
          on: new Date().getTime(),
          count: 0,
        },
        senton: "phone",
      });
      const sresult = await otpreq
        .save()
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (sresult === "block") {
        return;
      }
      if (!sresult) {
        return res.status(500).JSON({
          error: "Failed to send otp please try again to login after some time",
        });
      }
      const txtdata = JSON.stringify({
        route: "dlt",
        sender_id: "MTRACB",
        message: "143480",
        variables_values: `${otp}|`,
        flash: 0,
        numbers: `${phone}`,
      });
      let customConfig = {
        headers: {
          "Content-Type": "application/json",
          authorization: process.env.FAST2SMSAUTH,
        },
      };
      const txtotp = await axios
        .post("https://www.fast2sms.com/dev/bulkV2", txtdata, customConfig)
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (txtotp === "block") {
        return;
      }
      if (txtotp.data.return) {
        return res.status(201).json({
          message: "an otp has been sent to your phone number",
          details: { email, phone },
        });
      } else {
        return res.status(500).json({
          error: "Failed to send otp please try again to login after some time",
        });
      }
    } else {
      return res.status(422).json({ error: "register unsuccessful" });
    }
  } catch (err) {
    console.log(err);
  }
};

// ==== ==== ==== login controller ==== ==== ==== //

const bcrypt = require("bcryptjs");

exports.login_client = async (req, res) => {
  const { email, password } = req.body;
  let dt = new Date().toLocaleDateString();
  if (!email || !password) {
    return res.status(400).json({ error: "please fill all the fields" });
  }
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Invalid data type" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Invalid password" });
  }
  let regex = new RegExp(["^", email, "$"].join(""), "i");
  const user = await Client.findOne(
    {
      email: regex,
    },
    {
      email: 1,
      password: 1,
      _id: 1,
      tokens: 1,
      Records: 1,
      isverified: 1,
      phone: 1,
    }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (user === "block") {
    return;
  }
  if (!user) {
    return res.status(401).json({ error: "Your email or password is wrong" });
  } else {
    if (user.Records.block && user.Records.date === dt) {
      return res
        .status(400)
        .json("Your profile is blocked please contact support");
    }
    const isMatch = await bcrypt
      .compare(password, user.password)
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (isMatch === "block") {
      return "block";
    }
    if (isMatch) {
      if (user.isverified === "blocked") {
        return res.status(400).json({
          error: "Your profile has been blocked please contact support",
        });
      } else if (user.isverified === "unauthorised") {
        // === === === sending otp === === === //
        function generateOTP() {
          var digits = "0123456789";
          let OTP = "";
          for (let i = 0; i < 6; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
          }
          return OTP;
        }
        const otp = generateOTP();

        const date = new Date().getTime();
        const otpreq = new Otp({
          email,
          phone: user.phone,
          code: otp,
          expiry: date + 300 * 1000,
          type: "verification",
          createdon: date,
          for: "customer",
          resend: {
            on: new Date().getTime(),
            count: 0,
          },
          senton: "phone",
        });
        const sresult = await otpreq
          .save()
          .then((res) => {
            return res;
          })
          .catch((error) => {
            res.status(500).json("failed to fetch data");
            return "block";
          });
        if (sresult === "block") {
          return;
        }
        if (!sresult) {
          return res.status(400).JSON({
            error:
              "Failed to send otp please try again to login after some time",
          });
        }
        const txtdata = JSON.stringify({
          route: "dlt",
          sender_id: "MTRACB",
          message: "143480",
          variables_values: `${otp}|`,
          flash: 0,
          numbers: `${phone}`,
        });
        let customConfig = {
          headers: {
            "Content-Type": "application/json",
            authorization: process.env.FAST2SMSAUTH,
          },
        };
        const txtotp = await axios
          .post("https://www.fast2sms.com/dev/bulkV2", txtdata, customConfig)
          .then((res) => {
            return res;
          })
          .catch((error) => {
            res.status(500).json({ error: "Failed to fetch data" });
            return "block";
          });
        if (txtotp === "block") {
          return;
        }
        if (txtotp.data.return) {
          return res.status(201).json({
            vrftnreq: true,
            message: "an otp has been sent to your phone number",
            details: { email, phone },
          });
        } else {
          return res.status(500).json({
            error:
              "Failed to send otp please try again to login after some time",
          });
        }
      } else {
        const token = await user
          .genrateAuthToken()
          .then((res) => {
            return res;
          })
          .catch((error) => {
            res.status(500).json("failed to fetch data");
            return "block";
          });
        if (token === "block") {
          return;
        }
        return res
          .status(200)
          .cookie("ltk", token, {
            expires: new Date(Date.now() + 432000000),
            httpOnly: true,
          })
          .json({
            vrftnreq: false,
            message: "login successful",
          });
      }
    } else {
      let updt = {};

      if (!user.Records) {
        updt = {
          ...updt,
          Records: {
            date: dt,
            failed: 1,
            block: false,
          },
        };
      } else {
        if (user.Records.date === dt) {
          updt = {
            ...updt,
            Records: {
              date: dt,
              failed: user.Records.failed + 1,
              block: user.Records.failed + 1 >= 5 ? true : false,
            },
          };
        } else {
          updt = {
            ...updt,
            Records: {
              date: dt,
              failed: 1,
              block: false,
            },
          };
        }
      }
      const update = await Client.updateOne({ email: regex }, updt)
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (update === "block") {
        return;
      }
      return res.status(401).json({
        error:
          updt.Records.failed >= 5
            ? "Your profile has been blocked"
            : `invalid login details ${5 - updt.Records.failed} attempt left`,
      });
    }
  }
};

// ==== ==== ==== forgot password ==== ==== ==== //

exports.forgot_pass = async (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone) {
    return res.status(400).json({ error: "please fill all the fields" });
  }
  if (typeof email !== "string" || typeof phone !== "string") {
    return res.status(400).json({ error: "invalid data type" });
  }
  if (!validator.isEmail(email)) {
    return res
      .status(422)
      .json({ error: "please enter a valid email address" });
  }
  if (!validator.isMobilePhone(phone, "en-IN")) {
    return res.status(422).json({ error: "please enter a valid Phone number" });
  }
  let regex = new RegExp(["^", email, "$"].join(""), "i");
  const isuser = await Client.findOne(
    {
      email: regex,
      phone,
    },
    { email: 1, phone: 1, _id: 0 }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (isuser === "block") {
    return;
  }
  if (!isuser) {
    return res.status(401).json({ error: "user not found" });
  } else {
    const delotp = await Otp.deleteMany({
      email: email,
      phone,
      for: "customer",
    })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (delotp === "block") {
      return;
    }
    function generateOTP() {
      var digits = "0123456789";
      let OTP = "";
      for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
      }
      return OTP;
    }
    const otp = generateOTP();
    const date = new Date().getTime();
    const otpreq = new Otp({
      email,
      phone,
      code: otp,
      expiry: date + 300 * 1000,
      type: "forgotpass",
      for: "customer",
      createdon: date,
      resend: {
        on: date,
        count: 0,
      },
      senton: "phone",
    });
    const sresult = await otpreq
      .save()
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (sresult === "block") {
      return;
    }
    if (!sresult) {
      return res.status(500).JSON({
        error: "Failed to send otp please try again after some time",
      });
    }
    const txtdata = JSON.stringify({
      route: "dlt",
      sender_id: "MTRACB",
      message: "143661",
      variables_values: `${otp}|`,
      flash: 0,
      numbers: `${phone}`,
    });
    let customConfig = {
      headers: {
        "Content-Type": "application/json",
        authorization: process.env.FAST2SMSAUTH,
      },
    };
    const txtotp = await axios
      .post("https://www.fast2sms.com/dev/bulkV2", txtdata, customConfig)
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (txtotp === "block") {
      return;
    }
    if (txtotp.data.return) {
      return res.status(201).json({
        message: "an otp has been sent to your phone number",
        details: { email, phone },
      });
    } else {
      return res.status(500).json({
        error: "Failed to send otp please try again after some time",
      });
    }
  }
};

// ==== ==== ==== reset password === ==== === //
const Otp = require("../models/client/otp");

exports.reset_pass = async (req, res) => {
  const { email, phone, code, password, cPassword } = req.body;
  if (!email || !phone || !code || !password || !cPassword) {
    return res.status(422).json({ error: "please fill all the fields" });
  }
  if (
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof code !== "string" ||
    typeof password !== "string" ||
    typeof cPassword !== "string"
  ) {
    return res.status(422).json({ error: "invalid data type" });
  }
  if (password !== cPassword) {
    return res
      .status(422)
      .json({ error: "password and confirm password do not match" });
  }

  if (password.length < 8) {
    return res.status(422).json({ error: "password must be of 8 character" });
  }
  if (code.length !== 6) {
    return res.status(422).json({ error: "Otp length should be 6 " });
  }
  let regex = new RegExp(["^", email, "$"].join(""), "i");
  const isotp = await Otp.findOne({
    email: regex,
    code: code,
    phone: phone,
    senton: "phone",
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (isotp === "block") {
    return;
  }
  if (isotp) {
    if (isotp.type == "forgotpass") {
      if (isotp.expiry > new Date().getTime()) {
        const delotp = await Otp.deleteMany({ email: email })
          .then((res) => {
            return res;
          })
          .catch((error) => {
            res.status(500).json("failed to fetch data");
            return "block";
          });
        if (delotp === "block") {
          return;
        }
        const update = await Client.updateOne(
          { email: regex },
          { password: password, cPassword: cPassword }
        )
          .then((res) => {
            return res;
          })
          .catch((error) => {
            res.status(500).json("failed to fetch data");
            return "block";
          });
        if (update === "block") {
          return;
        }
        if (update.modifiedCount > 0) {
          return res
            .status(200)
            .json({ message: "Password Reset Successfully" });
        } else {
          return res.status(422).json({
            error: "Can't reset the password right now please try again later ",
          });
        }
      } else {
        const delotp = await Otp.deleteMany({ email: email })
          .then((res) => {
            return res;
          })
          .catch((error) => {
            res.status(500).json("failed to fetch data");
            return "block";
          });
        if (delotp === "block") {
          return;
        }
        return res.status(400).json({ error: "Otp expired" });
      }
    } else {
      const delotp = await Otp.deleteMany({ email: email })
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (delotp === "block") {
        return;
      }
      return res.status(422).json({ error: "invalid otp" });
    }
  } else {
    return res.status(422).json({ error: "invalid otp" });
  }
};

// ==== ==== ==== autologin ==== ==== ==== //
exports.client_autolog = (req, res) => {
  const name = {
    name: req.user.firstName,
    email: req.user.email,
  };
  res.send(name);
};
// ==== ==== ==== logout ==== ===== ==== //

exports.client_logout = async (req, res) => {
  const token = req.user.tokens;
  const filtered = token.filter((itm) => {
    return itm.token !== req.token;
  });
  const dt = await Client.updateOne(
    { email: req.user.email },
    { tokens: filtered }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.clearCookie("ltk").json({ message: "logged out successfully" });
      return "block";
    });
  if (dt === "block") {
    return;
  }
  return res.clearCookie("ltk").json({ message: "logged out successfully" });
};

// === ==== === client dashboard === ==== === //

const Booking = require("../models/client/bookings");

// === === === ongoing booking provider === === === //

exports.client_ongoing = async (req, res) => {
  let { from, to, fromcode, tocode, type, Package, entry, pag } = req.body;
  if (
    !entry ||
    isNaN(entry) ||
    typeof entry !== "string" ||
    !pag ||
    typeof pag !== "number" ||
    !["10", "15", "20", "25"].some((itm) => itm === entry)
  ) {
    return res.status(400).json("Invalid request");
  }
  let qury = {};
  if (type) {
    if (
      typeof type !== "string" ||
      !["Oneway", "Roundtrip", "Local"].some((itm) => itm === type)
    ) {
      return;
    }
    if (type === "Local") {
      qury = { ...qury, bookingtype: type };
      tp = "";
      if (Package) {
        if (
          typeof Package === "string" ||
          !["4-40", "8-80", "12-120"].some((itm) => itm === Package)
        ) {
          return res.status(400).json("Invalid request");
        }
      }
    } else {
      qury = { ...qury, bookingtype: "Outstation", outstation: type };
    }
  }
  if (from) {
    if (
      typeof from !== "string" ||
      !fromcode ||
      typeof fromcode !== "string" ||
      isNaN(fromcode)
    ) {
      return res.status(400).json("Invalid request");
    }
    qury = { ...qury, sourcecity: { from, fromcode } };
  }
  if (to) {
    if (
      typeof to !== "string" ||
      !tocode ||
      typeof tocode !== "string" ||
      isNaN(tocode)
    ) {
      return res.status(400).json("Invalid request");
    }
    qury = { ...qury, endcity: { to, tocode } };
  }
  let regex = new RegExp(["^", req.user.email, "$"].join(""), "i");
  qury = {
    ...qury,
    email: regex,
    bookingstatus: { $ne: "unconfirmed" },
    bookingstatus: { $in: ["ongoing", "confirmed", "assigned"] },
    status: "upcoming",
  };
  let result;
  const data = await Booking.find(qury, {
    _id: 0,
    advanceoptn: 0,
    bookingdate: 0,
    bookingstatus: 0,
    verificationkey: 0,
    "tripinfo.zero": 0,
    oprtramt: 0,
    bids: 0,
  })
    .sort({ _id: -1 })
    .limit(entry * 1)
    .skip(entry * (pag - 1))
    .then((res) => {
      result = res;
      return;
    })
    .catch((error) => {
      res.status(400).json("failed to fetch the data");
      return "block";
    });
  if (data === "block") {
    return;
  }
  if (result.length > 0) {
    let filtered = [];
    let date = new Date().getTime();
    result.map((itm) => {
      if (itm.pickupat - date >= 86400000) {
        filtered.push({
          sourcecity: itm.sourcecity,
          endcity: itm.endcity,
          close: itm.close,
          billing: itm.billing,
          otp: itm.otp,
          bookingid: itm.bookingid,
          bookingtype: itm.bookingtype,
          outstation: itm.outstation,
          pickupat: itm.pickupat,
          pickupdate: itm.pickupdate,
          bookingstatus: itm.bookingstatus,
          status: itm.status,
          tripinfo: itm.tripinfo,
          tripreason: itm.tripreason,
          payable: itm.payable,
          oprtramt: itm.oprtramt,
          advance: itm.advance,
          remaning: itm.remaning,
          assignedto: { assigned: itm.assignedto.assigned },
          cabinfo: { assigned: itm.cabinfo.assigned },
          driverinfo: { assigned: itm.driverinfo.assigned },
        });
      } else {
        filtered.push(itm);
      }
    });
    return res.json({
      name: req.user.name,
      bookings: filtered,
      result: true,
    });
  } else {
    return res.json({
      name: req.user.name,
      bookings: [],
      result: false,
      message: "No Booking's found",
    });
  }
};
// === === === completed booking provider === === === //

exports.client_completed = async (req, res) => {
  let { from, to, fromcode, tocode, type, Package, entry, pag } = req.body;
  if (
    !entry ||
    isNaN(entry) ||
    typeof entry !== "string" ||
    !pag ||
    typeof pag !== "number" ||
    !["10", "15", "20", "25"].some((itm) => itm === entry)
  ) {
    return res.status(400).json("Invalid request");
  }
  let qury = {};
  if (type) {
    if (
      typeof type !== "string" ||
      !["Oneway", "Roundtrip", "Local"].some((itm) => itm === type)
    ) {
      return;
    }
    if (type === "Local") {
      qury = { ...qury, bookingtype: type };
      tp = "";
      if (Package) {
        if (
          typeof Package === "string" ||
          !["4-40", "8-80", "12-120"].some((itm) => itm === Package)
        ) {
          return res.status(400).json("Invalid request");
        }
      }
    } else {
      qury = { ...qury, bookingtype: "Outstation", outstation: type };
    }
  }
  if (from) {
    if (
      typeof from !== "string" ||
      !fromcode ||
      typeof fromcode !== "string" ||
      isNaN(fromcode)
    ) {
      return res.status(400).json("Invalid request");
    }
    qury = { ...qury, sourcecity: { from, fromcode } };
  }
  if (to) {
    if (
      typeof to !== "string" ||
      !tocode ||
      typeof tocode !== "string" ||
      isNaN(tocode)
    ) {
      return res.status(400).json("Invalid request");
    }
    qury = { ...qury, endcity: { to, tocode } };
  }
  let regex = new RegExp(["^", req.user.email, "$"].join(""), "i");
  qury = {
    ...qury,
    email: regex,
    bookingstatus: { $ne: "unconfirmed" },
    bookingstatus: "completed",
    status: "completed",
  };
  let result;
  const data = await Booking.find(qury, {
    _id: 0,
    advanceoptn: 0,
    bookingdate: 0,
    bookingstatus: 0,
    verificationkey: 0,
    "tripinfo.zero": 0,
    oprtramt: 0,
    assignedto: 0,
    cabinfo: 0,
    driverinfo: 0,
    bids: 0,
  })
    .sort({ _id: -1 })
    .limit(entry)
    .skip(entry * (pag - 1))
    .then((res) => {
      result = res;
      return;
    })
    .catch((error) => {
      res.status(400).json("failed to fetch the booking data");
      return "block";
    });
  if (data === "block") {
    return;
  }
  if (result.length > 0) {
    return res.json({
      name: req.user.name,
      bookings: result,
      result: true,
    });
  } else {
    return res.json({
      name: req.user.name,
      bookings: [],
      result: false,
      message: "No Booking's found",
    });
  }
};
// === === === cancelled booking provider === === === //

exports.client_cancelled = async (req, res) => {
  let { from, to, fromcode, tocode, type, Package, entry, pag } = req.body;
  if (
    !entry ||
    isNaN(entry) ||
    typeof entry !== "string" ||
    !pag ||
    typeof pag !== "number" ||
    !["10", "15", "20", "25"].some((itm) => itm === entry)
  ) {
    return res.status(400).json("Invalid request");
  }
  let qury = {};
  if (type) {
    if (
      typeof type !== "string" ||
      !["Oneway", "Roundtrip", "Local"].some((itm) => itm === type)
    ) {
      return;
    }
    if (type === "Local") {
      qury = { ...qury, bookingtype: type };
      tp = "";
      if (Package) {
        if (
          typeof Package === "string" ||
          !["4-40", "8-80", "12-120"].some((itm) => itm === Package)
        ) {
          return res.status(400).json("Invalid request");
        }
      }
    } else {
      qury = { ...qury, bookingtype: "Outstation", outstation: type };
    }
  }
  if (from) {
    if (
      typeof from !== "string" ||
      !fromcode ||
      typeof fromcode !== "string" ||
      isNaN(fromcode)
    ) {
      return res.status(400).json("Invalid request");
    }
    qury = { ...qury, sourcecity: { from, fromcode } };
  }
  if (to) {
    if (
      typeof to !== "string" ||
      !tocode ||
      typeof tocode !== "string" ||
      isNaN(tocode)
    ) {
      return res.status(400).json("Invalid request");
    }
    qury = { ...qury, endcity: { to, tocode } };
  }
  let regex = new RegExp(["^", req.user.email, "$"].join(""), "i");
  qury = {
    ...qury,
    email: regex,
    bookingstatus: { $ne: "unconfirmed" },
    bookingstatus: "cancelled",
    status: "cancelled",
  };
  let result;
  const data = await Booking.find(qury, {
    _id: 0,
    advanceoptn: 0,
    bookingdate: 0,
    bookingstatus: 0,
    verificationkey: 0,
    "tripinfo.zero": 0,
    oprtramt: 0,
    assignedto: 0,
    cabinfo: 0,
    driverinfo: 0,
    bids: 0,
  })
    .sort({ _id: -1 })
    .limit(entry * 1)
    .skip(entry * (pag - 1))
    .then((res) => {
      result = res;
      return;
    })
    .catch((error) => {
      res.status(400).json("failed to fetch data");
      return "block";
    });
  if (data === "block") {
    return;
  }
  if (result.length > 0) {
    return res.json({
      name: req.user.name,
      bookings: result,
      result: true,
    });
  } else {
    return res.json({
      name: req.user.name,
      bookings: [],
      message: "No booking found",
      result: false,
    });
  }
};

// === ==== === client  === ==== === //

const Rates = require("../models/client/rates");
const Hourly = require("../models/client/hourlyrental");
const City = require("../models/autocity");
const uniqid = require("uniqid");
exports.crt_booking = async (req, res) => {
  // common validation
  const tme = new Date().getTime() + 7200000;
  const {
    firstName,
    lastName,
    phone,
    email,
    trprsn,
    comname,
    comgstno,
    comaddress,
    pickupat,
    pickupdate,
    sourcecity,
    tripid,
    triptype,
    locality,
    address,
    addtype,
  } = req.body;
  if (
    !pickupat ||
    typeof pickupat !== "number" ||
    !pickupdate ||
    typeof pickupdate !== "number" ||
    !sourcecity ||
    typeof sourcecity !== "object" ||
    !tripid ||
    typeof tripid !== "string" ||
    !triptype ||
    typeof triptype !== "string" ||
    !email ||
    typeof email !== "string" ||
    !phone ||
    typeof phone !== "string" ||
    !firstName ||
    typeof firstName !== "string" ||
    !lastName ||
    typeof lastName !== "string" ||
    !trprsn ||
    typeof trprsn !== "string" ||
    !sourcecity.from ||
    typeof sourcecity.from !== "string" ||
    !sourcecity.fromcode ||
    typeof sourcecity.fromcode !== "string" ||
    !address ||
    typeof address !== "string" ||
    typeof addtype !== "string" ||
    !["auto", "custom"].some((itm) => itm === addtype)
  ) {
    return res.status(400).json("Error occured please make the booking again");
  } else if (pickupat < tme) {
    return res.status(422).json("Invalid time");
  } else if (!validator.isEmail(email)) {
    return res.status(422).json("Invalid email");
  } else if (!validator.isMobilePhone(phone)) {
    return res.status(422).json("Invalid phone");
  } else if (!["Personal", "Business"].some((itm) => itm === trprsn)) {
    return res.status(422).json("Invalid trip reason selected");
  }
  console.log(new Date(pickupat).toLocaleDateString() !==
  new Date(pickupdate).toLocaleDateString())
  console.log(new Date(pickupat).toLocaleDateString(),
  new Date(pickupdate).toLocaleDateString())
  if (
    new Date(pickupat).toLocaleDateString() !==
    new Date(pickupdate).toLocaleDateString()
  ) {
    return res.status(422).json("Invalid Pickup Date & Time");
  }
  // common validation end
  // creating ids
  const stats = await Stats.findOne({}, { booking: 1, _id: 0 })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (stats === "block") {
    return;
  }
  let islocality;
  let loca = { is: false };
  if (
    addtype === "auto" ||
    (locality && typeof locality === "string" && !isNaN(locality))
  ) {
    islocality = await City.findOne({
      cityname: sourcecity.from,
      citycode: sourcecity.fromcode,
    })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (islocality === "block") {
      return;
    }
    if (!islocality) {
      return res.status(400).json("Invalid request");
    }
    let [filtered] = islocality.locality.filter((itm) => {
      return itm.code === locality;
    });
    if (!filtered) {
      return res.status(400).json("invalid request");
    } else {
      loca = { is: true, data: filtered };
    }
  }
  let id = stats.booking.count + 100001;
  const orderid = `Ordr-`.concat(id);
  const bookingid = `Bkng-`.concat(id);
  // id creation end
  let NB;
  let bkngdata;
  let aopt = [];
  let verificationkey = uniqid();
  if (triptype === "local") {
    // local validation
    const istrip = await Hourly.findOne({
      "results._id": tripid,
    })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (istrip === "block") {
      return;
    }
    if (!istrip) {
      return res.status(422).json("Invalid Trip selected");
    } else if (
      sourcecity.from !== istrip.from ||
      sourcecity.fromcode !== istrip.fromcode
    ) {
      return res
        .status(422)
        .json("Error occured please make the booking again");
    }
    const [selected] = istrip.results.filter((itm) => {
      return itm._id === tripid;
    });
    if (!selected.isavilable) {
      return res.status(422).json("trip unavilable");
    }
    if (selected.zero) {
      aopt.push(
        {
          Amount: 0,
          Remaning: selected.totalpayable,
          Atype: "0%",
        },
        {
          Amount: Math.floor((selected.totalpayable * 10) / 100),
          Remaning:
            selected.totalpayable -
            Math.floor((selected.totalpayable * 10) / 100),
          Atype: "10%",
        }
      );
      let i = 25;
      while (i <= 100) {
        const Amount = Math.floor((selected.totalpayable * i) / 100);
        let topu = {
          Amount,
          Remaning: selected.totalpayable - Amount,
          Atype: `${i}%`,
        };
        aopt.push(topu);
        i = i * 2;
      }
    } else {
      aopt.push({
        Amount: Math.floor((selected.totalpayable * 10) / 100),
        Remaning:
          selected.totalpayable -
          Math.floor((selected.totalpayable * 10) / 100),
        Atype: "10%",
      });
      let i = 25;
      while (i <= 100) {
        const Amount = Math.floor((selected.totalpayable * i) / 100);
        let topu = {
          Amount,
          Remaning: selected.totalpayable - Amount,
          Atype: `${i}%`,
        };
        aopt.push(topu);
        i = i * 2;
      }
    }
    bkngdata = {
      orderid,
      bookingid,
      bookingtype: "Local",
      sourcecity,
      pickupat,
      pickupdate,
      verificationkey,
      email,
      phone,
      firstName,
      lastName,
      tripreason: trprsn,
      bookingstatus: "unconfirmed",
      status: "upcoming",
      tripinfo: selected,
      payable: selected.totalpayable,
      oprtramt: selected.oprtramt,
      advance: 0,
      remaning: selected.totalpayable,
      bookingdate: new Date().getTime(),
      advanceoptn: aopt,
      assignedto: {
        assigned: false,
      },
      cabinfo: {
        assigned: false,
      },
      driverinfo: {
        assigned: false,
      },
      reschedule: {
        isreschedule: false,
        count: 0,
        before: [],
      },
    };
  } else if (triptype === "outstation") {
    const { endcity, outstationtype, returnat } = req.body;
    if (
      !endcity ||
      typeof endcity !== "object" ||
      !outstationtype ||
      typeof outstationtype !== "string" ||
      !endcity.to ||
      typeof endcity.to !== "string" ||
      !endcity.tocode ||
      typeof endcity.tocode !== "string"
    ) {
      return res.status(422).json("Please create the request again 1");
    }
    if (outstationtype === "Oneway") {
      const istrip = await Rates.findOne({
        "results._id": tripid,
      })
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (istrip === "block") {
        return;
      }
      if (!istrip) {
        return res.status(422).json("Invalid Trip selected");
      } else if (
        sourcecity.from !== istrip.from ||
        sourcecity.fromcode !== istrip.fromcode ||
        endcity.to !== istrip.to ||
        endcity.tocode !== istrip.tocode
      ) {
        return res
          .status(422)
          .json("Error occured please make the booking again");
      }
      const [selected] = istrip.results.filter((itm) => {
        return itm._id === tripid;
      });
      if (!selected.isavilable) {
        return res.status(422).json("trip unavilable");
      }
      if (selected.zero) {
        aopt.push(
          {
            Amount: 0,
            Remaning: selected.totalpayable,
            Atype: "0%",
          },
          {
            Amount: Math.floor((selected.totalpayable * 10) / 100),
            Remaning:
              selected.totalpayable -
              Math.floor((selected.totalpayable * 10) / 100),
            Atype: "10%",
          }
        );
        let i = 25;
        while (i <= 100) {
          const Amount = Math.floor((selected.totalpayable * i) / 100);
          let topu = {
            Amount,
            Remaning: selected.totalpayable - Amount,
            Atype: `${i}%`,
          };
          aopt.push(topu);
          i = i * 2;
        }
      } else {
        aopt.push({
          Amount: Math.floor((selected.totalpayable * 10) / 100),
          Remaning:
            selected.totalpayable -
            Math.floor((selected.totalpayable * 10) / 100),
          Atype: "10%",
        });
        let i = 25;
        while (i <= 100) {
          const Amount = Math.floor((selected.totalpayable * i) / 100);
          let topu = {
            Amount,
            Remaning: selected.totalpayable - Amount,
            Atype: `${i}%`,
          };
          aopt.push(topu);
          i = i * 2;
        }
      }
      bkngdata = {
        orderid,
        bookingid,
        bookingtype: "Outstation",
        outstation: outstationtype,
        sourcecity,
        endcity,
        pickupat,
        returnat,
        pickupdate,
        verificationkey,
        email,
        phone,
        firstName,
        lastName,
        tripreason: trprsn,
        bookingstatus: "unconfirmed",
        status: "upcoming",
        tripinfo: selected,
        payable: selected.totalpayable,
        oprtramt: selected.oprtramt,
        advance: 0,
        remaning: selected.totalpayable,
        bookingdate: new Date().getTime(),
        advanceoptn: aopt,
        assignedto: {
          assigned: false,
        },
        cabinfo: {
          assigned: false,
        },
        driverinfo: {
          assigned: false,
        },
        reschedule: {
          isreschedule: false,
          count: 0,
          before: [],
        },
      };
    } else if (outstationtype === "Roundtrip") {
      if (!returnat) {
        return res.status(422).json("Please create the request again 2");
      }
      const istrip = await Rates.findOne({
        "roundresults._id": tripid,
      })
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (istrip === "block") {
        return;
      }
      if (!istrip) {
        return res.status(422).json("Invalid Trip selected");
      } else if (
        sourcecity.from !== istrip.from ||
        sourcecity.fromcode !== istrip.fromcode ||
        endcity.to !== istrip.to ||
        endcity.tocode !== istrip.tocode
      ) {
        return res
          .status(422)
          .json("Error occured please make the booking again");
      }

      const [selected] = istrip.roundresults.filter((itm) => {
        return itm._id === tripid;
      });
      if (!selected.isavilable) {
        return res.status(422).json("trip unavilable");
      }
      const pickup = new Date(pickupdate);
      const returna = new Date(returnat);
      const duration =
        (new Date(
          returna.getFullYear(),
          returna.getMonth(),
          returna.getDate(),
          0,
          0,
          0,
          0
        ).getTime() -
          new Date(
            pickup.getFullYear(),
            pickup.getMonth(),
            pickup.getDate(),
            0,
            0,
            0,
            0
          ).getTime()) /
        86400000;
      let toset, new_obj;
      if (duration > 14) {
        return res
          .status(422)
          .json(
            "Please contact our coustumer care for trips longer then 15 days"
          );
      }
      if (selected.dayrates.length >= duration + 1) {
        toset = selected.dayrates[duration];
        new_obj = {
          _id: selected._id,
          zero: selected.zero,
          distance: toset.distance,
          isavilable: selected.isavilable,
          category: selected.category,
          name: selected.name,
          cab_id: selected.cab_id,
          group_id: selected.group_id,
          rdr: selected.rdr,
          minchrg: toset.minchrg,
          equivalent: selected.equivalent,
          regularamount: toset.regularamount,
          basefare: toset.bsfr,
          othercharges: selected.othercharges,
          totalpayable: toset.totalpayable,
          oprtramt: toset.oprtramt,
        };
      } else {
        const lp = selected.dayrates[selected.dayrates.length - 1];
        const rd = duration + 1 - selected.dayrates.length;
        const expan = selected.expand;
        toset = {
          distance: lp.distance + expan.distance * rd,
          regularamount: lp.regularamount + expan.regularamount * rd,
          totalpayable: lp.totalpayable + expan.totalpayable * rd,
          bsfr: lp.bsfr + expan.bsfr * rd,
          oprtramt: lp.oprtramt + expan.oprtramt * rd,
          minchrg: lp.minchrg + expan.minchrg * rd,
          day: lp.day + 1 * rd,
        };
        new_obj = {
          _id: selected._id,
          zero: selected.zero,
          distance: toset.distance,
          isavilable: selected.isavilable,
          category: selected.category,
          name: selected.name,
          cab_id: selected.cab_id,
          group_id: selected.group_id,
          rdr: selected.rdr,
          minchrg: toset.minchrg,
          equivalent: selected.equivalent,
          regularamount: toset.regularamount,
          basefare: toset.bsfr,
          othercharges: selected.othercharges,
          totalpayable: toset.totalpayable,
          oprtramt: toset.oprtramt,
        };
      }
      if (selected.zero) {
        aopt.push(
          {
            Amount: 0,
            Remaning: toset.totalpayable,
            Atype: "0%",
          },
          {
            Amount: Math.floor((toset.totalpayable * 10) / 100),
            Remaning:
              toset.totalpayable - Math.floor((toset.totalpayable * 10) / 100),
            Atype: "10%",
          }
        );
        let i = 25;
        while (i <= 100) {
          const Amount = Math.floor((toset.totalpayable * i) / 100);
          let topu = {
            Amount,
            Remaning: toset.totalpayable - Amount,
            Atype: `${i}%`,
          };
          aopt.push(topu);
          i = i * 2;
        }
      } else {
        aopt.push({
          Amount: Math.floor((toset.totalpayable * 10) / 100),
          Remaning:
            toset.totalpayable - Math.floor((toset.totalpayable * 10) / 100),
          Atype: "10%",
        });
        let i = 25;
        while (i <= 100) {
          const Amount = Math.floor((toset.totalpayable * i) / 100);
          let topu = {
            Amount,
            Remaning: toset.totalpayable - Amount,
            Atype: `${i}%`,
          };
          aopt.push(topu);
          i = i * 2;
        }
      }
      bkngdata = {
        orderid,
        bookingid,
        bookingtype: "Outstation",
        outstation: outstationtype,
        sourcecity,
        endcity,
        pickupat,
        returnat,
        pickupdate,
        verificationkey,
        email,
        phone,
        firstName,
        lastName,
        tripreason: trprsn,
        bookingstatus: "unconfirmed",
        status: "upcoming",
        tripinfo: new_obj,
        payable: toset.totalpayable,
        oprtramt: toset.oprtramt,
        advance: 0,
        remaning: toset.totalpayable,
        bookingdate: new Date().getTime(),
        advanceoptn: aopt,
        assignedto: {
          assigned: false,
        },
        cabinfo: {
          assigned: false,
        },
        driverinfo: {
          assigned: false,
        },
        reschedule: {
          isreschedule: false,
          count: 0,
          before: [],
        },
      };
    } else {
      return res.status(422).json("invalid outstation type");
    }
  } else {
    return res.status(422).json("Invalid trip type");
  }
  if (trprsn === "Business") {
    bkngdata = {
      ...bkngdata,
      gst: { number: comgstno, name: comname, address: comaddress },
    };
  }
  if (loca.is) {
    bkngdata.sourcecity = {
      ...bkngdata.sourcecity,
      pickupadress: loca.data.name,
      geocode: loca.data.longlat,
      code: loca.data.code,
    };
  }
  if (addtype === "custom") {
    bkngdata.sourcecity = { ...bkngdata.sourcecity, pickupadress: address };
  }
  NB = new Booking(bkngdata);
  let pr;
  let result = await NB.save()
    .then((res) => {
      pr = true;
      return;
    })
    .catch((error) => {
      pr = false;
      return;
    });
  if (pr) {
    const statup = await Stats.updateOne(
      {},
      {
        "booking.count": stats.booking.count + 1,
        "booking.inquiry": stats.booking.inquiry + 1,
      }
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (statup === "block") {
      return;
    }
    return res.status(201).json({
      data: {
        bookingid,
        orderid,
        contactdtls: {
          email,
          phone,
          firstName,
          lastName,
        },
        pickupat,
        pickupdate,
        sourcecity,
        verificationkey,
        aopt,
      },
      result: "success",
    });
  } else {
    return res
      .status(422)
      .json("cant proceed the request please try again later");
  }
};

// === === === create tour inquiry === === === //
const Tourbooking = require("../models/client/tourbooking");
exports.crt_tourinqu = async (req, res) => {
  const { name, phone, email, date, person, tour, message } = req.body;

  if (
    !name ||
    !phone ||
    !email ||
    !date ||
    !person ||
    !tour ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof date !== "number" ||
    typeof person !== "string" ||
    typeof tour !== "string" ||
    name.length > 100
  ) {
    return res.status(400).json("invalid request");
  }
  if (!validator.isMobilePhone(phone, "en-IN")) {
    return res.status(400).json("Invalid request");
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json("Invalid request");
  }
  if (person * 1 > 100 || person * 1 <= 0) {
    return res.status(400).json("Invalid request");
  }
  if (new Date().getTime() + 86400000 > date * 1) {
    return res.status(400).json("Invalid request");
  }
  var regName = /^[ a-zA-Z\-/']+$/;
  if (!regName.test(name)) {
    return res.status(400).json("Invalid request");
  }
  let tourdata = {
    name,
    phone,
    email,
    startdate: date,
    person,
    createdon: new Date().getTime(),
    status: "inquiry",
  };
  if (tour !== "other") {
    const ispackage = await package
      .findOne({ id: tour }, { _id: 0, url: 1 })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (ispackage === "block") {
      return;
    }
    if (!ispackage) {
      return res.status(400).json("Invalid tour id");
    }
    tourdata = { ...tourdata, tour, url: ispackage.url };
  } else {
    if (!message || typeof message !== "string" || message.length > 1000) {
      return res.status(400).json("Invalid request");
    }
    tourdata = { ...tourdata, tour, message };
  }
  const tb = new Tourbooking(tourdata);
  let pr;
  const result = await tb
    .save()
    .then((res) => {
      pr = true;
      return;
    })
    .catch((error) => {
      pr = false;
      return;
    });
  if (pr) {
    return res.status(201).json({ result: true });
  } else {
    return res.status(400).json("failed to create inquiry");
  }
};

// === === === updatebooking === === === //

const Order = require("../models/orders");

exports.updatebooking = async (req, res) => {
  let { bookingid, orderid, ad_amount, rzp_id } = req.body;
  // if (ad_amount == 0) {
  //   ad_amount = "0";
  // } else if (ad_amount < 0) {
  //   return res.status.json("invalid advance amount");
  // }

  if (
    !bookingid ||
    typeof bookingid !== "string" ||
    !orderid ||
    typeof orderid !== "string" ||
    !ad_amount ||
    typeof ad_amount !== "string"||
    isNaN(ad_amount)
  ) {
    return res.status(400).json("invalid request");
  }
  if(ad_amount !== "0"){
    ad_amount = ad_amount*1
    if(ad_amount < 0){
      return res.status.json("invalid advance amount");
    }
  }
  let bookingd;
  const booking = await Booking.findOne({ bookingid, orderid })
    .then((res) => {
      bookingd = res;
      return;
    })
    .catch((error) => {
      res.status(400).json("No booking found");
      return "block";
    });
  if (booking === "block") {
    return;
  }
  let orderd;
  if (rzp_id && typeof rzp_id === "string") {
    const order = await Order.findOne({ rzp_orderid: rzp_id })
      .then((res) => {
        orderd = res;
        return;
      })
      .catch((error) => {
        res.status(500).json("Failed to fetch data");
        return "block";
      });
    if (order === "block") {
      return;
    }
    if (orderd && orderd.orderid !== orderid) {
      return res.status(400).json("transaction was not made for this booking");
    }
  }
  const advanceoptn = bookingd.advanceoptn;
  if (orderd && orderd.status === "received") {
    if (advanceoptn.some((itm) => itm.Amount === orderd.amount)) {
      const updatebooking = await Booking.updateOne(
        {
          bookingid,
          orderid,
          email: bookingd.email,
        },
        {
          bookingstatus: "confirmed",
          advance: orderd.amount,
          remaning: bookingd.payable - orderd.amount,
        }
      )
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("updation failed please call our support");
          return "block";
        });
      if (updatebooking === "block") {
        return;
      }
      if (updatebooking.modifiedCount > 0) {
        const stat = await Stats.findOne({}, { booking: 1, _id: 0 })
          .then((res) => {
            return res;
          })
          .catch((error) => {
            res.status(500).json("failed to fetch data");
            return "block";
          });
        if (stat === "block") {
          return;
        }
        const statup = await Stats.updateOne(
          {},
          {
            "booking.inquiry": stat.booking.inquiry - 1,
            "booking.pending": stat.booking.pending + 1,
          }
        )
          .then((res) => {
            return res;
          })
          .catch((error) => {
            res.status(500).json("failed to fetch data");
            return "block";
          });
        if (statup === "block") {
          return;
        }
        return res.status(202).json({
          data: {
            bookingid: bookingd.bookingid,
            firstName: bookingd.firstName,
            email: bookingd.email,
            pickupat: bookingd.pickupat,
            sourcecity: bookingd.sourcecity,
            endcity: bookingd.endcity,
            bookingtype: bookingd.bookingtype,
            returnat: bookingd.returnat,
            outstation: bookingd.outstation,
            phone: bookingd.phone,
            tripinfo: bookingd.tripinfo,
            payable: bookingd.payable,
            advance: orderd.amount,
            remaning: bookingd.remaning - orderd.amount,
          },
        });
      } else {
        return res.status(400).json("some error occured");
      }
    } else {
      return res.status(422).json("invalid advance amount");
    }
  } else if (orderd && orderd.status === "created") {
    return res.status(422).json("advance not recived");
  } else if (ad_amount == 0) {
    if (advanceoptn.some((itm) => itm.Amount === 0)) {
      let updtr;
      const updatebooking = await Booking.updateOne(
        {
          bookingid,
          orderid,
          email: bookingd.email,
        },
        {
          bookingstatus: "confirmed",
        }
      )
        .then((res) => {
          updtr = res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (updatebooking === "block") {
        return;
      }
      if (updtr.modifiedCount > 0) {
        const stat = await Stats.findOne({}, { booking: 1, _id: 0 })
          .then((res) => {
            return res;
          })
          .catch((error) => {
            res.status(500).json("failed to fetch data");
            return "block";
          });
        if (stat === "block") {
          return;
        }
        const statup = await Stats.updateOne(
          {},
          {
            "booking.inquiry": stat.booking.inquiry - 1,
            "booking.pending": stat.booking.pending + 1,
          }
        )
          .then((res) => {
            return res;
          })
          .catch((error) => {
            res.status(500).json("failed to fetch data");
            return "block";
          });
        if (statup === "block") {
          return;
        }
        return res.status(202).json({
          data: {
            bookingid: bookingd.bookingid,
            name: bookingd.name,
            email: bookingd.email,
            pickupat: bookingd.pickupat,
            sourcecity: bookingd.sourcecity,
            endcity: bookingd.endcity,
            bookingtype: bookingd.bookingtype,
            returnat: bookingd.returnat,
            outstation: bookingd.outstation,
            phone: bookingd.phone,
            tripinfo: bookingd.tripinfo,
            payable: bookingd.payable,
            advance: bookingd.advance,
            remaning: bookingd.remaning,
          },
        });
      } else {
        return res.status(500).json("updation failed please call our support");
      }
    } else {
      return res.status(422).json("0 is invalid advance amount");
    }
  } else {
    return res.status(422).json("invalid request");
  }
};

// ==== ==== ==== cancel booking ==== ==== ==== //

exports.cancel_bookreq = async (req, res) => {
  const { bookingid, reason } = req.body;
  const user = req.user;
  const valrsn = [
    "Will travel later",
    "Travel plan cancelled",
    "Travel plan changed",
    "Rate issue",
    "Can't find preferred car model",
    "Changing cab type",
    "Problem in Payment",
  ];
  if (
    !bookingid ||
    typeof bookingid !== "string" ||
    !reason ||
    typeof reason !== "string" ||
    !valrsn.some((itm) => itm === reason)
  ) {
    return res.status(400).json("invalid request");
  }
  let bookingd;
  let regex = new RegExp(["^", user.email, "$"].join(""), "i");
  const booking = await Booking.findOne({
    bookingid: bookingid,
    email: regex,
  })
    .then((res) => {
      bookingd = res;
      return;
    })
    .catch((error) => {
      res.status(400).json("No booking found");
      return "block";
    });
  if (booking === "block") {
    return;
  }
  if (user.email.toUpperCase() !== bookingd.email.toUpperCase()) {
    return res.status(400).json("bad request");
  } else if (bookingd.status !== "upcoming") {
    return res.status(422).json("Invalid request");
  }
  const date = new Date().getTime();
  let data = {
    status: "cancelled",
    bookingstatus: "cancelled",
  };
  let refund,
    cancelfee = 0;
  if (bookingd.pickupat - 86400000 < date) {
    if (bookingd.advance > 0) {
      refund = bookingd.advance - Math.floor((bookingd.payable * 10) / 100);
      cancelfee = Math.floor((bookingd.payable * 10) / 100);
      if (refund > 0) {
        data = {
          ...data,
          billing: {
            cancel: {
              cancelon: date,
              cancelrsn: reason,
              cancelfee,
              refund,
              refunded: false,
            },
            billed: false,
          },
        };
      } else {
        data = {
          ...data,
          billing: {
            cancel: {
              cancelon: date,
              cancelrsn: reason,
              cancelfee,
              refund,
              refunded: true,
            },
            billed: false,
          },
        };
      }
    } else {
      refund = 0;
      data = {
        ...data,
        billing: {
          cancel: {
            cancelon: date,
            cancelrsn: reason,
            cancelfee: 0,
            refund: 0,
            refunded: true,
          },
          billed: false,
        },
      };
    }
  } else {
    refund = bookingd.advance;
    data = {
      ...data,
      billing: {
        cancel: {
          cancelon: date,
          cancelrsn: reason,
          cancelfee: 0,
          refund,
          refunded: false,
        },
        billed: false,
      },
    };
  }
  let cnclp;
  const cancel = await Booking.updateOne(
    { bookingid: bookingid, email: regex },
    data
  )
    .then((res) => {
      cnclp = res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (cancel === "block") {
    return;
  }
  if (cnclp.modifiedCount > 0) {
    const stat = await Stats.findOne({}, { booking: 1, _id: 0 })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (stat === "block") {
      return;
    }
    const statup = await Stats.updateOne(
      {},
      {
        "booking.pending": stat.booking.pending - 1,
        "booking.cancelled": stat.booking.cancelled + 1,
      }
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (statup === "block") {
      return;
    }
    let opdata = "";
    if (bookingd.assignedto.assigned) {
      let TYPE =
        bookingd.bookingtype === "Outstation"
          ? `${bookingd.outstation} (${bookingd.tripinfo.distance}km)`
          : `Local (${bookingd.tripinfo.hour}hr - ${bookingd.tripinfo.distance}km)`;
      opdata = {
        to: [
          {
            name: bookingd.assignedto.name,
            email: bookingd.assignedto.email,
          },
        ],
        from: {
          name: "Revacabs",
          email: "info@1cyqpu.mailer91.com",
        },
        domain: "1cyqpu.mailer91.com",
        mail_type_id: "1",
        reply_to: [
          {
            email: "info@1cyqpu.mailer91.com",
          },
        ],
        template_id: "operator_cancel_notify",
        variables: {
          NAME: bookingd.assignedto.name,
          BOOKINGID: bookingd.bookingid,
          DRIVER: bookingd.driverinfo.assigned
            ? bookingd.driverinfo.name
            : "Not Assigned",
          CAB: bookingd.cabinfo.assigned
            ? `${bookingd.cabinfo.name} ( ${bookingd.cabinfo.carNumber} )`
            : "Not Assigned",
          TYPE,
        },
      };
    }
    let data = {
      to: [
        {
          name: user.firstName,
          email: user.email,
        },
      ],
      from: {
        name: "Revacabs",
        email: "info@1cyqpu.mailer91.com",
      },
      domain: "1cyqpu.mailer91.com",
      mail_type_id: "1",
      reply_to: [
        {
          email: "info@1cyqpu.mailer91.com",
        },
      ],
      template_id: "client_booking_cancel",
      variables: {
        NAME: user.firstName,
        BOOKINGID: bookingd.bookingid,
        BOOKINGAMOUNT: bookingd.payable,
        ADVANCE: `₹ ${bookingd.advance}`,
        CNCLCHRG: `₹ ${cancelfee}`,
        REFUND: `₹ ${refund}`,
      },
    };
    const customConfig = {
      headers: {
        "Content-Type": "application/JSON",
        Accept: "application/json",
        authkey: process.env.MSG91AUTH,
      },
    };
    const emailreq = axios
      .post("https://api.msg91.com/api/v5/email/send", data, customConfig)
      .then((res) => {})
      .catch((error) => {});
    if (bookingd.assignedto.assigned) {
      const opemailreq = axios
        .post("https://api.msg91.com/api/v5/email/send", opdata, customConfig)
        .then((res) => {})
        .catch((error) => {});
    }

    return res.json("cancelled successfully");
  } else {
    return res.status(400).json("cant process the request");
  }
};

// ==== ==== ==== select car ==== ==== ==== //

exports.select_car = async (req, res) => {
  const {
    bookingtype,
    outstationtype,
    from,
    fromcode,
    to,
    tocode,
    pickupdate,
    pickupat,
    returnat,
  } = req.body;
  const bookingtypes = ["outstation", "local", "tour"];
  if (
    !bookingtype ||
    typeof bookingtype !== "string" ||
    !bookingtypes.some((itm) => itm === bookingtype) ||
    !from ||
    typeof from !== "string" ||
    !fromcode ||
    typeof fromcode !== "string" ||
    !pickupdate ||
    typeof pickupdate !== "number" ||
    !pickupat ||
    typeof pickupat !== "number"
  ) {
    return res.status(422).json("invalid request");
  }
  const tme = new Date().getTime() + 6600000;
  if (pickupat < tme) {
    return res.status(422).json("invalid pickup time");
  }
  try {
    if (bookingtype === "local") {
      const hourly = await Hourly.findOne(
        {
          from: from,
          fromcode: fromcode,
          list: true,
        },
        {
          from: 0,
          fromcode: 0,
          list: 0,
          longlat: 0,
          count: 0,
          "results.oprtramt": 0,
          "results.minchrg": 0,
          _id: 0,
        }
      )
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (hourly === "block") {
        return;
      }
      if (!hourly) {
        return res
          .status(404)
          .json(
            "Dear customer, we are expanding our network and will serve this city shortly"
          );
      } else {
        const result = {
          request: "sucess",
          from: from,
          fromcode: fromcode,
          pickupdate: pickupdate,
          pickupat: pickupat,
          result: hourly.results,
        };
        return res.json(result);
      }
    } else if (bookingtype === "outstation") {
      const valout = ["Oneway", "Roundtrip"];
      if (
        !to ||
        !tocode ||
        typeof to !== "string" ||
        typeof tocode !== "string" ||
        !outstationtype ||
        typeof outstationtype !== "string" ||
        !valout.some((itm) => itm === outstationtype)
      ) {
        return res.status(400).json("invalid request");
      }
      if (outstationtype === "Oneway") {
        const rates = await Rates.findOne(
          {
            from: from,
            fromcode: fromcode,
            to: to,
            tocode: tocode,
          },
          {
            from: 0,
            fromcode: 0,
            to: 0,
            tocode: 0,
            list: 0,
            fromlonglat: 0,
            tolonglat: 0,
            onecount: 0,
            roundcount: 0,
            roundresults: 0,
            "results.oprtramt": 0,
            "results.minchrg": 0,
            _id: 0,
          }
        )
          .then((res) => {
            return res;
          })
          .catch((error) => {
            res.status(500).json("failed to fetch data");
            return "block";
          });
        if (rates === "block") {
          return;
        }
        if (!rates) {
          return res
            .status(404)
            .json(
              "Dear customer, we are expanding our network and will serve this route shortly"
            );
        } else {
          const result = {
            request: "sucess",
            from: from,
            fromcode: fromcode,
            to: to,
            tocode: tocode,
            pickupdate: pickupdate,
            pickupat: pickupat,
            result: rates.results,
          };
          return res.json(result);
        }
      } else if (outstationtype === "Roundtrip") {
        if (!returnat || typeof returnat !== "number") {
          return res.status(400).json("invalid request");
        }
        const rates = await Rates.findOne(
          {
            from: from,
            fromcode: fromcode,
            to: to,
            tocode: tocode,
          },
          {
            from: 0,
            fromcode: 0,
            to: 0,
            tocode: 0,
            list: 0,
            fromlonglat: 0,
            tolonglat: 0,
            onecount: 0,
            roundcount: 0,
            results: 0,
            "roundresults.oprtramt": 0,
            "roundresults.minchrg": 0,
            _id: 0,
          }
        )
          .then((res) => {
            return res;
          })
          .catch((error) => {
            res.status(500).json("failed to fetch data");
            return "block";
          });
        if (rates === "block") {
          return;
        }
        if (!rates) {
          return res
            .status(404)
            .json(
              "Dear customer, we are expanding our network and will serve this route shortly"
            );
        }
        const pickup = new Date(pickupdate);
        const returnatd = new Date(returnat);
        const duration =
          (new Date(
            returnatd.getFullYear(),
            returnatd.getMonth(),
            returnatd.getDate(),
            0,
            0,
            0,
            0
          ).getTime() -
            new Date(
              pickup.getFullYear(),
              pickup.getMonth(),
              pickup.getDate(),
              0,
              0,
              0,
              0
            ).getTime()) /
          86400000;
        let results = [];
        rates.roundresults.map((itm) => {
          if (duration > 14) {
            return res
              .status(422)
              .json(
                "Please contact our coustumer care for trips longer then 15 days"
              );
          }
          if (itm.dayrates.length >= duration + 1) {
            const toset = itm.dayrates[duration];
            const new_obj = {
              _id: itm._id,
              zero: itm.zero,
              distance: toset.distance,
              isavilable: itm.isavilable,
              category: itm.category,
              name: itm.name,
              cab_id: itm.cab_id,
              group_id: itm.group_id,
              rdr: itm.rdr,
              equivalent: itm.equivalent,
              regularamount: toset.regularamount,
              othercharges: itm.othercharges,
              totalpayable: toset.totalpayable,
              basefare:toset.bsfr,
            };
            return results.push(new_obj);
          } else {
            const lp = itm.dayrates[itm.dayrates.length - 1];
            const rd = duration + 1 - itm.dayrates.length;
            const expan = itm.expand;
            const np = {
              distance: lp.distance + expan.distance * rd,
              regularamount: lp.regularamount + expan.regularamount * rd,
              bsfr:lp.bsfr + expan.bsfr * rd,
              totalpayable: lp.totalpayable + expan.totalpayable * rd,
              day: lp.day + 1 * rd,
            };
            const new_obj = {
              _id: itm._id,
              zero: itm.zero,
              distance: np.distance,
              isavilable: itm.isavilable,
              category: itm.category,
              name: itm.name,
              cab_id: itm.cab_id,
              group_id: itm.group_id,
              rdr: itm.rdr,
              equivalent: itm.equivalent,
              basefare: itm.basefare,
              regularamount: np.regularamount,
              othercharges: itm.othercharges,
              totalpayable: np.totalpayable,
              basefare:np.bsfr,
            };
            return results.push(new_obj);
          }
        });
        if (results.length <= 0) {
          return res.status(400).json("No package found");
        }
        const result = {
          request: "sucess",
          from: from,
          fromcode: fromcode,
          to: to,
          tocode: tocode,
          pickupdate: pickupdate,
          pickupat: pickupat,
          result: results,
        };
        return res.json(result);
      }
    } else {
      return res.code(422).send("unsupported booking type");
    }
  } catch (er) {}
};

// === ==== ==== account controller === ==== === //

exports.account = (req, res) => {
  const user = req.user;
  const data = {
    userdata: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      aPhone: user.aPhone ? user.aPhone : "",
      isverified: user.isverified,
      verification: user.verification,
    },
  };
  return res.json(data);
};

// ==== ==== ==== update profile === === === //

exports.updateprofile = async (req, res) => {
  const { email, firstName, lastName, phone, aPhone } = req.body;
  if (!email || !firstName || !lastName || !phone) {
    return res
      .status(422)
      .json({ error: "please provide the required details" });
  }
  if (
    typeof email !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof phone !== "string"
  ) {
    return res.stats(422).json("invalid data type");
  }
  const userfound = req.user;
  if (userfound.email !== email || userfound.phone !== phone) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const isMobilePhone = validator.isMobilePhone(phone, "en-IN");
  if (!isMobilePhone) {
    return res
      .status(422)
      .json({ error: "please enter a valid 10 digit indian phone no" });
  }
  if (aPhone.length > 0) {
    const isMobileaPhone = validator.isMobilePhone(aPhone, "en-IN");
    if (!isMobileaPhone) {
      return res
        .status(422)
        .json({ error: "please enter a valid 10 digit indian phone no" });
    }
    if (aPhone !== userfound.aPhone) {
      const aphonexists = await Client.findOne({
        $or: [{ phone: aPhone }, { aPhone: aPhone }],
      })
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (aphonexists === "block") {
        return;
      }
      if (aphonexists) {
        return res
          .status(422)
          .json({ error: "alternate phone already in use" });
      }
    }
  }
  if (
    firstName === userfound.firstName &&
    lastName === userfound.lastName &&
    aPhone === userfound.aPhone
  ) {
    return res.status(400).json("No changes were made");
  }
  const update = await Client.updateOne(
    {
      email: email,
      phone: userfound.phone,
    },
    {
      firstName: firstName,
      lastName: lastName,
      aPhone: aPhone,
    }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "cant complete your request please try again later" });
      return "block";
    });
  if (update === "block") {
    return;
  }
  if (update.modifiedCount > 0) {
    return res.status(202).json({
      message: "sucessfully updated",
      details: { email, firstName, lastName, phone, aPhone },
    });
  } else {
    return res.status(400).json("Some Error occured");
  }
};

// ==== === ==== update password === ==== ==== //

exports.updatepassword = async (req, res) => {
  const { npassword, ncPassword, password } = req.body;
  if (!npassword || !ncPassword || !password) {
    return res.status(401).json({ error: "please fill all the fields" });
  } else if (
    typeof password !== "string" ||
    typeof npassword !== "string" ||
    typeof ncPassword !== "string"
  ) {
    return res.status(422).json("invalid data type");
  } else if (npassword !== ncPassword) {
    return res
      .status(401)
      .json({ error: "password and confirm password do not match" });
  } else if (npassword.length < 8) {
    return res.status(401).json({ error: "please enter a strong password" });
  }
  const user = req.user;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(422).json({ error: "invalid password" });
  } else if (npassword === password) {
    return res.status(422).json({ error: "password is already in use" });
  } else {
    const update = await Client.updateOne(
      { email: user.email },
      { password: npassword, cPassword: ncPassword }
    )
      .then((res) => {
        return res;
      })
      .catch((res) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (update === "block") {
      return;
    }
    if (update.modifiedCount > 0) {
      return res.status(200).json({ message: "Password Changed Successfully" });
    } else {
      return res.status(422).json({
        error: "Can't Change the password right now please try again later ",
      });
    }
  }
};

// === === === otp validation === === === //

exports.validateotp = async (req, res) => {
  const { code, email } = req.body;
  if (!code || !email) {
    return res.status(400).json("please fill all the fields");
  }
  const user = await Client.findOne({
    email: { $regex: `${email}`, $options: "i" },
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (user === "block") {
    return;
  }
  if (!user) {
    return res.status(401).json({ error: "invalid request" });
  }
  const isOtp = await Otp.findOne({
    email: { $regex: `${email}`, $options: "i" },
    code: code,
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (isOtp === "block") {
    return;
  }
  if (isOtp) {
    //  otp type validate karo============
    if (isOtp.expiry > new Date().getTime()) {
      const Otpdel = await Otp.deleteMany({ email: email })
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (Otpdel === "block") {
        return;
      }
      const token = await user
        .genrateAuthToken()
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (token === "block") {
        return;
      }
      const update = await Client.updateOne(
        { email: email },
        { isverified: "authorised", "verification.phone": true }
      )
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (update === "block") {
        return;
      }
      if (update.modifiedCount > 0) {
        return res
          .cookie("ltk", token, {
            expires: new Date(Date.now() + 432000000),
            httpOnly: true,
          })
          .status(200)
          .json({ message: "account verified successfully", result: true });
      } else {
        return res
          .status(401)
          .json({ error: "verification failed please login after some time" });
      }
    } else {
      const Otpdel = await Otp.deleteMany({ email: email })
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (Otpdel === "block") {
        return;
      }
      return res.status(401).json({ error: "Otp is expired" });
    }
  } else {
    return res.status(401).json({ error: "invalid Otp" });
  }
};

// ==== ==== ==== otp route === === === //
const axios = require("axios");
exports.createotp = async (req, res) => {
  const { email, phone, rsn } = req.body;
  if (!email || !phone || !rsn) {
    return res.status(400).json("Data Missing");
  } else if (
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof rsn !== "string"
  ) {
    return res.status(400).json("invalid data type");
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json("invalid email");
  } else if (!validator.isMobilePhone(phone, "en-IN")) {
    return res.status(400).json("invalid phone");
  } else if (!["forgotpass", "verification"].some((itm) => itm === rsn)) {
    return res.status(400).json("invalid reason");
  }
  var toupdt = true;
  let userr;
  const user = await Client.findOne({
    email: { $regex: `${email}`, $options: "i" },
    phone,
  })
    .then((res) => {
      userr = res;
    })
    .catch((error) => {
      res.status(401).json({ error: "failed to fetch data" });
      return "block";
    });
  if (user === "block") {
    return;
  }
  let otp;
  function generateOTP() {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }
  if (!userr) {
    return res.status(401).json({ error: "failed to fetch data" });
  } else if (userr.isverified === "authorised" && rsn == "verification") {
    return res.status(401).json({ error: "invalid request" });
  }
  let otpr;
  const isOtp = await Otp.findOne({
    email: { $regex: `${email}`, $options: "i" },
    phone,
    type: rsn,
    for: "customer",
  })
    .then((res) => {
      otpr = res;
    })
    .catch((error) => {
      res.json(500).json("failed to fetch data");
      return "block";
    });
  if (isOtp === "block") {
    return;
  }
  if (otpr) {
    if (otpr.createdon + 1200 * 1000 < new Date().getTime()) {
      return res.status(400).json("Session expired");
    }
    if (otpr.resend.count >= 5) {
      return res.status(400).json("Maximum resend attempted");
    }
    if (otpr.resend.on + 60 * 1000 > new Date().getTime()) {
      return res.status(400).json("invalid request");
    }
    if (otpr.expiry - new Date().getTime() >= 60 * 1000) {
      otp = isOtp.code;
      toupdt = false;
    } else {
      otp = generateOTP();
    }
  } else {
    return res.status(400).json("invalid request");
  }
  const txtdata = JSON.stringify({
    route: "dlt",
    sender_id: "MTRACB",
    message: rsn === "verification" ? "143480" : "143661",
    variables_values: `${otp}|`,
    flash: 0,
    numbers: `${phone}`,
  });
  let customConfig = {
    headers: {
      "Content-Type": "application/json",
      authorization: process.env.FAST2SMSAUTH,
    },
  };

  if (toupdt) {
    const otpreq = await Otp.updateOne(
      {
        email: { $regex: `${email}`, $options: "i" },
        phone,
        type: rsn,
        for: "customer",
      },
      {
        code: otp,
        expiry: new Date().getTime() + 300 * 1000,
        "resend.on": new Date().getTime(),
        "resend.count": isOtp.resend.count + 1,
      }
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (otpreq === "block") {
      return;
    }
    if (otpreq.modifiedCount > 0) {
      const txtotp = await axios
        .post("https://www.fast2sms.com/dev/bulkV2", txtdata, customConfig)
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("faield to fetch data");
          return "block";
        });
      if (txtotp === "block") {
        return;
      }
      if (txtotp.data.return) {
        return res.json({ result: true });
      } else {
        return res.status(400).json("failed to send otp to your number");
      }
    } else {
      return res.status(400).json("failed to send otp to your number");
    }
  } else {
    const otpreq = await Otp.updateOne(
      {
        email: { $regex: `${email}`, $options: "i" },
        phone,
        type: rsn,
        for: "customer",
      },
      {
        "resend.on": new Date().getTime(),
        "resend.count": isOtp.resend.count + 1,
      }
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (otpreq === "block") {
      return;
    }
    if (otpreq.modifiedCount > 0) {
      const txtotp = await axios
        .post("https://www.fast2sms.com/dev/bulkV2", txtdata, customConfig)
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (txtotp === "block") {
        return;
      }

      if (txtotp.data.return) {
        return res.json({ result: true });
      } else {
        return res.status(400).json("failed to send otp to your number");
      }
    } else {
      return res.status(400).json("failed to send otp to your number");
    }
  }
};

// === === === tour package === === === //
const package = require("../models/client/package");
exports.findpackage = async (req, res) => {
  const { cts, actn, id, days } = req.body;
  let packages;
  if (!actn || !["fnd", "sugg"].some((itm) => itm === actn)) {
    return res.status(400).json("invalid request1");
  }

  if (actn === "fnd") {
    let srchdt = {};
    if (cts) {
      if (typeof cts !== "string") {
        return res.status(400).json("Invalid request");
      }
      srchdt = { "citys.cityname": cts };
    }
    if (days) {
      if (
        typeof days !== "string" ||
        isNaN(days) ||
        days * 1 > 10 ||
        days * 1 < 1
      ) {
        return res.status(400).json("Invalid request");
      }
      srchdt = { ...srchdt, days: days * 1 };
    }
    const req = await package
      .find(srchdt, {
        plan: 0,
        _id: 0,
        "citys._id": 0,
      })
      .limit(15)
      .then((res) => {
        packages = res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (req === "block") {
      return;
    }
  } else {
    if (!cts || !Array.isArray(cts)) {
      return res.status(400).json("Invalid request");
    }
    if (
      cts.some((itm) => {
        !itm || typeof itm !== "string";
      })
    ) {
      return res.status(400).json("invalid request");
    }
    if (!id || typeof id !== "string") {
      return res.status(400).json("invalid request");
    }
    let relr;
    let rel = await package
      .find(
        cts.length === 0
          ? {}
          : { "citys.cityname": { $in: cts }, id: { $ne: id } },
        {
          plan: 0,
          _id: 0,
          "citys._id": 0,
        }
      )
      .limit(5)
      .then((res) => {
        relr = res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (rel === "block") {
      return;
    }
    let trr;
    let tr = await package
      .find({ id: { $ne: id } }, { plan: 0, _id: 0, nights: 0, "citys._id": 0 })
      .limit(2)
      .then((res) => {
        trr = res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (tr === "block") {
      return;
    }
    packages = { tr: trr, rel: relr };
  }
  return res.json(packages);
};

// === === === package details === === === //

exports.pkgdtl = async (req, res) => {
  let url = req.params.packageurl;
  let regex = new RegExp(["^", url, "$"].join(""), "i");
  const packages = await package
    .findOne({ url: regex }, { "citys._id": 0, "plan._id": 0, _id: 0, url: 0 })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (packages === "block") {
    return;
  }
  if (packages) {
    return res.json(packages);
  } else {
    return res.status(400).json("No such package found");
  }
};
// ==== ==== ==== hmdata === === === //

exports.hmdata = async (req, res) => {
  
  const packages = await package
    .find({}, { plan: 0, _id: 0 })
    .limit(5)
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (packages === "block") {
    return;
  }
  return res.json(packages);
};

// === === === verify email === === === //

exports.email_verification = async (req, res) => {
  const user = req.user;
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json("Invalid data");
  }
  if (user.verification.email) {
    return res.status(400).json("Invalid request");
  }
  if (email !== user.email) {
    return res.status(400).json("Invalid request");
  }
  function generateOTP() {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }
  let otp = generateOTP();
  const date = new Date().getTime();
  const otpreq = new Otp({
    email,
    phone: user.phone,
    code: otp,
    expiry: date + 300 * 1000,
    type: "verification",
    for: "customer",
    createdon: date,
    resend: {
      on: date,
      count: 0,
    },
    senton: "email",
  });
  let sresult;
  const s = await otpreq
    .save()
    .then((res) => {
      sresult = true;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (s === "block") {
    return;
  }
  if (!sresult) {
    return res.status(500).JSON({
      error: "Failed to send otp please try again after some time",
    });
  }
  const data = {
    to: [
      {
        name: user.firstName,
        email: user.email,
      },
    ],
    from: {
      name: "Revacabs",
      email: "info@1cyqpu.mailer91.com",
    },
    domain: "1cyqpu.mailer91.com",
    mail_type_id: "1",
    reply_to: [
      {
        email: "info@1cyqpu.mailer91.com",
      },
    ],
    template_id: "Email_Verification",
    variables: {
      NAME: user.firstName,
      OTP: otp,
    },
  };
  const customConfig = {
    headers: {
      "Content-Type": "application/JSON",
      Accept: "application/json",
      authkey: process.env.MSG91AUTH,
    },
  };
  let emailreq;
  const emailre = await axios
    .post("https://api.msg91.com/api/v5/email/send", data, customConfig)
    .then((res) => {
      emailreq = res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (emailre === "block") {
    return;
  }
  if (emailreq.data.status === "success") {
    return res.status(201).json("an OTP has been sent to email");
  } else {
    return res.status(400).json("Failed to send OTP");
  }
};

// === === === validate email otp === === === //

exports.validatemailotp = async (req, res) => {
  const userdata = req.user;
  const { code, email } = req.body;
  if (!code || !email) {
    return res.status(400).json("please fill all the fields");
  }
  if (typeof email !== "string" || typeof code !== "string") {
    return res.status(400).json;
  }
  if (userdata.email !== email) {
    return res.status(401).json({ error: "invalid request" });
  }
  let otpr;
  const isOtp = await Otp.findOne({
    email: { $regex: `${email}`, $options: "i" },
    phone: userdata.phone,
    code: code,
  })
    .then((res) => {
      otpr = res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (isOtp === "block") {
    return;
  }
  if (otpr) {
    if (otpr.type !== "verification") {
      return res.status(400).json("invalid request");
    }
    if (otpr.expiry > new Date().getTime()) {
      const Otpdel = await Otp.deleteMany({ email: email })
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (Otpdel === "block") {
        return;
      }
      let updater;
      const update = await Client.updateOne(
        { email: email },
        { isverified: "authorised", "verification.email": true }
      )
        .then((res) => {
          updater = res;
        })
        .catch((error) => {
          res.status(500).json("failed to update status");
          return "block";
        });
      if (update === "block") {
        return;
      }
      if (updater.modifiedCount > 0) {
        return res.status(202).json("email verification successful ");
      } else {
        return res
          .status(401)
          .json({ error: "verification failed please login after some time" });
      }
    } else {
      res.status(401).json({ error: "Otp is expired" });
      const Otpdel = await Otp.deleteMany({ email: email })
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (Otpdel === "block") {
        return;
      }
    }
  } else {
    return res.status(401).json({ error: "invalid Otp" });
  }
};

// === === === auto fill === === === //
const jwt = require("jsonwebtoken");
const { locality } = require("./publiccontroller");
exports.bkng_autofill = async (req, res) => {
  const token = req.cookies.ltk;
  if (!token || typeof token !== "string") {
    return res.status(200).json({});
  }
  const match = jwt.verify(token, process.env.SECRET_KEY);
  if (!match) {
    return res.status(200).json({});
  }
  const isuser = await Client.findOne({
    _id: match._id,
    "tokens.token": token,
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (isuser === "block") {
    return;
  }
  if (isuser) {
    res.status(200).json({
      email: isuser.email,
      firstName: isuser.firstName,
      lastName: isuser.lastName,
      phone: isuser.phone,
    });
  } else {
    res.status(200).json({});
  }
};

exports.bkng_rscld = async (req, res) => {
  const userdata = req.user;
  let { date, time, bookingid } = req.body;
  if (
    !date ||
    !time ||
    !bookingid ||
    typeof time !== "string" ||
    typeof date !== "string" ||
    typeof bookingid !== "string"
  ) {
    return res.status(400).json("Invalid request 1");
  }
  time = time * 1;
  date = date * 1;
  if (
    new Date(time).toLocaleDateString() !== new Date(date).toLocaleDateString()
  ) {
    return res.status(400).json("invalid request");
  }
  const isbooking = await Booking.findOne({
    bookingid,
    email: userdata.email,
    status: "upcoming",
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (isbooking === "block") {
    return;
  }
  if (isbooking.reschedule.count >= 5) {
    return res.status(400).json("can't reschedule more than 5 time");
  }
  if (isbooking.pickupat - new Date().getTime() < 86400000) {
    return res.status(400).json("can not reschedule the booking now");
  }
  if (time - new Date().getTime() < 43200000) {
    return res.status(400).json("You can reschedule up to 12 hour from now");
  }

  let updt = {
    pickupat: time,
    pickupdate: date,
    reschedule: {
      count: isbooking.reschedule.count + 1,
      isreschedule: true,
      before: [
        ...isbooking.reschedule.before,
        {
          pickupat: isbooking.pickupat,
          pickupdate: isbooking.pickupdate,
          attime: new Date().getTime(),
        },
      ],
    },
  };
  const update = await Booking.updateOne(
    {
      bookingid,
      email: userdata.email,
      status: "upcoming",
    },
    updt
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (update === "block") {
    return;
  }
  if (update) {
    return res.status(201).json("Rescheduled successfully");
  } else {
    return res.status(400).json("Some error occured");
  }
};
