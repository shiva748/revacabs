const Partner = require("../models/partner/Registration");
const validator = require("validator");
const Stats = require("../models/stats");

// === === === register request === === === //

exports.register_partner = async (req, res) => {
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
  if (password.length > 60 || cPassword.length > 60) {
    return res
      .status(422)
      .json({ error: "Password's cannot be greater then 60 characters" });
  }
  if (email.length > 254) {
    return res
      .status(422)
      .json({ error: "email cannot be greater then 254 characters" });
  }
  if (phone.length > 10) {
    return res
      .status(422)
      .json({ error: "please enter a valid 10 digit phone no" });
  }
  if (password !== cPassword) {
    return res
      .status(422)
      .json({ error: "password and confirm password do not match" });
  }
  if (password.length < 8) {
    return res.status(422).json({ error: "Password must have 8 character's" });
  }
  const isemail = validator.isEmail(email);
  if (!isemail) {
    return res
      .status(422)
      .json({ error: "please enter a valid email address" });
  }
  const isMobilePhone = validator.isMobilePhone(phone, "en-IN");
  if (!isMobilePhone || phone.length > 10) {
    return res
      .status(422)
      .json({ error: "please enter a valid 10 digit indian phone no" });
  }
  const pattern = /^[a-zA-Z]{2,50}$/;
  if (!firstName.match(pattern)) {
    return res.status(422).json("please enter valid first name");
  }
  if (!lastName.match(pattern)) {
    return res.status(422).json("please enter valid last name");
  }
  try {
    let regex = new RegExp(["^", email, "$"].join(""), "i");
    let epr;
    const epexists = await Partner.findOne({
      $or: [{ email: regex }, { phone: phone }, { aPhone: phone }],
    })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json({ error: "failed to fetch data" });
        return "block";
      });
    if (epexists === "block") {
      return;
    }
    if (epexists) {
      if (epexists.email === email) {
        return res.status(400).json({ error: "email already exist" });
      } else if (epexists.phone === phone || epexists.aPhone === phone) {
        return res.status(400).json({ error: "phone already exist" });
      }
    }

    const user = new Partner({
      firstName,
      lastName,
      phone,
      email,
      password,
      cPassword,
      termCondition: "accepted",
      approved: true,
      "verification.request": true,
      "verification.isverified": false,
      faultin: { basc: true, prfl: true, dl: true, aadh: true },
      Date: new Date().getTime(),
      Securityfee: {
        received: false,
      },
      phonever: false,
    });
    const result = await user
      .save()
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json({ error: "failed to add data" });
        return "block";
      });
    if (result === "block") {
      return;
    }
    if (result) {
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
        for: "partner",
        resend: {
          on: new Date().getTime(),
          count: 0,
        },
        senton: "phone",
        attempt:0
      });
      const delotp = await Otp.deleteMany({
        email: email,
        phone: phone,
        for: "partner",
        senton: "phone",
        type: "verification",
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

// ==== ==== ==== verify reg otp ==== ==== ==== //

exports.ver_reg_otp = async (req, res) => {
  const { email, phone, code } = req.body;
  if (!email || !phone || !code) {
    return res.status(422).json({ error: "please fill all the fields" });
  }
  if (
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof code !== "string"
  ) {
    return res.status(400).json("invalid data type");
  }
  if (
    !validator.isEmail(email) ||
    !validator.isMobilePhone(phone, "en-IN") ||
    phone.length > 10
  ) {
    return res.status(400).json("Invalid request");
  }
  if (code.length !== 6) {
    return res.status(422).json({ error: "Otp length should be 6 " });
  }
  let regex = new RegExp(["^", email, "$"].join(""), "i");
  const isotp = await Otp.findOne({
    email: regex,
    phone: phone,
    for: "partner",
    senton: "phone",
    type: "verification",
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
    if(isotp.attempt >= 5){
      return res.status(400).json("Maximum request attempted")
    }
    if (code !== isotp.code) {
      res.status(400).json("Invalid otp");
      const upotp = await Otp.updateOne(
        {
          email: regex,
          phone: phone,
          for: "partner",
          senton: "phone",
          type: "verification",
        },
        { attempt: isotp.attempt + 1 }
      )
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
        return
    }
    if (isotp.expiry > new Date().getTime()) {
      const delotp = await Otp.deleteMany({
        email: email,
        phone: phone,
        for: "partner",
        senton: "phone",
        type: "verification",
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
      const update = await Partner.updateOne(
        { email: regex },
        { phonever: true }
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
        return res.status(200).json({ message: "Verification successfull" });
      } else {
        return res.status(422).json({
          error: "Can't proceed your request please try again later",
        });
      }
    } else {
      const delotp = await Otp.deleteMany({
        email: email,
        phone,
        for: "partner",
        type: "verification",
        senton: "phone",
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
      return res.status(400).json({ error: "Otp expired" });
    }
  } else {
    return res.status(422).json({ error: "invalid otp" });
  }
};

// ==== ==== ==== login controller ==== ==== ==== //

const bcrypt = require("bcryptjs");

exports.login_partner = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "please fill all the fields" });
  } else if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "invalid data type" });
  }
  if (password.length > 60) {
    return res
      .status(422)
      .json({ error: "Password cannot be greater then 60 characters" });
  }
  if (email.length > 254) {
    return res
      .status(422)
      .json({ error: "email cannot be greater then 254 characters" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  try {
    let regex = new RegExp(["^", email, "$"].join(""), "i");
    const user = await Partner.findOne({
      email: regex,
    })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(400).json({ error: "failed to fetch data from server" });
        return "block";
      });
    if (user === "block") {
      return;
    }
    if (!user) {
      return res.status(401).json({ error: "Your email or password is wrong" });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        if (!user.phonever) {
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
            email: user.email,
            phone: user.phone,
            code: otp,
            expiry: date + 300 * 1000,
            type: "verification",
            createdon: date,
            for: "partner",
            resend: {
              on: new Date().getTime(),
              count: 0,
            },
            senton: "phone",
            attempt:0
          });
          const delotp = await Otp.deleteMany({
            email: user.email,
            phone: user.phone,
            for: "partner",
            senton: "phone",
            type: "verification",
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
            numbers: `${user.phone}`,
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
            return res.status(200).json({
              result: true,
              pvr: true,
              message: `an otp has been sent to ${user.phone}`,
              details: { email: user.email, phone: user.phone },
            });
          } else {
            return res.status(500).json({
              error: "Failed to send otp please try again to login after some time",
            });
          }
        }
        if (user.approved) {
          const token = await user
            .genrateAuthToken()
            .then((res) => {
              return res;
            })
            .catch((error) => {
              res.status(500).json({ error: "failed to update data" });
              return "block";
            });
          if (token === "block") {
            return;
          }
          return res
            .cookie("Partnertok", token, {
              expires: new Date(Date.now() + 432000000),
              httpOnly: true,
            })
            .status(200)
            .json({
              result: true,
              pvr: false,
              message: "login successful",
            });
        } else {
          return res.status(200).json({
            result: false,
            message:
              "Your profile is not approved yet please contact our support team",
          });
        }
      } else {
        return res
          .status(401)
          .json({ error: "Your email or password is wrong" });
      }
    }
  } catch (err) {
    return res.status(500).json({ error: "your request cant be completed" });
  }
};

// ==== ==== ==== autologin ==== ==== ==== //

exports.partner_autolog = (req, res) => {
  const user = req.user;
  let data = {
    operatorid: user.operatorid,
    firstName: user.firstName,
    email: user.email,
    reqvrftn: user.verification.request,
  };
  if (user.verification.request) {
    data.faultin = user.faultin;
    data.prefill = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      aPhone: user.aPhone,
      birthDate: user.birthDate,
      city: user.city,
      aadhaarNumber: user.Doc.Aadhaar.Number,
      dlNumber: user.Doc.Drivinglicense.Number,
      dlValidity: user.Doc.Drivinglicense.Validity,
    };
  }
  if (!user.verification.request && user.verification.isverified) {
    data.reqfee = !user.Securityfee.received;
  }
  res.send(data);
};

// === === === logout === === === //

exports.partner_logout = async (req, res) => {
  const user = req.user;
  const tokens = user.tokens;
  const filtered = tokens.filter((itm) => {
    return itm.token !== req.token;
  });
  const update = await Partner.updateOne(
    { email: user.email, operatorid: user.operatorid },
    { tokens: filtered }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      return "block";
    });
  return res.clearCookie("Partnertok").json("Logged Out");
};

// === === === change password === === === //

exports.partner_changepass = async (req, res) => {
  const user = req.user;
  const { oldpass, newpass, cnfrmpass } = req.body;
  if (!oldpass || !newpass || !cnfrmpass) {
    return res.status(422).json("please fill all the fields");
  }
  if (
    typeof oldpass !== "string" ||
    typeof newpass !== "string" ||
    typeof cnfrmpass !== "string"
  ) {
    return res.status(422).json("invalid data type");
  }
  if (oldpass.length > 60 || newpass.length > 60 || cnfrmpass.length > 60) {
    return res
      .status(422)
      .json("password can not be greater then 60 character");
  } else if (oldpass.length < 8 || newpass.length < 8 || cnfrmpass.length < 8) {
    return res.status(422).json("password can not be smaller then 8 character");
  }

  if (newpass !== cnfrmpass) {
    return res.status(422).json("password and confirm password do not match");
  }
  const isMatch = await bcrypt.compare(oldpass, user.password);
  if (!isMatch) {
    return res.status(400).json("invalid old password");
  }
  if (oldpass == newpass) {
    return res.status(422).json("old and new password are same");
  }
  const tokens = user.tokens;
  const filtered = tokens.filter((itm) => {
    return itm.token == req.token;
  });
  const upd = await Partner.updateOne(
    { email: user.email, operatorid: user.operatorid },
    { password: newpass, cPassword: cnfrmpass, tokens: filtered }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (upd === "block") {
    return;
  }
  if (upd.modifiedCount > 0) {
    return res.status(201).json("password changed successfully");
  } else {
    return res.status(422).json("password update failed");
  }
};
// === === === sending profile === === === //

exports.partner_profilepic = async (req, res) => {
  let options = {
    root: path.join(
      __dirname,
      `../public/privateimages/operator/${req.user.operatorid}`
    ),
  };

  var fileName = req.user.Profile;
  if (
    !fileName ||
    !fs.existsSync(
      path.join(
        __dirname,
        `../public/privateimages/operator/${req.user.operatorid}`,
        fileName
      )
    )
  ) {
    options = {
      root: path.join(__dirname, "../public/privateimages/default/"),
    };
    fileName = "pic.png";
  }
  res.sendFile(fileName, options);
};

// === === === verify profile === === === //

var uniqid = require("uniqid");
const fs = require("fs");
const mime = require("mime");
const path = require("path");
exports.partner_verify = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    aPhone,
    birthDate,
    city,
    aadhaarNumber,
    dlNumber,
    dlValidity,
    aadhaarimg,
    profileimg,
    dlimg,
  } = req.body;

  const user = req.user;
  let operatorid, stats;
  if (user.email !== email || user.phone !== phone) {
    return res.status(400).json("email or phone can not be changed");
  }

  // === === === uploading images to server === === === //
  let Doc = user.Doc ? user.Doc : { Aadhaar: {}, Drivinglicense: {} };
  let datas = { Doc, faultin: user.faultin, verification: user.verification };
  const date = new Date().getTime();
  if (user.operatorid) {
    operatorid = user.operatorid;
  } else {
    stats = await Stats.findOne({}, { partner: 1, _id: 0 })
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
    operatorid = "Oprtr-".concat(stats.partner.count + 100001);
    datas.operatorid = operatorid;
  }
  if (
    !fs.existsSync(
      path.join(__dirname, `../public/privateimages/operator/${operatorid}`)
    )
  ) {
    fs.mkdirSync(
      path.join(__dirname, `../public/privateimages/operator/${operatorid}`)
    );
  }
  const uploadimage = (imagedata, name, paths) => {
    var matches = imagedata.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
      response = {};

    if (!matches || matches.length !== 3) {
      return { result: false, message: "Invalid image data" };
    }

    response.type = matches[1];
    response.data = Buffer.from(matches[2], "base64");
    let decodedImg = response;
    let imageBuffer = decodedImg.data;
    let type = decodedImg.type;
    let extension = mime.extension(type);
    if (extension !== "jpeg") {
      return { result: false, message: "Please provide a jpeg file only" };
    }
    let fileName = name;
    fs.writeFileSync(
      path.join(__dirname, paths, fileName),
      imageBuffer,
      "utf8"
    );
    return {
      result: true,
      message: "successfully uploaded",
      name: fileName,
    };
  };
  if (user.faultin.basc) {
    const pattern = /^[a-zA-Z]{2,50}$/;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !aPhone ||
      !city ||
      !birthDate
    ) {
      return res.status(422).json("Please fill all the fields");
    } else if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof aPhone !== "string" ||
      typeof birthDate !== "number"
    ) {
    }
    if (!firstName.match(pattern) || !lastName.match(pattern)) {
      return res.status(422).json("Please enter valid name");
    }
    if (!validator.isMobilePhone(aPhone) || aPhone.length > 10) {
      return res.status(422).json("Please enter valid 10 digit Phone no");
    }
    const minbd = new Date(
      new Date().setFullYear(new Date().getFullYear() - 18)
    );
    if (isNaN(birthDate) || new Date(birthDate) > minbd) {
      return res.status(422).json("Please enter valid birth Date");
    }
    // === === === city validation left === === === //
    datas = { ...datas, firstName, lastName, aPhone, city, birthDate };
    datas.faultin.basc = false;
  }
  if (user.faultin.prfl) {
    if (!profileimg) {
      return res.status(422).json("please fill all the fields");
    }
    let prfln;
    if (user.Profile) {
      prfln = user.Profile;
    } else {
      prfln = "prfln".concat(user.email.slice(0, 4), date, ".jpeg");
    }
    const profileupload = uploadimage(
      profileimg,
      prfln,
      `../public/privateimages/operator/${operatorid}/`
    );
    if (!profileupload.result) {
      return res.status(400).json(profileupload.result);
    }
    datas.Profile = profileupload.name;
    datas.faultin.prfl = false;
  }
  if (user.faultin.aadh) {
    if (!aadhaarNumber || !aadhaarimg) {
      return res.status(422).json("Please fill all the fields");
    }
    if (typeof aadhaarNumber !== "string" || isNaN(aadhaarNumber)) {
      return res.status(400).json("invalid data type");
    }
    let aadn;
    if (user.Doc.Aadhaar.Link) {
      aadn = user.Doc.Aadhaar.Link;
    } else {
      aadn = "aadn".concat(user.email.slice(0, 3), date, ".jpeg");
    }
    const pattern = /^[0-9]{12}$/;
    if (!aadhaarNumber.match(pattern)) {
      return res.status(422).json("Please enter valid aadhaar number");
    }
    const aadhaarupload = uploadimage(
      aadhaarimg,
      aadn,
      `../public/privateimages/operator/${operatorid}/`
    );
    if (!aadhaarupload.result) {
      return res.status(400).json(aadhaarupload.message);
    }
    datas.Doc.Aadhaar.Number = aadhaarNumber;
    datas.Doc.Aadhaar.Link = aadhaarupload.name;
    datas.faultin.aadh = false;
  }
  if (user.faultin.dl) {
    if (!dlNumber || !dlValidity || !dlimg) {
      return res.status(422).json("Please fill all the fields");
    }
    if (typeof dlNumber !== "string" || typeof dlValidity !== "number") {
      return res.status(400).json("invalid data type");
    }
    let mind = new Date();
    if (isNaN(dlValidity) || new Date(dlValidity) < mind) {
      return res.status(422).json("Invalid dl validity date selected");
    }
    const isdl = () => {
      
      // const regex = /^([A-Z]{2})(\d{2}|\d{3})[a-zA-Z]{0,1}(\d{4})(\d{7})$/gm;
      const str = dlNumber;
      // let m;
      // let matchs = 0;
      // while ((m = regex.exec(str)) !== null) {
      //   if (m.index === regex.lastIndex) {
      //     regex.lastIndex++;
      //   }
      //   m.forEach((match, groupIndex) => {
      //     matchs++;
      //   });
      // }
      if (str.length > 20) {
        return false;
      } else {
        return true;
      }
    };
    if (!isdl()) {
      return res.status(422).json("Please enter valid dl number");
    }
    let dln;
    if (user.Doc.Drivinglicense.Link) {
      dln = user.Doc.Drivinglicense.Link;
    } else {
      dln = "dln".concat(user.email.slice(0, 5), date, ".jpeg");
    }
    const dlupload = uploadimage(
      dlimg,
      dln,
      `../public/privateimages/operator/${operatorid}/`
    );
    if (!dlupload.result) {
      return res.status(400).json(dlupload.message);
    }
    datas.Doc.Drivinglicense.Number = dlNumber;
    datas.Doc.Drivinglicense.Validity = dlValidity;
    datas.Doc.Drivinglicense.Link = dlupload.name;
    datas.faultin.dl = false;
  }
  user.verification.request = false;
  const update = await Partner.updateOne(
    {
      email: user.email,
      phone: user.phone,
    },
    datas
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to update data");
      return "block";
    });
  if (update === "block") {
    return;
  }
  if (update.modifiedCount > 0) {
    if (!user.operatorid) {
      const statup = await Stats.updateOne(
        {},
        { "partner.count": stats.partner.count + 1 }
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
      if (statup.modifiedCount < 1) {
        return res.status(400).json("error occured");
      }
    }
    return res
      .status(201)
      .json("Document has been submitted we'll keep you updated");
  } else {
    return res
      .status(500)
      .json("Can't complete your request please contact support");
  }
};

// === === === Profile === === === //

exports.partner_profile = async (req, res) => {
  const user = req.user;
  let status;
  if (user.verification.isverified) {
    status = "verified";
  } else {
    if (user.verification.request) {
      status = "document";
    } else {
      status = "pending";
    }
  }
  const data = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    aPhone: user.aPhone,
    Date: user.Date,
    city: user.city,
    vehicles: 2,
    drivers: 2,
    trips: 50,
    earnings: 152655,
    penalties: 12564,
    bookingposted: 15,
    status,
  };
  res.status(200).json(data);
};

// === === === providing bookings === === === //

const Booking = require("../models/client/bookings");
exports.partner_booking = async (req, res) => {
  const user = req.user;
  const { from, fromcode, date, pag, entry } = req.body;
  if (
    !pag ||
    !entry ||
    typeof pag !== "string" ||
    typeof entry !== "string" ||
    !["10", "15", "20", "25"].some((itm) => itm === entry)
  ) {
    return res.status(400).json("invalid request");
  }
  if ((from && !fromcode) || (fromcode && !from)) {
    return res.status(400).json("invalid request");
  }
  if (from && typeof from !== "string") {
    return res.status(400).json("invalid data type");
  }
  if (fromcode && typeof fromcode !== "string") {
    return res.status(400).json("invalid data type");
  }
  if (date && typeof date !== "number") {
    return res.status(400).json("invalid date selected");
  }
  const result = await Booking.find(
    from && date
      ? {
          $or: [
            { "sourcecity.from": from, "sourcecity.fromcode": fromcode },
            { "endcity.to": from, "endcity.tocode": fromcode },
          ],
          pickupdate: date,
          bookingstatus: "confirmed",
          status: "upcoming",
        }
      : from
      ? {
          $or: [
            { "sourcecity.from": from, "sourcecity.fromcode": fromcode },
            { "endcity.to": from, "endcity.tocode": fromcode },
          ],
          bookingstatus: "confirmed",
          status: "upcoming",
        }
      : date
      ? {
          pickupdate: date,
          bookingstatus: "confirmed",
          status: "upcoming",
        }
      : {
          bookingstatus: "confirmed",
          status: "upcoming",
        },

    {
      orderid: 0,
      "sourcecity.pickupadress": 0,
      email: 0,
      phone: 0,
      name: 0,
      bookingstatus: 0,
      status: 0,
      cabinfo: 0,
      driverinfo: 0,
      bookingdate: 0,
      approvalby: 0,
      verificationkey: 0,
      advanceoptn: 0,
      cancelreason: 0,
      "tripinfo._id": 0,
      assignedto: 0,
      "bids.aPhone": 0,
      "bids.phone": 0,
      _id: 0,
    }
  )
    .limit(entry * 1)
    .skip(entry * 1 * (pag * 1 - 1))
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (result === "block") {
    return;
  }
  if (result) {
    res.json({
      operatorid: user.operatorid ? user.operatorid : user.operatedby,
      result,
    });
  } else {
    return res.status(500).json("failed to fetch data");
  }
};

// === === === Adding Drivers === === === //
const Driver = require("../models/partner/Drivers");
exports.partner_addriver = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    aPhone,
    aadhaarNumber,
    dlNumber,
    dlValidity,
    aadhaarimg,
    profileimg,
    dlimg,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !aPhone ||
    !aadhaarNumber ||
    !dlNumber ||
    !dlValidity ||
    !aadhaarimg ||
    !profileimg ||
    !dlimg
  ) {
    return res.json("please fill all the fields");
  }
  if (
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof aPhone !== "string" ||
    typeof aadhaarNumber !== "string" ||
    typeof dlNumber !== "string" ||
    typeof dlValidity !== "number" ||
    typeof aadhaarimg !== "string" ||
    typeof profileimg !== "string" ||
    typeof dlimg !== "string"
  ) {
    return res.status(400).json("invalid data type");
  }
  const user = req.user;
  if (!user.verification.isverified) {
    return res.status(400).json("you are not verifed cannot add any driver");
  }
  if (
    firstName.length < 3 ||
    firstName.length > 50 ||
    lastName.length < 3 ||
    lastName.length > 50
  ) {
    return res.status(400).json("Please enter a valid Name");
  } else if (firstName == null || lastName == null) {
    return res.status(400).json("Enter a valid name");
  }
  let mind = new Date().getTime();
  if (new Date(dlValidity) < mind) {
    return res.status(400).json("Please enter Valid Dates");
  }
  if (
    isNaN(aadhaarNumber) ||
    aadhaarNumber.length !== 12 ||
    aadhaarNumber * 1 < 100000000000
  ) {
    return res.status(400).json("Please enter a valid aadhaar number");
  }
  const dregex = /^([A-Z]{2})(\d{2}|\d{3})[a-zA-Z]{0,1}(\d{4})(\d{7})$/gm;
  const str = dlNumber;
  let m;
  let matchs = 0;
  while ((m = dregex.exec(str)) !== null) {
    if (m.index === dregex.lastIndex) {
      dregex.lastIndex++;
    }
    // eslint-disable-next-line
    m.forEach((match, groupIndex) => {
      matchs++;
    });
  }
  if (matchs !== 5) {
    return res.status(400).json("please enter a valid dl number");
  }
  if (
    !validator.isMobilePhone(aPhone, "en-IN") ||
    !validator.isMobilePhone(phone, "en-IN") ||
    aPhone.length > 10
  ) {
    return res.status(400).json("Please enter a valid Phone Number");
  } else if (aPhone === user.phone) {
    return res.status(400).json("Please provide a alternate phone");
  }
  let regex = new RegExp(["^", email, "$"].join(""), "i");
  const isep = await Driver.findOne(
    {
      $or: [
        { phone: aPhone },
        { aPhone: aPhone },
        { phone: phone },
        { aPhone: phone },
        { email: regex },
      ],
    },
    { phone: 1, aPhone: 1, email: 1, _id: 0 }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data from server");
      return "block";
    });
  if (isep === "block") {
    return;
  }
  if (isep) {
    if (isep.email === email) {
      return res.status(400).json("email already exists");
    } else if (isep.aPhone === phone || isep.phone === phone) {
      return res.status(400).json("Phone Number already exists");
    } else if (isep.aPhone === aPhone || isep.phone === aPhone) {
      return res.status(400).json("Alternate phone number already exists");
    }
  }
  const stats = await Stats.findOne({}, { driver: 1, _id: 0 })
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
  const drid = "driver-".concat(stats.driver.count + 100001);
  if (
    !fs.existsSync(
      path.join(__dirname, `../public/privateimages/driver/${drid}`)
    )
  ) {
    fs.mkdirSync(
      path.join(__dirname, `../public/privateimages/driver/${drid}`)
    );
  }
  // === === === uploading images to server === === === //
  const date = new Date().getTime();
  let aadn = "aadn".concat(user.email.slice(0, 3), date);
  let prfln = "prfln".concat(user.email.slice(0, 4), date);
  let dln = "dln".concat(user.email.slice(0, 5), date);
  const uploadimage = (imagedata, name, paths) => {
    var matches = imagedata.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
      response = {};

    if (!matches || matches.length !== 3) {
      return { result: false, message: "Invalid image data" };
    }

    response.type = matches[1];
    response.data = Buffer.from(matches[2], "base64");
    let decodedImg = response;
    let imageBuffer = decodedImg.data;
    let type = decodedImg.type;
    let extension = mime.extension(type);
    if (extension !== "jpeg") {
      return { result: false, message: "Please provide a jpeg file only" };
    }
    let fileName = `${name}.` + extension;
    fs.writeFileSync(
      path.join(__dirname, paths, fileName),
      imageBuffer,
      "utf8"
    );
    return {
      result: true,
      message: "successfully uploaded",
      name: fileName,
    };
  };
  const aadhaarupload = uploadimage(
    aadhaarimg,
    aadn,
    `../public/privateimages/driver/${drid}/`
  );
  if (!aadhaarupload.result) {
    return res.status(400).json(aadhaarupload.message);
  }
  const profileupload = uploadimage(
    profileimg,
    prfln,
    `../public/privateimages/driver/${drid}/`
  );
  if (!profileupload.result) {
    return res.status(400).json(profileupload.result);
  }
  const dlupload = uploadimage(
    dlimg,
    dln,
    `../public/privateimages/driver/${drid}`
  );
  if (!dlupload.result) {
    return res.status(400).json(dlupload.message);
  }

  const nwdriver = new Driver({
    driverid: drid,
    firstName,
    lastName,
    email,
    phone,
    aPhone,
    verification: {
      request: false,
      status: "Document submitted",
      isverified: false,
    },
    Profile: profileupload.name,
    Date: new Date().getTime(),
    Doc: {
      Aadhaar: {
        Number: aadhaarNumber,
        Verify: false,
        Link: aadhaarupload.name,
      },
      Drivinglicense: {
        Number: dlNumber,
        Verify: false,
        Link: dlupload.name,
        Validity: dlValidity,
      },
    },
    Credentials: false,
    operatedby: user.operatorid,
    approved: false,
    status: "Active",
    faultin: { basc: false, prfl: false, aadh: false, dl: false },
  });
  const result = await nwdriver
    .save()
    .then((res) => {
      return true;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (result === "block") {
    return;
  }
  if (result) {
    const statup = await Stats.updateOne(
      {},
      { "driver.count": stats.driver.count + 1 }
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
    if (statup.modifiedCount < 1) {
      return res.status(500).json("Some error occured");
    }
    return res
      .status(201)
      .json("Document has been submitted we'll keep you updated");
  } else {
    return res
      .status(500)
      .json("Can't complete your request please contact support");
  }
};

// === === === my Drivers === === === //

exports.partner_mydriver = async (req, res) => {
  let user = req.user;
  const mydrvr = await Driver.find(
    { operatedby: user.operatorid },
    {
      password: 0,
      cPassword: 0,
      tokens: 0,
      "Doc.Aadhaar.Link": 0,
      "Doc.Drivinglicense.Link": 0,
      _id: 0,
    }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data ");
      return "block";
    });
  if (mydrvr === "block") {
    return;
  }
  if (mydrvr) {
    return res.status(200).json(mydrvr);
  } else {
    return res.status(400).json("No driver found");
  }
};

// === === === driver history === === === //

exports.driver_driverhistory = async (req, res) => {
  const user = req.user;
  const { driverid } = req.body;
  if (
    !driverid ||
    typeof driverid !== "string" ||
    driverid.slice(0, 7) !== "driver-" ||
    isNaN(driverid.split("-")[1]) ||
    driverid.split("-")[1] * 1 < 100001
  ) {
    return res.status(400).json("Invalid request");
  }
  const booking = await Booking.find(
    {
      "assignedto.operatorid": user.operatorid,
      bookingstatus: { $in: ["completed", "cancelled"] },
      status: { $in: ["completed", "cancelled"] },
      "driverinfo.driverid": driverid,
    },
    {
      _id: 0,
      bookingid: 1,
      sourcecity: 1,
      endcity: 1,
      bookingstatus: 1,
      bookingtype: 1,
      outstation: 1,
      pickupdate: 1,
      "billing.oprtramt": 1,
      oprtramt: 1,
    }
  )
    .sort({ _id: -1 })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (booking === "block") {
    return;
  }
  if (booking) {
    return res.status(200).json(booking);
  } else {
    return res.status(400).json("falied to load the history");
  }
};

// === === === update driver === === === //

exports.partner_updatedriver = async (req, res) => {
  const user = req.user;
  const { driverid, status, data } = req.body;
  if (
    !driverid ||
    typeof driverid !== "string" ||
    driverid.slice(0, 7) !== "driver-" ||
    isNaN(driverid.split("-")[1]) ||
    driverid.split("-")[1] * 1 < 100001
  ) {
    return res.status(400).json("Invalid request");
  }
  const driver = await Driver.findOne({ driverid, operatedby: user.operatorid })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (driver === "block") {
    return;
  }
  if (!driver) {
    return res.status(422).json("Driver not found in your inventory");
  }
  if (driver.verification.isverified) {
    if (!status) {
      return res.status(400).json("Invalid Request");
    }
    const update = await Driver.updateOne({ driverid }, { status })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("falied to fetch data");
        return "block";
      });
    if (update === "block") {
      return;
    }
    if (update.modifiedCount > 0) {
      return res.status(201).json("Status updated successfully");
    } else {
      return res.status(400).json("failed to update data");
    }
  } else {
    if (!driver.verification.request) {
      return res.status(400).json("Invalid request");
    }
    if (
      !fs.existsSync(
        path.join(__dirname, `../public/privateimages/driver/${driverid}`)
      )
    ) {
      fs.mkdirSync(
        path.join(__dirname, `../public/privateimages/driver/${driverid}`)
      );
    }
    const uploadimage = (imagedata, name, paths) => {
      var matches = imagedata.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
        response = {};

      if (!matches || matches.length !== 3) {
        return { result: false, message: "Invalid image data" };
      }

      response.type = matches[1];
      response.data = Buffer.from(matches[2], "base64");
      let decodedImg = response;
      let imageBuffer = decodedImg.data;
      let type = decodedImg.type;
      let fileName = name;
      fs.writeFileSync(
        path.join(__dirname, paths, fileName),
        imageBuffer,
        "utf8"
      );
      return { result: true, message: "successfully uploaded", name: fileName };
    };
    let ud = {};
    let Doc = driver.Doc;
    let faultin = driver.faultin;
    if (driver.faultin.prfl) {
      const { profileimg } = data;
      if (!profileimg || typeof profileimg !== "string") {
        return res.status(400).json("please fill all the fields");
      }
      const profileupload = uploadimage(
        profileimg,
        driver.Profile,
        `../public/privateimages/driver/${driverid}/`
      );
      faultin.prfl = false;
    }
    if (driver.faultin.basc) {
      if (
        !data.firstName ||
        !data.lastName ||
        !data.email ||
        !data.phone ||
        !data.aPhone ||
        typeof data.firstName !== "string" ||
        typeof data.lastName !== "string" ||
        typeof data.phone !== "string" ||
        typeof data.aPhone !== "string" ||
        typeof data.email !== "string"
      ) {
        return res.status(400).json("please fill all the fields");
      }
      if (typeof data.email !== "string" || !validator.isEmail(email)) {
        return res.status(400).json("invalid email");
      } else if (
        validator.isMobilePhone(data.phone, "en_IN") ||
        data.phone.length > 10
      ) {
        return res.status(400).json("invalid phone number");
      } else if (
        validator.isMobilePhone(data.aPhone, "en-IN") ||
        data.aPhone.length > 10
      ) {
        return res.status(400).json("invalid Alternate Phone number");
      }
      let regex = new RegExp(["^", email, "$"].join(""), "i");
      const isep = await Driver.findOne(
        {
          $or: [
            { phone: aPhone },
            { aPhone: aPhone },
            { phone: phone },
            { aPhone: phone },
            { email: regex },
          ],
          $and: [{ driverid: { $ne: driverid }, status: { $ne: "Dispute" } }],
        },
        {
          phone: 1,
          aPhone: 1,
          email: 1,
          _id: 0,
        }
      )
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data from server");
          return "block";
        });
      if (isep === "block") {
        return;
      }
      if (isep) {
        if (isep.email === email) {
          return res.status(400).json("email already exists");
        } else if (isep.aPhone === phone || isep.phone === phone) {
          return res.status(400).json("Phone Number already exists");
        } else if (isep.aPhone === aPhone || isep.phone === aPhone) {
          return res.status(400).json("Alternate phone number already exists");
        }
      }
      ud.firstName = data.firstName;
      ud.lastName = data.lastName;
      ud.email = data.email;
      ud.phone = data.phone;
      ud.aPhone = data.aPhone;
      faultin.basc = false;
    }
    if (driver.faultin.aadh) {
      if (!data.aadhaarNumber || !data.aadhaarimg) {
        return res.status(400).json("please fill all the fields");
      }
      if (
        typeof data.aadhaarNumber !== "string" ||
        typeof data.aadhaarimg !== "string"
      ) {
        return res.status(400).json("invalid data type");
      }
      const aadhaarupload = uploadimage(
        data.aadhaarimg,
        driver.Doc.Aadhaar.Link,
        `../public/privateimages/driver/${driverid}/`
      );
      Doc.Aadhaar.Number = data.aadhaarNumber;
      ud.Doc = Doc;
      faultin.aadh = false;
    }
    if (driver.faultin.dl) {
      if (!data.dlimg || !data.dlNumber || !data.dlValidity) {
        return res.status(400).json("please fill all the fields");
      }
      if (
        typeof data.dlNumber !== "string" ||
        typeof data.dlimg !== "string" ||
        typeof data.dlValidity !== "number"
      ) {
        return res.status(500).json("invalid data type");
      }
      const isdl = () => {
        // const regex = /^([A-Z]{2})(\d{2}|\d{3})[a-zA-Z]{0,1}(\d{4})(\d{7})$/gm;
        const str = data.dlNumber;
        // let m;
        // let matchs = 0;
        // while ((m = regex.exec(str)) !== null) {
        //   if (m.index === regex.lastIndex) {
        //     regex.lastIndex++;
        //   }
        //   m.forEach((match, groupIndex) => {
        //     matchs++;
        //   });
        // }
        if (str.length > 20) {
          return false;
        } else {
          return true;
        }
      };
      if (!isdl()) {
        return res.status(422).json("Please enter valid dl number");
      }
      const dlupload = uploadimage(
        data.dlimg,
        driver.Doc.Drivinglicense.Link,
        `../public/privateimages/driver/${driverid}/`
      );
      Doc.Drivinglicense.Number = data.dlNumber;
      Doc.Drivinglicense.Validity = data.dlValidity;
      ud.Doc = Doc;
      faultin.dl = false;
    }
    ud.faultin = faultin;
    ud = { ...ud, "verification.request": false };
    const update = await Driver.updateOne({ driverid }, ud)
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
      return res.status(201).json("Updated successfully");
    } else {
      return res.status(400).json("Some error occured");
    }
  }
};

// === === === Adding car === === === //
const Cars = require("../models/partner/Cars");
const Cabmodel = require("../models/cabmodel");
const { count } = require("console");
const { type } = require("os");
const { off } = require("process");
exports.partner_addcar = async (req, res) => {
  const {
    carNumber,
    cab_id,
    regyear,
    policyNo,
    policyValidity,
    permitType,
    permitValidity,
    vehicleimg,
    rcimg,
    policyimg,
    permitimg,
  } = req.body;
  const user = req.user;
  if (!user.verification.isverified) {
    return res.status(400).json("you are not verifed cannot add any car");
  }
  if (
    !carNumber ||
    !cab_id ||
    !regyear ||
    !policyNo ||
    !policyValidity ||
    !permitType ||
    !permitValidity ||
    !vehicleimg ||
    !rcimg ||
    !policyimg ||
    !permitimg
  ) {
    return res.json("please fill all the fields");
  } else if (
    typeof carNumber !== "string" ||
    typeof cab_id !== "string" ||
    typeof regyear !== "string" ||
    typeof policyNo !== "string" ||
    typeof permitType !== "string" ||
    typeof permitimg !== "string" ||
    typeof vehicleimg !== "string" ||
    typeof rcimg !== "string" ||
    typeof policyimg !== "string" ||
    typeof policyValidity !== "number" ||
    typeof permitValidity !== "number"
  ) {
    return res.status(400).json("Invalid data type");
  }
  let dt = new Date().getTime();
  if (dt > policyValidity || dt > permitValidity) {
    return res.status(400).json("Invalid request");
  }

  // === === === fetching car model === === == ..
  const cabmodel = await Cabmodel.findOne({ cab_id })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data from server");
      return "block";
    });
  if (cabmodel === "block") {
    return;
  }
  if (!cabmodel) {
    return res.status(400).json("Invalid request");
  }

  // === === === uploading images to server === === === //
  const stats = await Stats.findOne({}, { car: 1, _id: 0 })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data from server");
      return "block";
    });
  if (stats === "block") {
    return;
  }
  const carid = stats.car.count + 100001;
  let vhcln = "vhcln-".concat(carid);
  let rcn = "prfln-".concat(carid);
  let permitn = "permitn-".concat(carid);
  let policyn = "policyn-".concat(carid);
  if (
    !fs.existsSync(
      path.join(
        __dirname,
        `../public/privateimages/car/${"car-".concat(carid)}`
      )
    )
  ) {
    fs.mkdirSync(
      path.join(
        __dirname,
        `../public/privateimages/car/${"car-".concat(carid)}`
      )
    );
  }
  const uploadimage = (imagedata, name, paths) => {
    var matches = imagedata.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
      response = {};

    if (!matches || matches.length !== 3) {
      return { result: false, message: "Invalid image data" };
    }

    response.type = matches[1];
    response.data = Buffer.from(matches[2], "base64");
    let decodedImg = response;
    let imageBuffer = decodedImg.data;
    let type = decodedImg.type;
    let extension = mime.extension(type);
    if (extension !== "jpeg") {
      return { result: false, message: "Please provide a jpeg file only" };
    }
    let fileName = `${name}.` + extension;
    fs.writeFileSync(
      path.join(__dirname, paths, fileName),
      imageBuffer,
      "utf8"
    );
    return { result: true, message: "successfully uploaded", name: fileName };
  };
  const vhclupload = uploadimage(
    vehicleimg,
    vhcln,
    `../public/privateimages/car/${"car-".concat(carid)}`
  );
  if (!vhclupload.result) {
    return res.status(400).json(vhclupload.message);
  }
  const rcupload = uploadimage(
    rcimg,
    rcn,
    `../public/privateimages/car/${"car-".concat(carid)}`
  );
  if (!rcupload.result) {
    return res.status(400).json(rcupload.result);
  }
  const policyupload = uploadimage(
    policyimg,
    policyn,
    `../public/privateimages/car/${"car-".concat(carid)}`
  );
  if (!policyupload.result) {
    return res.status(400).json(policyupload.message);
  }
  const permitupload = uploadimage(
    permitimg,
    permitn,
    `../public/privateimages/car/${"car-".concat(carid)}`
  );
  if (!permitupload.result) {
    return res.status(400).json(permitupload.message);
  }
  const nwcar = new Cars({
    cabid: "car-".concat(carid),
    carNumber,
    name: cabmodel.name,
    cab_id: cabmodel.cab_id,
    group_id: cabmodel.group_id,
    category: cabmodel.category,
    carLink: vhclupload.name,
    regyear,
    rcLink: rcupload.name,
    policyNo,
    policyValidity,
    policyLink: policyupload.name,
    permitType,
    permitValidity,
    verification: {
      request: false,
      status: "Document Submitted",
      isverified: false,
    },
    permitLink: permitupload.name,
    operatedby: user.operatorid,
    status: "Active",
    faultin: {
      car: false,
      rc: false,
      policy: false,
      permit: false,
    },
  });
  const result = await nwcar
    .save()
    .then((res) => {
      return true;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data from server");
      return "block";
    });
  if (result === "block") {
    return;
  }
  if (result) {
    const statup = await Stats.updateOne(
      {},
      { "car.count": stats.car.count + 1 }
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
    if (statup.modifiedCount < 1) {
      return res.status("some error occured");
    }
    return res
      .status(201)
      .json("Document has been submitted we'll keep you updated");
  } else {
    return res
      .status(400)
      .json("Can't complete your request please contact support");
  }
};

// === === === my cars === === === //

exports.partner_mycars = async (req, res) => {
  let user = req.user;
  const mycar = await Cars.find(
    { operatedby: user.operatorid },
    {
      policyLink: 0,
      carLink: 0,
      permitLink: 0,
      rcLink: 0,
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
  if (mycar === "block") {
    return;
  }
  if (mycar) {
    return res.status(200).json(mycar);
  } else {
    return res.status(400).json("No Car found");
  }
};

// === === === car history === === === //

exports.partner_carhistory = async (req, res) => {
  const user = req.user;
  const { cabid } = req.body;
  if (!cabid) {
    return res.status(400).json("Invalid request");
  }
  const iscar = await Cars.findOne({ cabid })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (iscar === "block") {
    return;
  }
  if (!iscar) {
    return res.status(400).json("No cab found");
  } else if (iscar.operatedby !== user.operatorid) {
    return res.status(400).json("You dont have access to this information");
  }
  const booking = await Booking.find(
    {
      "assignedto.operatorid": user.operatorid,
      bookingstatus: { $in: ["completed", "cancelled"] },
      status: { $in: ["completed", "cancelled"] },
      "cabinfo.cabid": cabid,
    },
    {
      _id: 0,
      bookingid: 1,
      sourcecity: 1,
      endcity: 1,
      bookingstatus: 1,
      bookingtype: 1,
      outstation: 1,
      pickupdate: 1,
      "billing.oprtramt": 1,
      oprtramt: 1,
    }
  )
    .sort({ _id: -1 })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (booking === "block") {
    return;
  }
  if (booking) {
    return res.status(200).json(booking);
  } else {
    return res.status(400).json("falied to load the history");
  }
};

// === === === update car === === === //

exports.partner_updatecar = async (req, res) => {
  const user = req.user;
  const { cabid, status, data } = req.body;
  if (!cabid) {
    return res.status(422).json("Invalid request");
  }
  const cab = await Cars.findOne({ cabid })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (cab === "block") {
    return;
  }
  if (!cab || cab.operatedby !== user.operatorid) {
    return res.status(400).json("Car not found in your inventory");
  }
  if (cab.verification.isverified) {
    if (!status) {
      return res.status(400).json("Invalid request");
    }
    const update = await Cars.updateOne({ cabid }, { status: status })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("Failed to update status");
        return "block";
      });
    if (update === "block") {
      return;
    }
    if (update.modifiedCount > 0) {
      return res.status(201).json("Status updated successfully");
    } else {
      return res.status(400).json("Failed to update status");
    }
  } else {
    if (
      !fs.existsSync(
        path.join(__dirname, `../public/privateimages/car/${cabid}`)
      )
    ) {
      fs.mkdirSync(
        path.join(__dirname, `../public/privateimages/car/${cabid}`)
      );
    }
    const uploadimage = (imagedata, name, paths) => {
      var matches = imagedata.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
        response = {};

      if (!matches || matches.length !== 3) {
        return { result: false, message: "Invalid image data" };
      }

      response.type = matches[1];
      response.data = Buffer.from(matches[2], "base64");
      let decodedImg = response;
      let imageBuffer = decodedImg.data;
      let type = decodedImg.type;
      let fileName = name;
      fs.writeFileSync(
        path.join(__dirname, paths, fileName),
        imageBuffer,
        "utf8"
      );
      return { result: true, message: "successfully uploaded", name: fileName };
    };
    let ud = {};
    let faultin = cab.faultin;
    if (cab.faultin.rc) {
      if (!data.regyear || !data.rcimg) {
        return res.status(422).json("please fill all the fields");
      } else if (
        typeof data.regyear !== "string" ||
        typeof data.rcimg !== "string"
      ) {
        return res.status(400).json("invalid data type");
      }
      let rcupload = uploadimage(
        data.rcimg,
        cab.rcLink,
        `../public/privateimages/car/${cabid}`
      );
      ud.regyear = data.regyear;
      faultin.rc = false;
    }
    if (cab.faultin.car) {
      if (!data.carNumber || !data.cab_id || !data.vehicleimg) {
        return res.status(422).json("please fill all the fields");
      } else if (
        typeof data.carNumber !== "string" ||
        typeof data.cab_id !== "string" ||
        typeof data.vehicleimg !== "string"
      ) {
        return res.status(400).json("invalid data type");
      }
      let vhclupload = uploadimage(
        data.vehicleimg,
        cab.carLink,
        `../public/privateimages/car/${cabid}`
      );
      ud.carNumber = data.carNumber;
      ud.cab_id = data.cab_id;
      faultin.car = false;
    }
    if (cab.faultin.policy) {
      if (!data.policyNo || !data.policyValidity || !data.policyimg) {
        return res.status(422).json("please fill all the fields");
      }
      if (
        typeof data.policyNo !== "string" ||
        typeof data.policyValidity !== "number" ||
        typeof data.policyimg !== "string"
      ) {
        return res.status(400).json("invalid data type");
      }
      const policyupload = uploadimage(
        data.policyimg,
        cab.policyLink,
        `../public/privateimages/car/${cabid}`
      );
      ud.policyNo = data.policyNo;
      ud.policyValidity = data.policyValidity;
      faultin.policy = false;
    }
    if (cab.faultin.permit) {
      if (!data.permitType || !data.permitimg || !data.permitValidity) {
        return res.status(422).json("please fill all the fields");
      }
      if (
        typeof data.permitType !== "string" ||
        typeof data.permitimg !== "string" ||
        typeof data.permitValidity !== "number" ||
        !["State", "National"].some((itm) => data.permitType === itm)
      ) {
        return res.status(400).json("invalid data type");
      }
      const permitupload = uploadimage(
        data.permitimg,
        cab.permitLink,
        `../public/privateimages/car/${cabid}`
      );
      ud.permitType = data.permitType;
      ud.permitValidity = data.permitValidity;
      faultin.permit = false;
    }
    ud.faultin = faultin;
    ud = { ...ud, "verification.request": false };
    const update = await Cars.updateOne({ cabid }, ud)
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.satus(500).json("failed to fetch data");
        return "block";
      });
    if (update === "block") {
      return;
    }

    if (update.modifiedCount > 0) {
      return res.status(201).json("Update successfull");
    } else {
      return res.status(400).josn("failed to update");
    }
  }
};

// === === === cab models === === === //

exports.partner_getmodels = async (req, res) => {
  const result = await Cabmodel.find({}, { _id: 0 })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (result === "block") {
    return;
  }
  if (result) {
    return res.json(result);
  } else {
    return res.status(400).json("failed to fetch data");
  }
};

// === === === partner bidding === === === //

exports.partner_bid = async (req, res) => {
  const user = req.user;
  const { amt, bookingid } = req.body;
  if (!user.verification.isverified) {
    return res.status(422).json("verification pending can't make the bid");
  } else if (!amt || !bookingid) {
    return res.status(400).json("Invalid request");
  } else if (typeof amt !== "string" || typeof bookingid !== "string") {
    return res.status(400).json("Invalid data type");
  }
  let booking = await Booking.findOne({
    bookingid: bookingid,
    status: "upcoming",
    bookingstatus: "confirmed",
    "assignedto.assigned": { $ne: true },
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (booking === "block") {
    return;
  }
  if (!booking) {
    return res.status(400).json("Booking is maybe already assigned");
  }
  if (!Number.isInteger(amt * 1)) {
    return res.status(422).json(`Invalid bid`);
  } else if (amt * 1 < booking.tripinfo.minchrg) {
    return res
      .status(422)
      .json(`you can not bid less then ₹${booking.tripinfo.minchrg}`);
  } else if (amt * 1 > booking.oprtramt) {
    return res
      .status(422)
      .json(`you can not bid more then ₹${booking.oprtramt}`);
  }
  let car;
  if (booking.tripinfo.equivalent.isequi) {
    car = await Cars.findOne({
      operatedby: user.operatorid,
      category: {
        $in: [...booking.tripinfo.upvalid, booking.tripinfo.category],
      },
      "verification.isverified": true,
    })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (car === "block") {
      return;
    }
  } else {
    car = await Cars.findOne({
      operatedby: user.operatorid,
      $or: [
        { cab_id: booking.tripinfo.cab_id },
        {
          category: {
            $in: [...booking.tripinfo.upvalid],
          },
        },
      ],
      "verification.isverified": true,
    })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (car === "block") {
      return;
    }
  }
  if (!car) {
    return res
      .status(400)
      .json("You don't have any verified cab required for this booking");
  }
  let driver = await Driver.findOne({
    operatedby: user.operatorid,
    "verification.isverified": true,
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (driver === "block") {
    return;
  }
  if (!driver) {
    return res.status(400).json("You don't have any verified Driver");
  }
  let bids = booking.bids.filter((bid) => bid.operatorid !== user.operatorid);
  bids.push({
    amount: amt * 1,
    operatorid: user.operatorid,
    phone: user.phone,
    aPhone: user.aPhone,
    name: user.firstName,
    email: user.email,
  });

  let update = await Booking.updateOne(
    {
      bookingid: booking.bookingid,
      status: "upcoming",
      bookingstatus: "confirmed",
      "assignedto.assigned": { $ne: true },
    },
    { bids }
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
    return res.json("Bid posted Successfully");
  } else {
    return res.json("Cant create the bid please contact support");
  }
};

// === === === Earnings === === === //

exports.partner_earnings = async (req, res) => {
  const user = req.user;
  const { from, to } = req.body;
  const Dat = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
    0,
    0,
    0,
    0
  ).getTime();
  if (to && !from) {
    return res.status(400).json("invalid range selected");
  }
  if (from && to && (typeof from !== "number" || typeof to !== "number")) {
    return res.status(400).json("invalid data type");
  }
  if (from && typeof from !== "number") {
    return res.status(400).json("invalid data type");
  }
  const earning = await Booking.find(
    from && to
      ? {
          bookingstatus: "completed",
          "assignedto.operatorid": user.operatorid,
          $and: [{ pickupdate: { $gte: from } }, { pickupdate: { $lte: to } }],
        }
      : from
      ? {
          bookingstatus: "completed",
          "assignedto.operatorid": user.operatorid,
          pickupdate: { $gte: from },
        }
      : {
          bookingstatus: "completed",
          "assignedto.operatorid": user.operatorid,
          pickupdate: { $gte: Dat },
        },
    {
      _id: 0,
      bookingid: 1,
      pickupdate: 1,
      payable: 1,
      advance: 1,
      assignedto: 1,
      billing: 1,
    }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (earning === "block") {
    return;
  }
  const data = {
    range: { from, to },
    bkng: {
      total: 0,
      billed: 0,
      unbilled: 0,
      earning: 0,
    },
    ary: earning,
  };
  earning.map((itm) => {
    data.bkng.total = data.bkng.total + 1;
    data.bkng.earning = data.bkng.earning + itm.billing.oprtramt;
    if (itm.billing.billed) {
      data.bkng.billed = data.bkng.billed + 1;
    } else {
      data.bkng.unbilled = data.bkng.unbilled + 1;
    }
  });

  return res.json(data);
};

// === === === partner trip log === === === //

exports.partner_triplog = async (req, res) => {
  const user = req.user;
  const { type, from, to } = req.body;
  if (
    !type ||
    typeof type !== "string" ||
    !["Upcoming", "Ongoing", "History"].some((itm) => itm === type)
  ) {
    return res.status(400).json("invalid request");
  }
  let data;
  if (type === "Upcoming") {
    data = {
      "assignedto.operatorid": user.operatorid,
      bookingstatus: "assigned",
      status: "upcoming",
    };
  } else if (type === "Ongoing") {
    data = {
      "assignedto.operatorid": user.operatorid,
      bookingstatus: "ongoing",
      status: "upcoming",
    };
  } else if (type === "History") {
    if (!from && !to) {
      const dat = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
        0,
        0,
        0,
        0
      ).getTime();
      data = {
        "assignedto.operatorid": user.operatorid,
        bookingstatus: { $in: ["completed", "cancelled"] },
        status: { $in: ["completed", "cancelled"] },
        pickupdate: { $gte: dat },
      };
    } else if (from && to) {
      if (
        typeof from !== "number" ||
        typeof to !== "number" ||
        isNaN(from) ||
        isNaN(to) ||
        from > to
      ) {
        return res.status(400).json("Please select a valid range");
      }
      data = {
        "assignedto.operatorid": user.operatorid,
        bookingstatus: { $in: ["completed", "cancelled"] },
        status: { $in: ["completed", "cancelled"] },
        $and: [
          { pickupdate: { $gte: from } },
          { pickupdate: { $lte: to + 86399999 } },
        ],
      };
    } else if (from) {
      if (isNaN(from)) {
        return res.status(400).json("Please select a valid range");
      }
      data = {
        "assignedto.operatorid": user.operatorid,
        bookingstatus: { $in: ["completed", "cancelled"] },
        status: { $in: ["completed", "cancelled"] },
        pickupdate: { $gte: from },
      };
    } else {
      return res.status(400).json("Please select a valid range");
    }
  } else {
    return res.status(422).json("invalid request");
  }
  // remove bids and operator data from coustumer routes
  const log = await Booking.find(
    data,
    type === "History"
      ? {
          orderid: 0,
          "sourcecity.pickupadress": 0,
          bookingdate: 0,
          approvalby: 0,
          verificationkey: 0,
          email: 0,
          phone: 0,
          advanceoptn: 0,
          cancelreason: 0,
          "tripinfo._id": 0,
          bids: 0,
          _id: 0,
          gst: 0,
          email: 0,
        }
      : {
          orderid: 0,
          "sourcecity.pickupadress": 0,
          bookingdate: 0,
          approvalby: 0,
          verificationkey: 0,
          advanceoptn: 0,
          cancelreason: 0,
          "tripinfo._id": 0,
          bids: 0,
          _id: 0,
          gst: 0,
          email: 0,
        }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (log === "block") {
    return;
  }
  let date = new Date().getTime();

  if (log) {
    let filtered = [];
    if (type !== "History") {
      log.map((itm) => {
        if (itm.pickupat - date >= 86400000) {
          filtered.push({
            sourcecity: {
              from: itm.sourcecity.from,
              fromcode: itm.sourcecity.fromcode,
            },
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
            assignedto: itm.assignedto,
            cabinfo: itm.cabinfo,
            driverinfo: itm.driverinfo,
          });
        } else {
          filtered.push(itm);
        }
      });
    }
    return res.json({
      result: "success",
      ary: type === "History" ? log : filtered,
    });
  } else {
    return res.status(400).json("failed to load");
  }
};

// === === === Assign Driver and cab === === === //

exports.partner_assigndc = async (req, res) => {
  const user = req.user;
  const { bookingid, car, driver } = req.body;
  if (!bookingid || !car || !driver) {
    return res.status(400).json("Invalid request");
  }
  if (
    typeof bookingid !== "string" ||
    typeof car !== "string" ||
    typeof driver !== "string"
  ) {
    return res.status(400).json("Invalid data type");
  }
  const booking = await Booking.findOne({
    bookingid,
    "assignedto.operatorid": user.operatorid,
    bookingstatus: "assigned",
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (booking === "block") {
    return;
  }
  if (!booking) {
    return res.status(400).json("No such booking is assigned to you");
  }
  let data = {};
  if (booking.cabinfo.cabid !== car) {
    const cab = await Cars.findOne({ cabid: car, operatedby: user.operatorid })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (cab === "block") {
      return;
    }
    if (!cab) {
      return res.status(400).json("car not found in your fleet");
    }
    if (booking.tripinfo.equivalent.isequi) {
      if (
        ![...booking.tripinfo.upvalid, booking.tripinfo.category].some(
          (itm) => itm === cab.category
        )
      ) {
        return res
          .status(400)
          .json(
            `please select ${booking.tripinfo.name} segment or a upper segment car`
          );
      }
    } else {
      if (cab.cab_id !== booking.tripinfo.cab_id) {
        if (
          ![...booking.tripinfo.upvalid].some((itm) => itm === cab.category)
        ) {
          return res
            .status(400)
            .json(
              `please select ${booking.tripinfo.name} or upper segment car`
            );
        }
      }
    }
    if (!cab.verification.isverified) {
      return res.status(400).json("selected cab is not verified");
    }
    if (cab.status !== "Active") {
      return res.status(400).json("please change the car status to (Active)");
    }
    data.cabinfo = {
      assigned: true,
      cabid: cab.cabid,
      name: cab.name,
      carNumber: cab.carNumber,
      category: cab.category,
    };
  }
  if (booking.driverinfo.driverid !== driver) {
    const isdriver = await Driver.findOne({
      driverid: driver,
      operatedby: user.operatorid,
    })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (isdriver === "block") {
      return;
    }
    if (!isdriver) {
      return res.status(400).json("No such driver attached with you");
    }
    if (!isdriver.verification.isverified) {
      return res.status(400).json("driver is not verified");
    }
    if (isdriver.status !== "Active") {
      return res
        .status(400)
        .json("please change the driver status to (Active)");
    }
    data.driverinfo = {
      assigned: true,
      driverid: isdriver.driverid,
      name: isdriver.firstName,
      phone: isdriver.phone,
      aPhone: isdriver.aPhone,
    };
  }
  const update = await Booking.updateOne(
    {
      bookingid,
      "assignedto.operatorid": user.operatorid,
      bookingstatus: "assigned",
    },
    data
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
    return res.status(201).json("Assigned Successfully");
  } else {
    res.status(500).json("Can't assign please contact suport");
  }
};

// === === === get cab and drivers === === === //

exports.partner_getdc = async (req, res) => {
  const user = req.user;
  const driver = await Driver.find(
    {
      operatedby: user.operatorid,
      "verification.isverified": true,
    },
    { _id: 0, driverid: 1, firstName: 1, lastName: 1, status: 1 }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (driver === "block") {
    return;
  }
  if (driver && driver.length <= 0) {
    return res.status(400).json("You don't have any verified driver");
  }
  const car = await Cars.find(
    {
      operatedby: user.operatorid,
      "verification.isverified": true,
    },
    {
      cabid: 1,
      carNumber: 1,
      name: 1,
      cab_id: 1,
      category: 1,
      group_id: 1,
      permitType: 1,
      status: 1,
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
  if (car === "block") {
    return;
  }
  if (car && car.length <= 0) {
    return res.status(400).json("You don't have any verified cab");
  }
  const data = { result: true, cars: car, drivers: driver };
  res.json(data);
};

// === === === driver controller === === === //

exports.driver_login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "please fill all the fields" });
  }
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json("invalid data type");
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  let regex = new RegExp(["^", email, "$"].join(""), "i");
  const user = await Driver.findOne({
    email: regex,
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
    return res.status(401).json({ error: "Your email or password is wrong" });
  } else {
    if (!user.approved) {
      return res.status(200).json({
        result: false,
        message:
          "Your profile is not approved yet please contact our support team",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
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
        .cookie("drivertok", token, {
          path: "/driver",
          expires: new Date(Date.now() + 432000000),
          httpOnly: true,
        })
        .status(200)
        .json({
          result: true,
          message: "login successful",
        });
    } else {
      return res.status(401).json({ error: "Your email or password is wrong" });
    }
  }
};

// ==== ==== ==== autologin ==== ==== ==== //

exports.driver_autolog = (req, res) => {
  const user = req.user;
  let data = {
    firstName: req.user.firstName,
    email: req.user.email,
  };
  res.send(data);
};

// === === === driver logout === === === //

exports.driver_logout = async (req, res) => {
  const user = req.user;
  const tokens = user.tokens;
  const filtered = tokens.filter((itm) => {
    return itm.token !== req.token;
  });
  const update = await Driver.updateOne(
    { email: user.email, operatedby: user.operatedby },
    { tokens: filtered }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.clearCookie("drivertok", { path: "/driver" }).json("Logged Out");
      return "block";
    });
  if (update === "block") {
    return;
  }
  return res.clearCookie("drivertok", { path: "/driver" }).json("Logged Out");
};

// === === === change password === === === //

exports.driver_changepass = async (req, res) => {
  const user = req.user;
  const { oldpass, newpass, cnfrmpass } = req.body;
  if (!oldpass || !newpass || !cnfrmpass) {
    return res.status(422).json("please fill all the fields");
  }
  if (newpass !== cnfrmpass) {
    return res.status(422).json("password and confirm password do not match");
  }
  if (newpass.length < 8) {
    return res.status(422).json("Password mush have 8 character's");
  }
  const isMatch = await bcrypt.compare(oldpass, user.password);
  if (!isMatch) {
    return res.status(400).json("invalid old password");
  }
  if (oldpass == newpass) {
    return res.status(422).json("old and new password are same");
  }
  const tokens = user.tokens;
  const filtered = tokens.filter((itm) => {
    return itm.token == req.token;
  });
  const upd = await Driver.updateOne(
    { email: user.email, operatedby: user.operatedby },
    { password: newpass, cPassword: cnfrmpass, tokens: filtered }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (upd === "block") {
    return;
  }
  if (upd.modifiedCount > 0) {
    return res.status(201).json("password changed successfully");
  } else {
    return res.status(422).json("password update failed");
  }
};

// === === === driver triplog === === === //

exports.driver_triplog = async (req, res) => {
  const user = req.user;
  const { type, from, to } = req.body;
  if (
    !type ||
    typeof type !== "string" ||
    !["Upcoming", "Ongoing", "History"].some((itm) => itm === type)
  ) {
    return res.status(400).json("invalid request");
  }
  let data;
  if (type === "Upcoming") {
    data = {
      "assignedto.operatorid": user.operatedby,
      bookingstatus: "assigned",
      status: "upcoming",
      "driverinfo.driverid": user.driverid,
    };
  } else if (type === "Ongoing") {
    data = {
      "assignedto.operatorid": user.operatedby,
      bookingstatus: "ongoing",
      status: "upcoming",
      "driverinfo.driverid": user.driverid,
    };
  } else if (type === "History") {
    if (!from && !to) {
      const dat = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
        0,
        0,
        0,
        0
      ).getTime();
      data = {
        "assignedto.operatorid": user.operatedby,
        bookingstatus: { $in: ["completed", "cancelled"] },
        status: { $in: ["completed", "cancelled"] },
        pickupdate: { $gte: dat },
        "driverinfo.driverid": user.driverid,
      };
    } else if (from && to) {
      if (
        typeof from !== "number" ||
        typeof to !== "number" ||
        isNaN(from) ||
        isNaN(to) ||
        from > to
      ) {
        return res.status(400).json("Please select a valid range");
      }
      data = {
        "assignedto.operatorid": user.operatedby,
        bookingstatus: { $in: ["completed", "cancelled"] },
        status: { $in: ["completed", "cancelled"] },
        $and: [{ pickupdate: { $gte: from } }, { pickupdate: { $lte: to } }],
        "driverinfo.driverid": user.driverid,
      };
    } else if (from) {
      if (isNaN(from)) {
        return res.status(400).json("Please select a valid range 2");
      }
      data = {
        "assignedto.operatorid": user.operatedby,
        bookingstatus: { $in: ["completed", "cancelled"] },
        status: { $in: ["completed", "cancelled"] },
        pickupdate: { $gte: from },
        "driverinfo.driverid": user.driverid,
      };
    } else {
      return res.status(400).json("Please select a valid range 3");
    }
  } else {
    return res.status(422).json("invalid request");
  }
  // remove bids and operator data from coustumer routes
  const log = await Booking.find(
    data,
    type === "History"
      ? {
          orderid: 0,
          "sourcecity.pickupadress": 0,
          bookingdate: 0,
          approvalby: 0,
          verificationkey: 0,
          email: 0,
          phone: 0,
          advanceoptn: 0,
          cancelreason: 0,
          "tripinfo._id": 0,
          bids: 0,
          _id: 0,
          email: 0,
        }
      : {
          orderid: 0,
          "sourcecity.pickupadress": 0,
          bookingdate: 0,
          approvalby: 0,
          verificationkey: 0,
          advanceoptn: 0,
          cancelreason: 0,
          "tripinfo._id": 0,
          bids: 0,
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
  if (log === "block") {
    return;
  }
  if (log) {
    let filtered = [];
    if (type !== "History") {
      let date = new Date().getTime();
      log.map((itm) => {
        if (itm.pickupat - date >= 86400000) {
          filtered.push({
            sourcecity: {
              from: itm.sourcecity.from,
              fromcode: itm.sourcecity.fromcode,
            },
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
            assignedto: itm.assignedto,
            cabinfo: itm.cabinfo,
            driverinfo: itm.driverinfo,
          });
        } else {
          filtered.push(itm);
        }
      });
    }
    return res.json({
      result: "success",
      ary: type === "History" ? log : filtered,
    });
  } else {
    return res.status(400).json("failed to load");
  }
};

// === === === request or resend otp with start reading === === === //
const axios = require("axios");
exports.driver_submitkm = async (req, res) => {
  const user = req.user;
  const { Startkm, bookingid, email, actn } = req.body;
  if (
    !bookingid ||
    !email ||
    !actn ||
    typeof bookingid !== "string" ||
    typeof email !== "string" ||
    typeof actn !== "string" ||
    !["nw", "rsnd"].some((itm) => actn === itm) ||
    !validator.isEmail(email)
  ) {
    return res.status(400).json("Invalid request");
  }
  let updt;
  let Otp;
  let Validity;
  const isbooking = await Booking.findOne({
    email,
    bookingid,
    "assignedto.operatorid": user.operatedby,
    "driverinfo.driverid": user.driverid,
    bookingstatus: "assigned",
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
  if (!isbooking) {
    return res.status(400).json("No booking found");
  }
  let generateOTP = () => {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  };
  if (isbooking.pickupat - new Date().getTime() > 1800000) {
    return res
      .status(400)
      .json("You can request OTP from 30 Minute before of pickup time");
  }
  //
  if (actn === "nw") {
    if (!Startkm || typeof Startkm !== "string" || isNaN(Startkm)) {
      return res.status(400).json("Invalid request");
    }
    Otp = generateOTP();
    Validity = new Date(new Date().getTime() + 1800000).getTime() * 1;
    updt = {
      "billing.tripstats.startkm": Startkm * 1,
      "otp.start.code": Otp,
      "otp.start.validity": Validity,
    };
  } else {
    if (!isbooking.otp.start.code) {
      return res.status(400).json("invalid request");
    }
    if (isbooking.otp.start.validity - new Date().getTime() > 300000) {
      Otp = isbooking.otp.start.code;
      updt = {
        "otp.start.code": Otp,
      };
    } else {
      Otp = generateOTP();
      Validity = new Date(new Date().getTime() + 1800000).getTime() * 1;
      updt = {
        "otp.start.code": Otp,
        "otp.start.validity": Validity,
      };
    }
  }
  const result = await Booking.updateOne(
    {
      email,
      bookingid,
      "assignedto.operatorid": user.operatedby,
      "driverinfo.driverid": user.driverid,
      bookingstatus: "assigned",
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
  if (result === "block") {
    return;
  }
  if (result.matchedCount < 1) {
    return res.status(400).json("failed to genrate otp");
  } else {
    const txtdata = JSON.stringify({
      route: "dlt",
      sender_id: "MTRACB",
      message: "143662",
      variables_values: `${isbooking.driverinfo.name}|${
        (isbooking.driverinfo.phone, isbooking.driverinfo.aPhone)
      }|${isbooking.cabinfo.name}|(${isbooking.cabinfo.carNumber})|${Otp}|30|`,
      flash: 0,
      numbers: `${isbooking.phone}`,
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
    if (txtotp.data.return) {
      return res
        .status(201)
        .json(
          "an otp has been sent to coustumer no it's also visible on coustumers dashboard"
        );
    } else {
      return res
        .status(500)
        .json("Failed to send otp please try again after some time");
    }
  }
};

// === === === verify otp and start === === === //

exports.driver_tripotpver = async (req, res) => {
  const user = req.user;
  const { code, bookingid, email } = req.body;
  if (
    !code ||
    !bookingid ||
    !email ||
    typeof code !== "string" ||
    typeof bookingid !== "string" ||
    typeof email !== "string" ||
    !validator.isEmail(email) ||
    isNaN(code)
  ) {
    return res.status(400).json("Invalid request");
  }
  let updt;
  const isbooking = await Booking.findOne({
    email,
    bookingid,
    "assignedto.operatorid": user.operatedby,
    "driverinfo.driverid": user.driverid,
    bookingstatus: "assigned",
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
  if (!isbooking) {
    return res.status(400).json("No booking found");
  }
  if (isbooking.pickupat - new Date().getTime() > 1800000) {
    return res
      .status(400)
      .json("You can start the trip from 30 Minute before of pickup time");
  }
  if (isbooking.otp.start.code !== code * 1) {
    return res.status(400).json("Invalid otp");
  } else if (isbooking.otp.start.validity < new Date().getTime()) {
    return res.status(400).json("Otp has expired");
  } else {
    updt = {
      bookingstatus: "ongoing",
      "billing.tripstats.startat": new Date().getTime(),
    };
  }
  const result = await Booking.updateOne(
    {
      email,
      bookingid,
      "assignedto.operatorid": user.operatedby,
      "driverinfo.driverid": user.driverid,
      bookingstatus: "assigned",
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
  if (result === "block") {
    return;
  }
  if (result.modifiedCount < 1) {
    return res.status(400).json("Verification Failed");
  } else {
    res.status(200).json("Trip Started");
  }
};

// === === === request or resend otp with end reading === === === //

exports.driver_submitendkm = async (req, res) => {
  const user = req.user;
  const { Endkm, bookingid, email, actn } = req.body;
  if (
    !bookingid ||
    !email ||
    !actn ||
    typeof bookingid !== "string" ||
    typeof email !== "string" ||
    typeof actn !== "string" ||
    !["nw", "rsnd"].some((itm) => actn === itm) ||
    !validator.isEmail(email)
  ) {
    return res.status(400).json("Invalid request");
  }
  let updt;
  let Otp;
  let Validity;
  const isbooking = await Booking.findOne({
    email,
    bookingid,
    "assignedto.operatorid": user.operatedby,
    "driverinfo.driverid": user.driverid,
    bookingstatus: "ongoing",
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
  if (!isbooking) {
    return res.status(400).json("No booking found");
  }
  let generateOTP = () => {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  };
  if (actn === "nw") {
    if (!Endkm || typeof Endkm !== "string" || isNaN(Endkm)) {
      return res.status(400).json("Invalid request");
    }
    if (Endkm * 1 < isbooking.billing.tripstats.startkm) {
      return res
        .status(400)
        .json("End km reading can't be less then Start km reading");
    }
    Otp = generateOTP();
    Validity = new Date(new Date().getTime() + 300000).getTime() * 1;
    updt = {
      "billing.tripstats.endkm": Endkm * 1,
      "otp.end.code": Otp,
      "otp.end.validity": Validity,
    };
  } else {
    if (!isbooking.otp.end.code) {
      return res.status(400).json("invalid request");
    }
    if (isbooking.otp.end.validity - new Date().getTime() > 60000) {
      Otp = isbooking.otp.end.code;
      updt = {
        "otp.end.code": Otp,
      };
    } else {
      Otp = generateOTP();
      Validity = new Date(new Date().getTime() + 300000).getTime() * 1;
      updt = {
        "otp.end.code": Otp,
        "otp.end.validity": Validity,
      };
    }
  }
  const result = await Booking.updateOne(
    {
      email,
      bookingid,
      "assignedto.operatorid": user.operatedby,
      "driverinfo.driverid": user.driverid,
      bookingstatus: "ongoing",
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
  if (result === "block") {
    return;
  }
  if (result.matchedCount < 1) {
    return res.status(400).json("failed to genrate otp");
  } else {
    const txtdata = JSON.stringify({
      route: "dlt",
      sender_id: "MTRACB",
      message: "143663",
      variables_values: `${Otp}|30|`,
      flash: 0,
      numbers: `${isbooking.phone}`,
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
      return res
        .status(201)
        .json(
          "an otp has been sent to coustumer no it's also visible on coustumers dashboard"
        );
    } else {
      return res
        .status(500)
        .json("Failed to send otp please try again after some time");
    }
  }
};

// === === === verify and end the trip === === === //

exports.driver_verandtrip = async (req, res) => {
  const user = req.user;
  let hrfare, kmfare;
  const { code, bookingid, email } = req.body;
  if (
    !code ||
    typeof code !== "string" ||
    isNaN(code) ||
    !bookingid ||
    typeof bookingid !== "string" ||
    !email ||
    typeof email !== "string" ||
    !validator.isEmail(email)
  ) {
    return res.status(400).json("Invalid request");
  }
  const isbooking = await Booking.findOne({
    email,
    bookingid,
    "assignedto.operatorid": user.operatedby,
    "driverinfo.driverid": user.driverid,
    bookingstatus: "ongoing",
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
  if (!isbooking) {
    return res.status(400).json("No booking found");
  }
  if (isbooking.otp.end.code !== code * 1) {
    return res.status(400).json("Invalid otp");
  } else if (isbooking.otp.end.validity < new Date().getTime()) {
    return res.status(400).json("Otp has expired");
  } else {
    let currtime = new Date().getTime();
    updt = {
      bookingstatus: "completed",
      "billing.tripstats.endat": currtime,
    };
    let billamount = isbooking.payable;
    let oprtramt = isbooking.assignedto.amount;
    if (isbooking.bookingtype === "Local") {
      let hr = Math.ceil(
        (currtime - isbooking.billing.tripstats.startat * 1) / 3600000
      );
      let km =
        isbooking.billing.tripstats.endkm - isbooking.billing.tripstats.startkm;
      if (hr > isbooking.tripinfo.hour) {
        hrfare =
          (hr - isbooking.tripinfo.hour) *
          isbooking.tripinfo.othercharges.Extrahour.amount;
        updt = {
          ...updt,
          "billing.extrahour.company": hrfare,
          "billing.extrahour.partner": Math.floor(hrfare - hrfare / 5),
        };
        billamount = billamount + hrfare;
        oprtramt = oprtramt + Math.floor(hrfare - hrfare / 5);
      }
      if (km > isbooking.tripinfo.distance) {
        kmfare =
          (km - isbooking.tripinfo.distance) *
          isbooking.tripinfo.othercharges.Extrakm.amount;
        updt = {
          ...updt,
          "billing.extrakm.company": kmfare,
          "billing.extrakm.partner": Math.floor(kmfare - kmfare / 10),
        };
        billamount = billamount + kmfare;
        oprtramt = oprtramt + Math.floor(kmfare - kmfare / 10);
      }
      if (!isbooking.tripinfo.othercharges.Driveraid.isinclude) {
        billamount =
          billamount + isbooking.tripinfo.othercharges.Driveraid.amount;
      }
      if (!isbooking.tripinfo.othercharges.GST.isinclude) {
        billamount = Math.ceil(billamount + (billamount * 5) / 100);
      }
    } else if (isbooking.bookingtype === "Outstation") {
      let km =
        isbooking.billing.tripstats.endkm - isbooking.billing.tripstats.startkm;
      if (km > isbooking.tripinfo.distance) {
        kmfare =
          (km - isbooking.tripinfo.distance) *
          isbooking.tripinfo.othercharges.Extrakm.amount;
        updt = {
          ...updt,
          "billing.extrakm.company": kmfare,
          "billing.extrakm.partner": Math.floor(kmfare - kmfare / 10),
        };
        billamount = billamount + kmfare;
        oprtramt = oprtramt + Math.floor(kmfare - kmfare / 10);
      }
      if (isbooking.outstation === "Roundtrip") {
        if (currtime > isbooking.returnat) {
          let hr = Math.ceil((currtime - isbooking.returnat * 1) / 3600000);
          hrfare = hr * isbooking.tripinfo.othercharges.Extrahour.amount;
          updt = {
            ...updt,
            "billing.extrahour.company": hrfare,
            "billing.extrahour.partner": Math.floor(hrfare - hrfare / 5),
          };
          billamount = billamount + hrfare;
          oprtramt = oprtramt + Math.floor(hrfare - hrfare / 5);
        }
        if (!isbooking.tripinfo.othercharges.Driveraid.isinclude) {
          const days = Math.ceil(
            (currtime - isbooking.billing.tripstats.startat) / 86400000
          );
          billamount =
            billamount +
            isbooking.tripinfo.othercharges.Driveraid.amount * days;
        }
      } else {
        let hr = Math.ceil(
          (currtime - isbooking.billing.tripstats.startat * 1) / 3600000
        );
        if (hr > isbooking.tripinfo.hours) {
          hrfare =
            (hr - isbooking.tripinfo.hours) *
            isbooking.tripinfo.othercharges.Extrahour.amount;
          updt = {
            ...updt,
            "billing.extrahour.company": hrfare,
            "billing.extrahour.partner": Math.floor(hrfare - hrfare / 5),
          };
          billamount = billamount + hrfare;
          oprtramt = oprtramt + Math.floor(hrfare - hrfare / 5);
        }
        if (!isbooking.tripinfo.othercharges.Driveraid.isinclude) {
          billamount =
            billamount + isbooking.tripinfo.othercharges.Driveraid.amount;
        }
      }
      if (!isbooking.tripinfo.othercharges.GST.isinclude) {
        billamount = Math.ceil(billamount + (billamount * 5) / 100);
      }
    }
    let cash = billamount - isbooking.advance;
    if (cash > oprtramt) {
      updt = {
        ...updt,
        "billing.companybal": {
          amount: cash * 1 - oprtramt * 1,
        },
      };
    } else {
      updt = {
        ...updt,
        "billing.partnerbal": {
          amount: oprtramt * 1 - cash * 1,
        },
      };
    }
    updt = {
      ...updt,
      bookingstatus: "completed",
      status: "completed",
      "billing.billamount": billamount,
      "billing.oprtramt": oprtramt,
      "billing.cash": cash,
      "billing.billed": false,
    };
    const result = await Booking.updateOne(
      {
        email,
        bookingid,
        "assignedto.operatorid": user.operatedby,
        "driverinfo.driverid": user.driverid,
        bookingstatus: "ongoing",
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
    if (result === "block") {
      return;
    }
    if (result.modifiedCount < 1) {
      res.status(400).json("failed to update the booking");
    } else {
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
          "booking.completed": stat.booking.completed + 1,
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
      res.status(201).json({
        res: true,
        cash,
        tolltax: isbooking.tripinfo.othercharges.Tolltaxes,
      });
    }
  }
};

// === === === driver profile === === === //

exports.driver_profile = async (req, res) => {
  const user = req.user;
  let status;
  if (user.verification.isverified) {
    status = "verified";
  } else {
    if (user.verification.request) {
      status = "document";
    } else {
      status = "pending";
    }
  }
  const data = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    aPhone: user.aPhone,
    status,
  };
  res.status(200).json(data);
};

// === === === forgot password operator === === === //

exports.forgot_pass = async (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone) {
    return res.status(400).json({ error: "please fill all the fields" });
  }
  if (typeof email !== "string" || typeof phone !== "string") {
    return res.status(400).json("Invalid data type");
  }
  if (!validator.isEmail(email)) {
    return res
      .status(422)
      .json({ error: "please enter a valid email address" });
  }
  if (!validator.isMobilePhone(phone, "en-IN") || phone.length > 10) {
    return res.status(422).json({ error: "please enter a valid Phone number" });
  }
  let regex = new RegExp(["^", email, "$"].join(""), "i");
  const isuser = await Partner.findOne({
    email: regex,
    phone,
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json({ error: "failed to fetch data" });
      return "block";
    });
  if (isuser === "block") {
    return;
  }
  if (!isuser) {
    return res.status(401).json({ error: "user not found" });
  } else {
    const delotp = await Otp.deleteMany({
      email: regex,
      phone,
      for: "partner",
      senton: "phone",
      type: "forgotpass",
    })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json({ error: "failed to fetch data" });
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
      createdon: date,
      for: "partner",
      resend: {
        on: date,
        count: 0,
      },
      senton: "phone",
      attempt:0
    });
    const sresult = await otpreq
      .save()
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json({ error: "failed to fetch data" });
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
        res.status(500).json("failed to send otp");
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
const { default: isURL } = require("validator/lib/isURL");
const { use } = require("../router/paymentr");

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
    return res.status(400).json("invalid data type");
  }
  if (
    !validator.isEmail(email) ||
    !validator.isMobilePhone(phone, "en-IN") ||
    phone.length > 10
  ) {
    return res.status(400).json("Invalid request");
  }
  if (password !== cPassword) {
    return res
      .status(422)
      .json({ error: "password and confirm password do not match" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json("Password should be minimum 8 character's long");
  }
  if (code.length !== 6) {
    return res.status(422).json({ error: "Otp length should be 6 " });
  }
  let regex = new RegExp(["^", email, "$"].join(""), "i");
  const isotp = await Otp.findOne({
    email: regex,
    code: code,
    phone: phone,
    for: "partner",
    senton: "phone",
    type: "forgotpass",
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
    if(isotp.attempt >= 5){
      return res.status(400).json("Maximum request attempted")
    }
    if (code !== isotp.code) {
      res.status(400).json("Invalid otp");
      const upotp = await Otp.updateOne(
        {
          email: regex,
          phone: phone,
          for: "partner",
          senton: "phone",
          type: "forgotpass",
        },
        { attempt: isotp.attempt + 1 }
      )
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
        return
    }
    if (isotp.expiry > new Date().getTime()) {
      const delotp = await Otp.deleteMany({
        email: email,
        phone: phone,
        for: "partner",
        senton: "phone",
        type: "forgotpass",
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
      const update = await Partner.updateOne(
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
        return res.status(200).json({ message: "Password Reset Successfully" });
      } else {
        return res.status(422).json({
          error: "Can't reset the password right now please try again later ",
        });
      }
    } else {
      const delotp = await Otp.deleteMany({
        email: email,
        phone,
        for: "partner",
        type: "forgotpass",
        senton: "phone",
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
      return res.status(400).json({ error: "Otp expired" });
    }
  } else {
    return res.status(422).json({ error: "invalid otp" });
  }
};

// === === === resend otp === === === //

exports.resendotp = async (req, res) => {
  const { email, phone, rsn } = req.body;
  if (!email || !phone || !rsn) {
    return res.status(400).json({ error: "invalid request" });
  } else if (
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof rsn !== "string"
  ) {
    return res.status(400).json({ error: "invalid data type" });
  } else if (
    !validator.isEmail(email) ||
    !validator.isMobilePhone(phone, "en-IN") ||
    phone.length > 10 ||
    !["forgotpass", "verification"].some((itm) => itm === rsn)
  ) {
    return res.status(400).json({ error: "invalid request" });
  }
  var toupdt = true;
  const user = await Partner.findOne({
    email: { $regex: `${email}`, $options: "i" },
    phone,
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json({ error: "invalid request" });
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
  if (!user) {
    return res.status(401).json({ error: "invalid request" });
  }
  const isOtp = await Otp.findOne({
    email: { $regex: `${email}`, $options: "i" },
    phone,
    type: rsn,
    for: "partner",
    senton: "phone",
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
    if(isOtp.attempt >= 5){
      return res.status(400).json("invalid request")
    }
    if (isOtp.createdon + 1200 * 1000 < new Date().getTime()) {
      return res.status(400).json("Session expired");
    }
    if (isOtp.resend.count >= 5) {
      return res.status(400).json("Maximum resend attempted");
    }
    if (isOtp.resend.on + 60 * 1000 > new Date().getTime()) {
      return res.status(400).json("invalid request");
    }
    if (isOtp.expiry - new Date().getTime() >= 60 * 1000) {
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
        for: "partner",
        senton: "phone",
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
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (txtotp === "block") {
        return;
      }
      if (txtotp.data.return) {
        return res.json({ result: true });
      } else {
        return res.status("400").json("failed to send otp to your number");
      }
    } else {
      return res.status("400").json("failed to send otp to your number");
    }
  } else {
    const otpreq = await Otp.updateOne(
      {
        email: { $regex: `${email}`, $options: "i" },
        phone,
        type: rsn,
        for: "partner",
        senton: "phone",
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
      return res.json({ result: true });
      // const txtotp = await axios
      //   .post("https://www.fast2sms.com/dev/bulkV2", txtdata, customConfig)
      //   .then((res) => {
      //     return res;
      //   })
      //   .catch((error) => {
      //     res.status(500).json("failed to fetch data");
      //     return "block";
      //   });
      // if (txtotp === "block") {
      //   return;
      // }
      // if (txtotp.data.return) {
      //   return res.json({ result: true });
      // } else {
      //   return res.status(400).json("failed to send otp to your number");
      // }
    } else {
      return res.status(400).json("failed to send otp to your number");
    }
  }
};
// === === === forgot password driver === === === //

exports.driver_forgot_pass = async (req, res) => {
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
  if (!validator.isMobilePhone(phone, "en-IN") || phone.length > 10) {
    return res.status(422).json({ error: "please enter a valid Phone number" });
  }
  let regex = new RegExp(["^", email, "$"].join(""), "i");
  const isuser = await Driver.findOne({
    email: regex,
    phone,
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
  if (!isuser) {
    return res.status(401).json({ error: "user not found" });
  } else {
    const delotp = await Otp.deleteMany({
      email: regex,
      phone,
      for: "driver",
      type: "forgotpass",
      senton: "phone",
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
      createdon: date,
      for: "driver",
      resend: {
        on: date,
        count: 0,
      },
      senton: "phone",
      attempt:0
    });
    const sresult = await otpreq
      .save()
      .then((res) => {
        return true;
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

exports.driver_reset_pass = async (req, res) => {
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
    return res.status(400).json("invalid data type");
  }
  if (
    !validator.isEmail(email) ||
    !validator.isMobilePhone(phone, "en-IN") ||
    phone.length > 10
  ) {
    return res.status(400).json("Invalid request");
  }
  if (password !== cPassword) {
    return res
      .status(422)
      .json({ error: "password and confirm password do not match" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json("Password should be minimum 8 character's long");
  }
  if (code.length !== 6) {
    return res.status(422).json({ error: "Otp length should be 6 " });
  }
  let regex = new RegExp(["^", email, "$"].join(""), "i");
  const isotp = await Otp.findOne({
    email: regex,
    code: code,
    phone: phone,
    for: "driver",
    type: "forgotpass",
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
    if(isotp.attempt >= 5){
      return res.status(400).json("Maximum request attempted")
    }
    if (code !== isotp.code) {
      res.status(400).json("Invalid otp");
      const upotp = await Otp.updateOne(
        {
          email: regex,
          phone: phone,
          for: "driver",
          type: "forgotpass",
          senton: "phone",
        },
        { attempt: isotp.attempt + 1 }
      )
        .then((res) => {
          return res;
        })
        .catch((error) => {
          res.status(500).json("failed to fetch data");
          return "block";
        });
        return
    }
    if (isotp.expiry > new Date().getTime()) {
      const delotp = await Otp.deleteMany({
        email: email,
        phone,
        type: "forgotpass",
        for: "driver",
        senton: "phone",
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
      const update = await Driver.updateOne(
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
        return res.status(200).json({ message: "Password Reset Successfully" });
      } else {
        return res.status(422).json({
          error: "Can't reset the password right now please try again later ",
        });
      }
    } else {
      const delotp = await Otp.deleteMany({
        email: email,
        phone,
        for: "driver",
        senton: "phone",
        type: "forgotpass",
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
      return res.status(400).json({ error: "Otp expired" });
    }
  } else {
    return res.status(422).json({ error: "invalid otp" });
  }
};

// === === === resend otp === === === //

exports.driver_resendotp = async (req, res) => {
  const { email, phone, rsn } = req.body;
  if (
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof rsn !== "string" ||
    !validator.isEmail(email) ||
    !validator.isMobilePhone(phone, "en-IN") ||
    phone.length > 10
  ) {
    return res.status(400).json("Invalid request");
  }
  var toupdt = true;
  const user = await Driver.findOne({
    email: { $regex: `${email}`, $options: "i" },
    phone,
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
  let otp;
  function generateOTP() {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }
  if (!user) {
    return res.status(401).json({ error: "invalid request" });
  }
  const isOtp = await Otp.findOne({
    email: { $regex: `${email}`, $options: "i" },
    phone,
    type: rsn,
    for: "driver",
    senton: "phone",
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
    if(isOtp.attempt >= 5){
      return res.status(400).json("invalid request")
    }
    if (isOtp.createdon + 1200 * 1000 < new Date().getTime()) {
      return res.status(400).json("Session expired");
    }
    if (isOtp.resend.count >= 5) {
      return res.status(400).json("Maximum resend attempted");
    }
    if (isOtp.resend.on + 60 * 1000 > new Date().getTime()) {
      return res.status(400).json("invalid request");
    }
    if (isOtp.expiry - new Date().getTime() >= 60 * 1000) {
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
        for: "driver",
        senton: "phone",
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
          res.status(500).json("failed to fetch data");
          return "block";
        });
      if (txtotp === "block") {
        return;
      }
      if (txtotp.data.return) {
        return res.json({ result: true });
      } else {
        return res.status("400").json("failed to send otp to your number");
      }
    } else {
      return res.status("400").json("failed to send otp to your number");
    }
  } else {
    const otpreq = await Otp.updateOne(
      {
        email: { $regex: `${email}`, $options: "i" },
        phone,
        type: rsn,
        for: "driver",
        senton: "phone",
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

exports.driver_profilepic = async (req, res) => {
  let options = {
    root: path.join(
      __dirname,
      `../public/privateimages/driver/${req.user.driverid}`
    ),
  };

  var fileName = req.user.Profile;
  if (
    !fileName ||
    !fs.existsSync(
      path.join(
        __dirname,
        `../public/privateimages/driver/${req.user.driverid}`,
        fileName
      )
    )
  ) {
    options = {
      root: path.join(__dirname, "../public/privateimages/default/"),
    };
    fileName = "pic.png";
  }
  res.sendFile(fileName, options);
};

// === === === penalty lstr === === === //
const Penalty = require("../models/partner/Penalty");
const OTP = require("../models/client/otp");
exports.partner_pnltylst = async (req, res) => {
  let operatorid = req.user.operatorid;
  let { bookingid, entry, pag } = req.body;
  // if (!entry || typeof entry !== "string" || !pag || typeof pag !== "string") {
  //   return res.status(400).json("invalid request");
  // } else {
  //   entry = entry * 1;
  //   pag = pag * 1;
  // }
  let fltr = {};
  if (operatorid) {
    if (typeof operatorid !== "string") {
      return res.status(400).json("unauthorized");
    }
    fltr = { ...fltr, operatorid };
  }
  if (bookingid) {
    if (typeof bookingid !== "string") {
      return res.status(400).json("Invalid booking id");
    }
    fltr = { ...fltr, bookingid };
  }
  const penalty = await Penalty.find(fltr)
    // .limit(entry)
    // .skip(entry * (pag - 1))
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (penalty === "block") {
    return;
  }
  if (penalty) {
    return res.status(200).json(penalty);
  } else {
    return res.status(400).json("Some error occured");
  }
};
