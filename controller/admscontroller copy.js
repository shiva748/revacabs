const validator = require("validator");
const adms = require("../models/admin/adms");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Booking = require("../models/client/bookings");
const Stats = require("../models/stats");

// === === === Admin login === === === //

exports.admn_login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "please fill all the fields" });
  }
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json("invalid request");
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
  if (!validator.isStrongPassword(password)) {
    return res.status(400).json("Invalid login credentials");
  }
  if (!validator.isEmail(email)) {
    if (email.length !== 10) {
      return res.status(400).json("Invalid login credentials");
    }
  }
  let regex = new RegExp(["^", email, "$"].join(""), "i");
  const admin = await adms.findOne({
    $or: [{ email: regex }, { username: email }],
  });
  if (!admin) {
    return res.status(400).json("invalid login credentials");
  }
  if (!admin.approved) {
    return res.status(400).json("invalid login credentials");
  }
  if (admin.Locked.islocked) {
    return res.status(403).json(admin.Locked.reason);
  }
  if (
    new Date(admin.Records.Date).toLocaleDateString() ===
    new Date().toLocaleDateString()
  ) {
    if (admin.Records.failed >= 5) {
      return res.status(400).json("your profile is locked");
    }
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  if (isMatch) {
    const token = await admin.genrateAuthToken();
    res.cookie("oceannodesmkl", token, {
      expires: new Date(Date.now() + 36000000),
      httpOnly: true,
      path: "/oceannodes",
    });
    res.status(200).json("Login Successfull");
  } else {
    let nr;
    if (
      new Date(admin.Records.Date).toLocaleDateString() ===
      new Date().toLocaleDateString()
    ) {
      nr = admin.Records;
      nr.failed = nr.failed + 1;
    } else {
      nr = {
        Date: new Date().toLocaleDateString(),
        failed: 1,
      };
    }
    const update = await adms.updateOne(
      {
        email: admin.email,
        username: admin.username,
      },
      { Records: nr }
    );
    if (nr.failed >= 5) {
      return res.status(400).json("Your Profile has been locked");
    } else {
      const left = 5 - nr.failed;
      return res.status(400).json(`${left} attempts Left`);
    }
  }
};

// === === === Activate Admin === === === //

exports.admn_activate_get = async (req, res) => {
  const token = req.cookies.oceannodesmkl;
  if (!token) {
    return res.status(400).json("Invalid request");
  }
  const match = jwt.verify(token, process.env.SECRET_KEY);
  const admin = await adms.findOne(
    {
      _id: match._id,
      "tokens.token": token,
    },
    { password: 0, cPassword: 0, _id: 0, activepin: 0 }
  );
  if (!admin) {
    return res
      .status(403)
      .clearCookie("oceannodesmkl", { path: "/oceannodes" })
      .json("invalid Request");
  }
  if (!admin.approved) {
    return res
      .status(403)
      .clearCookie("oceannodesmkl", { path: "/oceannodes" })
      .json("invalid Request");
  }
  if (admin.Locked.islocked) {
    return res
      .status(403)
      .clearCookie("oceannodesmkl", { path: "/oceannodes" })
      .json(admin.Locked.reason);
  }
  if (
    new Date(admin.Records.Date).toLocaleDateString() ===
    new Date().toLocaleDateString()
  ) {
    if (admin.Records.failed > 5) {
      return res
        .status(403)
        .clearCookie("oceannodesmkl", { path: "/oceannodes" })
        .json("your profile is locked");
    }
  }
  return res.status(200).json({ name: admin.firstName, status: "successs" });
};

// === === === activate post request === === === //

exports.admn_activate = async (req, res) => {
  const { code } = req.body;
  if (typeof code !== "string") {
    return res
      .status(400)
      .clearCookie("oceannodesmkl", { path: "/oceannodes" })
      .json("Invalid request");
  }
  const token = req.cookies.oceannodesmkl;
  if (!token) {
    return res.status(400).json("Invalid request");
  }
  const match = jwt.verify(token, process.env.SECRET_KEY);
  const admin = await adms.findOne({
    _id: match._id,
    "tokens.token": token,
  });
  if (!admin) {
    return res
      .status(403)
      .clearCookie("oceannodesmkl", { path: "/oceannodes" })
      .json("invalid Request");
  }
  if (!admin.approved) {
    return res
      .status(403)
      .clearCookie("oceannodesmkl", { path: "/oceannodes" })
      .json("invalid Request");
  }
  if (admin.Locked.islocked) {
    return res
      .status(403)
      .clearCookie("oceannodesmkl", { path: "/oceannodes" })
      .json(admin.Locked.reason);
  }
  if (
    new Date(admin.Records.Date).toLocaleDateString() ===
    new Date().toLocaleDateString()
  ) {
    if (admin.Records.failed > 5) {
      return res
        .status(403)
        .clearCookie("oceannodesmkl", { path: "/oceannodes" })
        .json("your profile is locked");
    }
  }
  if (admin.activepin.code !== code) {
    let nr;
    if (
      new Date(admin.Records.Date).toLocaleDateString() ===
      new Date().toLocaleDateString()
    ) {
      nr = admin.Records;
      nr.failed = nr.failed + 1;
    } else {
      nr = {
        Date: new Date().toLocaleDateString(),
        failed: 1,
      };
    }
    const update = await adms.updateOne(
      {
        email: admin.email,
        username: admin.username,
      },
      { Records: nr }
    );
    if (nr.failed >= 5) {
      return res
        .status(403)
        .clearCookie("oceannodesmkl", { path: "/oceannodes" })
        .json("Your Profile has been locked");
    } else {
      const left = 5 - nr.failed;
      return res.status(400).json({ message: `${left} attempts Left`, left });
    }
  } else {
    const update = await adms.updateOne(
      {
        email: admin.email,
        username: admin.username,
      },
      { isactive: true }
    );
    return res.status(201).json("Your profile has been activated");
  }
};

// === === === admin auto_log === === === //

exports.admn_autolog = (req, res) => {
  const data = req.admin;
  res.json({
    result: true,
    data: { name: data.firstName, lastName: data.lastName },
  });
};

// === === === admin logout === === === //

exports.admn_logout = async (req, res) => {
  const data = req.admin;
  const token = req.token;

  const filtered = data.tokens.filter((itm) => {
    return itm.token !== token;
  });
  const update = await adms.updateOne(
    { email: data.email, id: data.id },
    { tokens: filtered }
  );
  return res
    .status(200)
    .clearCookie("oceannodesmkl", { path: "/oceannodes" })
    .json("logout successfull");
};

// === === === booking inquiry === === === //

exports.admn_getinqui = async (req, res) => {
  let { from, fromCode, date, type, inqutyp, bkngid, pag, entry } = req.body;
  if (!inqutyp || !["lst", "dtl"].some((itm) => itm === inqutyp)) {
    return res.status(400).json("Invalid request");
  }
  if (inqutyp === "dtl") {
    pag = "1";
    entry = "1";
    if (!bkngid) {
      return res.status(400).json("Invalid request");
    }
  } else {
    if (
      !pag ||
      !entry ||
      typeof pag !== "string" ||
      typeof entry !== "string" ||
      !["10", "15", "20", "25"].some((itm) => itm === entry)
    ) {
      return res.status(400).json("invalid request");
    }
  }
  let srchdata = { bookingstatus: "unconfirmed" };

  const defdate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
    0,
    0,
    0,
    0
  ).getTime();
  if (date) {
    if (typeof date !== "number" || date < defdate) {
      return res.status(400).json("invalid request");
    }
    let gtd = new Date(
      new Date(date).getFullYear(),
      new Date(date).getMonth(),
      new Date().getDate(),
      0,
      0,
      0,
      0
    ).getTime();
    let ltd = new Date(
      new Date(date).getFullYear(),
      new Date(date).getMonth(),
      new Date().getDate(),
      23,
      59,
      59,
      999
    ).getTime();
    srchdata = {
      ...srchdata,
      $and: [{ pickupdate: { $gte: gtd } }, { pickupdate: { $lte: ltd } }],
    };
  } else {
    srchdata = {
      ...srchdata,
      pickupdate: { $gte: defdate },
    };
  }
  const valtyp = ["Roundtrip", "Oneway", "Local"];
  if (type) {
    if (typeof type !== "string" || !valtyp.some((itm) => itm === type)) {
      return res.status(400).json("Invalid request");
    }
    if (type !== "Local") {
      srchdata = { ...srchdata, bookingtype: "Outstation", outstation: type };
    } else {
      srchdata = { ...srchdata, bookingtype: type };
    }
  }
  if (from || fromCode) {
    if (
      !from ||
      !fromCode ||
      typeof from !== "string" ||
      typeof fromCode !== "string"
    ) {
      return res.status(422).json("Invalid request");
    }
    srchdata = {
      ...srchdata,
      $or: [
        { "sourcecity.from": from, "sourcecity.fromcode": fromCode },
        { "endcity.to": from, "endcity.tocode": fromCode },
      ],
    };
  }
  if (inqutyp === "dtl") {
    if (!bkngid) {
      return res.status(400).json("Invalid request");
    }
    srchdata = { bookingstatus: "unconfirmed", bookingid: bkngid };
  }
  const result = await Booking.find(
    srchdata,
    inqutyp === "lst"
      ? {
          _id: 0,
          sourcecity: 1,
          endcity: 1,
          bookingtype: 1,
          bookingstatus: 1,
          outstation: 1,
          pickupat: 1,
          bookingdate: 1,
          "tripinfo.equivalent": 1,
          "tripinfo.othercharges": 1,
          "tripinfo.name": 1,
          payable: 1,
          bookingid: 1,
        }
      : {
          _id: 0,
          advanceoptn: 0,
          verificationkey: 0,
          "tripinfo.zero": 0,
          oprtramt: 0,
          bids: 0,
          penalty: 0,
        }
  )
    .limit(entry * 1)
    .skip(entry * 1 * (pag * 1 - 1));
  if (result) {
    res.json(result);
  } else {
    res.status(400).json("Failed to load Inquiry");
  }
};

// === === === booking in progress === === === //

exports.admn_getprogress = async (req, res) => {
  let { from, fromCode, bkngid, type, prcstyp, pag, entry } = req.body;
  if (!prcstyp || !["lst", "dtl"].some((itm) => itm === prcstyp)) {
    return res.status(400).json("Invalid request");
  }

  if (prcstyp === "dtl") {
    pag = "1";
    entry = "1";
    if (!bkngid) {
      return res.status(400).json("Invalid request");
    }
  } else {
    if (
      !pag ||
      !entry ||
      typeof pag !== "string" ||
      typeof entry !== "string" ||
      !["10", "15", "20", "25"].some((itm) => itm === entry)
    ) {
      return res.status(400).json("invalid request");
    }
  }
  let srchdata = {};
  const valtyp = ["Roundtrip", "Oneway", "Local"];
  if (type) {
    if (typeof type !== "string" || !valtyp.some((itm) => itm === type)) {
      return res.status(400).json("Invalid request");
    }
    if (type !== "Local") {
      srchdata = { ...srchdata, bookingtype: "Outstation", outstation: type };
    } else {
      srchdata = { ...srchdata, bookingtype: type };
    }
  }
  if (from || fromCode) {
    if (
      !from ||
      !fromCode ||
      typeof from !== "string" ||
      typeof fromCode !== "string"
    ) {
      return res.status(422).json("Invalid request");
    }
    srchdata = {
      ...srchdata,
      $or: [
        { "sourcecity.from": from, "sourcecity.fromcode": fromCode },
        { "endcity.to": from, "endcity.tocode": fromCode },
      ],
    };
  }
  if (bkngid) {
    if (typeof bkngid !== "string") {
      return res.status(400).json("Invalid booking id");
    }
    srchdata = {
      bookingid: bkngid,
    };
  }
  srchdata = {
    ...srchdata,
    bookingstatus: { $in: ["ongoing", "confirmed", "assigned"] },
    status: "upcoming",
  };
  const result = await Booking.find(
    srchdata,
    prcstyp === "lst"
      ? {
          sourcecity: 1,
          endcity: 1,
          bookingstatus: 1,
          pickupat: 1,
          assignedto: 1,
          bookingid: 1,
          bookingtype: 1,
          outstation: 1,
          _id: 0,
        }
      : {
          _id: 0,
          advanceoptn: 0,
          verificationkey: 0,
          "tripinfo.zero": 0,
        }
  )
    .limit(entry * 1)
    .skip(entry * 1 * (pag * 1 - 1));
  if (result) {
    res.json(result);
  } else {
    res.status(400).json("Failed to load history");
  }
};

// === === === load tour inquiry === === === //

const Tourbooking = require("../models/client/tourbooking");

exports.admn_gettourbkng = async (req, res) => {
  let { date, contact, status, tourtyp, pag, entry } = req.body;
  if (!tourtyp || !["lst", "dtl"].some((itm) => itm === tourtyp)) {
    return res.status(400).json("Invalid request");
  }
  if (tourtyp === "dtl") {
    pag = "1";
    entry = "1";
  } else {
    if (
      !pag ||
      !entry ||
      typeof pag !== "string" ||
      typeof entry !== "string" ||
      !["10", "15", "20", "25"].some((itm) => itm === entry)
    ) {
      return res.status(400).json("invalid request");
    }
  }
  let srchdata = {};
  const result = await Tourbooking.find(srchdata)
    .limit(entry * 1)
    .skip(entry * 1 * (pag * 1 - 1));
  if (result) {
    res.json(result);
  } else {
    res.status(400).json("Failed to load tour bokings");
  }
};

// === === === booking under billing === === === //

exports.admn_getbilling = async (req, res) => {
  let { from, fromCode, bkngid, type, blngtyp, pag, entry } = req.body;
  if (!blngtyp || !["lst", "dtl"].some((itm) => itm === blngtyp)) {
    return res.status(400).json("Invalid request");
  }
  if (blngtyp === "dtl") {
    pag = "1";
    entry = "1";
    if (!bkngid) {
      return res.status(400).json("Invalid request");
    }
  } else {
    if (
      !pag ||
      !entry ||
      typeof pag !== "string" ||
      typeof entry !== "string" ||
      !["10", "15", "20", "25"].some((itm) => itm === entry)
    ) {
      return res.status(400).json("invalid request");
    }
  }
  let srchdata = {};
  const valtyp = ["Roundtrip", "Oneway", "Local"];
  if (type) {
    if (typeof type !== "string" || !valtyp.some((itm) => itm === type)) {
      return res.status(400).json("Invalid request");
    }
    if (type !== "Local") {
      srchdata = { ...srchdata, bookingtype: "Outstation", outstation: type };
    } else {
      srchdata = { ...srchdata, bookingtype: type };
    }
  }
  if (from || fromCode) {
    if (
      !from ||
      !fromCode ||
      typeof from !== "string" ||
      typeof fromCode !== "string"
    ) {
      return res.status(422).json("Invalid request");
    }
    srchdata = {
      ...srchdata,
      $or: [
        { "sourcecity.from": from, "sourcecity.fromcode": fromCode },
        { "endcity.to": from, "endcity.tocode": fromCode },
      ],
    };
  }
  if (bkngid) {
    if (typeof bkngid !== "string") {
      return res.status(400).json("Invalid booking id");
    }
    srchdata = {
      bookingid: bkngid,
    };
  }
  srchdata = {
    ...srchdata,
    bookingstatus: { $in: ["completed", "cancelled"] },
    status: { $in: ["upcoming", "completed", "cancelled"] },
    "billing.billed": false,
  };
  const result = await Booking.find(
    srchdata,
    blngtyp === "lst"
      ? {
          sourcecity: 1,
          endcity: 1,
          bookingstatus: 1,
          pickupat: 1,
          assignedto: 1,
          bookingid: 1,
          bookingtype: 1,
          outstation: 1,
          billing: 1,
          _id: 0,
        }
      : {
          _id: 0,
          advanceoptn: 0,
          verificationkey: 0,
          "tripinfo.zero": 0,
        }
  )
    .limit(entry * 1)
    .skip(entry * 1 * (pag * 1 - 1));
  if (result) {
    res.json(result);
  } else {
    res.status(400).json("Failed to load history");
  }
};

// === === === update billing === === === //

exports.admn_updtblng = async (req, res) => {
  const admn = req.admin;
  let { bookingid, billed, paid, paidon, hstry, refunded, refundedon } =
    req.body;
  if (!bookingid || typeof bookingid !== "string") {
    return res.status(400).json("invalid booking id");
  }
  const isbooking = await Booking.findOne(
    {
      bookingid,
      bookingstatus: { $in: ["completed", "cancelled"] },
      status: { $in: ["upcoming", "completed", "cancelled"] },
      "billing.billed": hstry ? true : false,
    },
    { billing: 1, bookingstatus: 1 }
  );

  if (!isbooking) {
    return res.status(400).json("invalid request");
  }
  let updt = {};
  if (billed) {
    if (
      typeof billed !== "string" ||
      !["true", "false"].some((itm) => itm === billed)
    ) {
      return res.status(400).json("Invalid request");
    }
    if (toString(isbooking.billing.billed) === billed) {
      billed = "";
    } else {
      updt = { ...updt, "billing.billed": billed === "true" ? true : false };
    }
  }
  if (isbooking.bookingstatus === "completed") {
    if (isbooking.billing.partnerbal.amount) {
      if (paid) {
        if (
          typeof paid !== "string" ||
          !["true", "false"].some((itm) => itm === paid)
        ) {
          return res.status(400).json("Invalid request");
        }
      }
      if (toString(isbooking.billing.partnerbal.status) === paid) {
        paid = "";
      } else {
        updt = {
          ...updt,
          "billing.partnerbal.status": paid === "true" ? true : false,
        };
      }
      if (paidon) {
        if (typeof paidon !== "number" || new Date().getTime() < paidon) {
          return res.status(400).json("Invalid paid date selected");
        }
        if (paidon === isbooking.billing.partnerbal.date) {
          paidon = "";
        } else {
          updt = { ...updt, "billing.partnerbal.date": paidon };
        }
      }
      if (
        billed === "true" &&
        isbooking.billing.partnerbal.status !== true &&
        paid !== "true"
      ) {
        return res
          .status(400)
          .json("Please mark the operator balance paid to close the booking");
      }
      if (paid === "true" && !isbooking.billing.partnerbal.date && !paidon) {
        return res.status(400).json("Please select the payment date");
      }
    } else {
      if (billed === "true" && !isbooking.billing.companybal.status) {
        return res
          .status(400)
          .json("Operator haven't paid the company balance yet");
      }
    }
  } else {
    if (isbooking.billing.cancel.refund > 0) {
      if (refunded) {
        if (
          typeof refunded !== "string" ||
          !["true", "false"].some((itm) => itm === refunded)
        ) {
          return res.satus(400).json("Invalid request");
        }
      }
      if (toString(isbooking.billing.cancel.refunded) === refunded) {
        refunded = "";
      } else {
        updt = {
          ...updt,
          "billing.cancel.refunded": refunded === "true" ? true : false,
        };
      }
      if (refundedon) {
        if (
          typeof refundedon !== "number" ||
          new Date().getTime() < refundedon
        ) {
          return res.status(400).json("Invalid paid date selected");
        }
      }
      if (refundedon === isbooking.billing.cancel.refundedon) {
        refundedon = "";
      } else {
        updt = {
          ...updt,
          "billing.cancel.refundedon": refundedon,
        };
      }
      if (
        billed === "true" &&
        isbooking.billing.cancel.refunded !== true &&
        refunded !== "true"
      ) {
        return res
          .status(400)
          .json("Please mark the client processed to close the booking");
      }
      if (
        refunded === "true" &&
        !isbooking.billing.cancel.refundedon &&
        !refundedon
      ) {
        return status(400).json("Please select the Refund processed date");
      }
    }
  }
  const result = await Booking.updateOne(
    {
      bookingid,
      bookingstatus: { $in: ["completed", "cancelled"] },
      status: { $in: ["upcoming", "completed", "cancelled"] },
      "billing.billed": hstry ? true : false,
    },
    updt
  );
  if (result) {
    return res.status(201).json("Updated successfully");
  } else {
    return res.status(400).json("Failed to update the billing");
  }
};

// === === === booking history === === === //

exports.admn_gethistory = async (req, res) => {
  let { from, fromCode, bkngid, type, blngtyp, pag, entry } = req.body;

  if (!blngtyp || !["lst", "dtl"].some((itm) => itm === blngtyp)) {
    return res.status(400).json("Invalid request");
  }
  if (blngtyp === "dtl") {
    pag = "1";
    entry = "1";
    if (!bkngid) {
      return res.status(400).json("Invalid request");
    }
  } else {
    if (
      !pag ||
      !entry ||
      typeof pag !== "string" ||
      typeof entry !== "string" ||
      !["10", "15", "20", "25"].some((itm) => itm === entry)
    ) {
      return res.status(400).json("invalid request");
    }
  }
  let srchdata = {};
  const valtyp = ["Roundtrip", "Oneway", "Local"];
  if (type) {
    if (typeof type !== "string" || !valtyp.some((itm) => itm === type)) {
      return res.status(400).json("Invalid request");
    }
    if (type !== "Local") {
      srchdata = { ...srchdata, bookingtype: "Outstation", outstation: type };
    } else {
      srchdata = { ...srchdata, bookingtype: type };
    }
  }
  if (from || fromCode) {
    if (
      !from ||
      !fromCode ||
      typeof from !== "string" ||
      typeof fromCode !== "string"
    ) {
      return res.status(422).json("Invalid request");
    }
    srchdata = {
      ...srchdata,
      $or: [
        { "sourcecity.from": from, "sourcecity.fromcode": fromCode },
        { "endcity.to": from, "endcity.tocode": fromCode },
      ],
    };
  }
  if (bkngid) {
    if (typeof bkngid !== "string") {
      return res.status(400).json("Invalid booking id");
    }
    srchdata = {
      bookingid: bkngid,
    };
  }
  srchdata = {
    ...srchdata,
    bookingstatus: { $in: ["completed", "cancelled"] },
    status: { $in: ["upcoming", "completed", "cancelled"] },
    "billing.billed": true,
  };
  const result = await Booking.find(
    srchdata,
    blngtyp === "lst"
      ? {
          sourcecity: 1,
          endcity: 1,
          bookingstatus: 1,
          pickupat: 1,
          assignedto: 1,
          bookingid: 1,
          bookingtype: 1,
          outstation: 1,
          billing: 1,
          _id: 0,
        }
      : {
          _id: 0,
          advanceoptn: 0,
          verificationkey: 0,
          "tripinfo.zero": 0,
        }
  )
    .limit(entry * 1)
    .skip(entry * 1 * (pag * 1 - 1));
  if (result) {
    res.json(result);
  } else {
    res.status(400).json("Failed to load history");
  }
};
// === === === close inquiry === === === //

exports.admn_clsinqu = async (req, res) => {
  const { rsn, rsndes, bookingid } = req.body;
  const admn = req.admin;
  if (
    !rsn ||
    !bookingid ||
    typeof rsn !== "string" ||
    typeof bookingid !== "string"
  ) {
    return res.status(400).json("please fill all fields");
  } else if (rsn === "Other") {
    if (!rsndes || typeof rsndes !== "string" || rsndes.length > 100) {
      return res.status(400).json("please fill all fields");
    }
  }
  const valrsn = [
    "Advance problem",
    "High price",
    "Cab model",
    "State tax & tolls",
    "Night charges",
    "Fake Inquiry",
    "Other",
  ];
  if (!valrsn.some((itm) => itm === rsn)) {
    return res.status(400).json("invalid request");
  }
  const result = await Booking.updateOne(
    {
      bookingstatus: "unconfirmed",
      status: "upcoming",
      bookingid: bookingid,
    },
    {
      bookingstatus: "closed",
      close: { rsn: rsn, rsndes: rsndes, by: admn.id },
    }
  );
  if (!result) {
    return res.status(400).json("request failed");
  } else {
    return res.status(201).json("closed successfully");
  }
};

// === === === assing operator === === === //

exports.admn_assngop = async (req, res) => {
  const admn = req.admin;
  const { bookingid, operatorid } = req.body;
  if (
    !bookingid ||
    typeof bookingid !== "string" ||
    !operatorid ||
    typeof operatorid !== "string"
  ) {
    return res.status(400).json("invalid request");
  }
  const isbooking = await Booking.findOne(
    {
      bookingstatus: "confirmed",
      bookingid,
    },
    { bookingid: 1, bids: 1, bookingstatus: 1, assignedto: 1, _id: 0 }
  );
  if (!isbooking || !isbooking.bids) {
    return res.status(400).json("Invalid request");
  }
  if (isbooking.assignedto) {
    if (isbooking.assignedto.assigned) {
      return res.status(400).json("Booking already assigned");
    }
  }
  const [toassign] = isbooking.bids.filter(
    (itm) => itm.operatorid === operatorid
  );
  if (!toassign) {
    return res.status(400).json("invalid request");
  }
  const result = await Booking.updateOne(
    {
      bookingstatus: "confirmed",
      bookingid,
    },
    {
      bookingstatus: "assigned",
      assignedto: {
        assigned: true,
        operatorid: toassign.operatorid,
        amount: toassign.amount,
        phone: toassign.phone,
        aPhone: toassign.aPhone,
        name: toassign.name,
        email: toassign.email,
      },
    }
  );
  if (!result) {
    return res.status(400).json("request failed");
  } else {
    return res.status(201).json("assigned successfully");
  }
};

// === === === refuse operator === === === //
exports.rfs_oprtr = async (req, res) => {
  const admn = req.admin;
  const { bookingid, operatorid, isapplicable } = req.body;
  if (!bookingid || !isapplicable || !operatorid) {
    return res.status(400).json("invalid request");
  }
  let booking = await Booking.findOne({ bookingid, bookingstatus: "assigned" });
  if (!booking) {
    return res.status(400).json("invalid request");
  }
  if (booking.assignedto.operatorid !== operatorid) {
    return res.status(400).json("invalid request");
  }
  let penalty = booking.penalty;
  if (isapplicable === "yes") {
    if (booking.pickupat <= new Date().getTime() + 7200000) {
      penalty.push({
        operatorid: booking.assignedto.operatorid,
        phone: booking.assignedto.phone,
        amount: Math.floor(booking.payable / 10),
        reason: "cancelled after getting coustumer details",
        createdon: new Date().getTime(),
      });
    } else {
      penalty.push({
        operatorid: booking.assignedto.operatorid,
        phone: booking.assignedto.phone,
        amount: 100,
        reason: "Booking cancelled",
        createdon: new Date().getTime(),
      });
    }
  }
  const result = await Booking.updateOne(
    { bookingid, bookingstatus: "assigned" },
    {
      penalty,
      assignedto: { assigned: false },
      cabinfo: { assigned: false },
      driverinfo: { assigned: false },
      bookingstatus: "confirmed",
    }
  );
  if (result) {
    return res.status(201).json("Refused successfully");
  } else {
    return res.status(400).json("Can't proceed request");
  }
};

// === === === show client  === === === //
const Client = require("../models/client/clientReg");
exports.admn_clnt = async (req, res) => {
  const { email, phone, status, entry, pag } = req.body;
  let fltr = {};
  const val = ["authorised", "unauthorised", "blocked"];
  if (status) {
    if (!val.some((itm) => itm === status)) {
      return res.status(400).json(" 1 invalid request");
    }
    fltr = { ...fltr, isverified: status };
  }
  if (email) {
    if (typeof email !== "string" || !validator.isEmail(email)) {
      return res.status(400).json("invalid email");
    }
    fltr = { ...fltr, email };
  }
  if (phone) {
    if (typeof phone !== "string" || !validator.isMobilePhone(phone, "en-IN")) {
      return res.status(400).json("invalid phone");
    }
    fltr = { ...fltr, $or: [{ phone: phone }, { aPhone: phone }] };
  }
  if (!entry || typeof entry !== "number" || !pag || typeof pag !== "number") {
    return res.status(400).json("invalid request");
  }
  const clnts = await Client.find(fltr, {
    password: 0,
    cPassword: 0,
    termCondition: 0,
    tokens: 0,
    _id: 0,
  })
    .limit(entry)
    .skip(entry * (pag - 1));
  if (!clnts || clnts.length <= 0) {
    return res.status(400).json("No client found");
  } else {
    return res.json(clnts);
  }
};

// === === === change status === === === //

exports.admn_chngclntstat = async (req, res) => {
  const { email, phone, status } = req.body;
  if (
    !email ||
    !phone ||
    !status ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof status !== "string" ||
    !validator.isEmail(email) ||
    !validator.isMobilePhone(phone, "en-IN") ||
    !["blocked", "authorised", "unauthorised"].some((itm) => itm === status)
  ) {
    return res.status(400).json("invalid request");
  }
  const update = await Client.updateOne(
    { email, phone },
    { isverified: status }
  );
  if (update) {
    return res.status(201).json("update successfully");
  } else {
    return res.status(400).json("update request failed");
  }
};

// === === === show operator  === === === //

const Partner = require("../models/partner/Registration");

exports.admn_oprtr = async (req, res) => {
  const { oprtrid, phone, status, entry, pag, typ, email } = req.body;
  let fltr = {};
  if (oprtrid) {
    if (typeof oprtrid !== "string") {
      return res.status(400).json("invalid request");
    }
    fltr = { ...fltr, operatorid: oprtrid };
  }
  if (typ === "dtl") {
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json("invalid request");
      }
      fltr = { ...fltr, email: email };
    } else {
      return res.status(400).json("invalid request");
    }
  }

  if (phone) {
    if (typeof phone !== "string" || !validator.isMobilePhone(phone, "en-IN")) {
      return res.status(400).json("invalid phone");
    }
    fltr = { ...fltr, $or: [{ phone: phone }, { aPhone: phone }] };
  }
  if (!entry || typeof entry !== "number" || !pag || typeof pag !== "number") {
    return res.status(400).json("invalid request");
  }
  if (status) {
    if (
      typeof status !== "string" ||
      !["request", "pending", "verified", "locked"].some(
        (itm) => itm === status
      )
    ) {
      return res.status(400).json("invalid request");
    }
    if (status === "request") {
      fltr = { ...fltr, approved: false, Doc: null };
    } else if (status === "pending") {
      fltr = { ...fltr, approved: true, "verification.isverified": false };
    } else if (status === "verified") {
      fltr = { ...fltr, "verification.isverified": true, approved: true };
    } else if (status === "locked") {
      fltr = { ...fltr, approved: false, Doc: { $ne: null } };
    }
  }
  const clnts = await Partner.find(
    fltr,
    typ === "lst"
      ? {
          operatorid: 1,
          firstName: 1,
          lastName: 1,
          phone: 1,
          email: 1,
          _id: 0,
        }
      : {
          password: 0,
          cPassword: 0,
          termCondition: 0,
          tokens: 0,
          _id: 0,
        }
  )
    .limit(entry)
    .skip(entry * (pag - 1));
  if (!clnts || clnts.length <= 0) {
    return res.status(400).json("No client found");
  } else {
    return res.json(clnts);
  }
};

// === === === get profile === === === //
const path = require("path");
const fs = require("fs");
exports.prflloader = async (req, res) => {
  const fileName = req.params.filename;
  const filepath = req.params.path;
  if (!fileName) {
    return res.status(400).send("error");
  }
  const options = {
    root: path.join(__dirname, `../public/privateimages/${filepath}`),
  };
  if (
    !fs.existsSync(
      path.join(__dirname, `../public/privateimages/${filepath}`, fileName)
    )
  ) {
    return res.status(404).send("file not found (404 error)");
  }

  res.sendFile(fileName, options);
};

// === === === update operator === === === //

exports.admn_updtoprtr = async (req, res) => {
  const {
    basc,
    prfl,
    aadh,
    dl,
    reqdoc,
    verified,
    alog,
    oprtrid,
    phone,
    email,
  } = req.body;
  if (
    !email ||
    !phone ||
    typeof phone !== "string" ||
    typeof email !== "string" ||
    !validator.isMobilePhone(phone, "en-IN") ||
    !validator.isEmail(email)
  ) {
    return res.status(400).json("invalid request 2");
  }
  let updt = {};
  const bools = ["true", "false"];
  if (basc) {
    if (typeof basc !== "string" || !bools.some((itm) => itm === basc)) {
      return res.status(400).json("invalid request");
    }
    updt = { ...updt, "faultin.basc": basc === "true" ? true : false };
  }
  if (prfl) {
    if (typeof prfl !== "string" || !bools.some((itm) => itm === prfl)) {
      return res.status(400).json("invalid request");
    }
    updt = { ...updt, "faultin.prfl": prfl === "true" ? true : false };
  }
  if (aadh) {
    if (typeof aadh !== "string" || !bools.some((itm) => itm === aadh)) {
      return res.status(400).json("invalid request");
    }
    updt = { ...updt, "faultin.aadh": aadh === "true" ? true : false };
  }
  if (dl) {
    if (typeof dl !== "string" || !bools.some((itm) => itm === dl)) {
      return res.status(400).json("invalid request");
    }
    updt = { ...updt, "faultin.dl": dl === "true" ? true : false };
  }
  if (reqdoc) {
    if (typeof reqdoc !== "string" || !bools.some((itm) => itm === reqdoc)) {
      return res.status(400).json("invalid request");
    }
    updt = {
      ...updt,
      "verification.request": reqdoc === "true" ? true : false,
    };
  }
  if (verified) {
    if (
      typeof verified !== "string" ||
      !bools.some((itm) => itm === verified)
    ) {
      return res.status(400).json("invalid request");
    }
    updt = {
      ...updt,
      "verification.isverified": verified === "true" ? true : false,
    };
  }
  if (alog) {
    if (typeof alog !== "string" || !bools.some((itm) => itm === alog)) {
      return res.status(400).json("invalid request");
    }
    updt = {
      ...updt,
      approved: alog === "true" ? true : false,
    };
  }
  let toupdt = { email, phone };
  if (oprtrid) {
    if (typeof oprtrid !== "string") {
      return res.status(400).json("invalid request");
    }
    toupdt = { ...toupdt, operatorid: oprtrid };
  }
  const isuser = await Partner.findOne(toupdt);
  if (!isuser) {
    return res.status(400).json("invalid request");
  }
  const update = await Partner.updateOne(toupdt, updt);
  if (update) {
    if (alog && !isuser.approved) {
      const data = {
        to: [
          {
            name: isuser.firstName,
            email: isuser.email,
          },
        ],
        from: {
          name: "Revacabs",
          email: "service@1cyqpu.mailer91.com",
        },
        domain: "1cyqpu.mailer91.com",
        mail_type_id: "2",
        reply_to: [
          {
            email: "contact@1cyqpu.mailer91.com",
          },
        ],
        template_id: "Partner_profile_approval",
        variables: {
          NAME: isuser.firstName,
        },
      };
      const customConfig = {
        headers: {
          "Content-Type": "application/JSON",
          Accept: "application/json",
          authkey: process.env.MSG91AUTH,
        },
      };
      const emailreq = await axios.post(
        "https://api.msg91.com/api/v5/email/send",
        data,
        customConfig
      );
      return res.status(201).json("Updated Successfully");
    } else {
      return res.status(201).json("Updated Successfully");
    }
  } else {
    return res.status(400).json("invalid request");
  }
};

// === === === listing drivers === === === //

const Driver = require("../models/partner/Drivers");

exports.admn_driver = async (req, res) => {
  const { oprtrid, drvrid, status, entry, pag, typ, email } = req.body;
  let fltr = {};
  if (typ === "dtl") {
    if (email && validator.isEmail(email)) {
      fltr = { ...fltr, email: email };
    } else {
      return res.status(400).json("invalid request");
    }
  }
  if (oprtrid) {
    if (typeof oprtrid !== "string") {
      return res.status(400).json("invalid request");
    }
    fltr = { ...fltr, operatedby: oprtrid };
  }
  if (drvrid) {
    if (typeof drvrid !== "string") {
      return res.status(400).json("invalid phone");
    }
    fltr = { ...fltr, driverid: drvrid };
  }
  if (!entry || typeof entry !== "number" || !pag || typeof pag !== "number") {
    return res.status(400).json("invalid request");
  }
  if (status) {
    if (
      typeof status !== "string" ||
      ![
        "pending",
        "verified",
        "locked",
        "Active",
        "Suspended",
        "Inactive",
        "Dispute",
        "OnDuty",
      ].some((itm) => itm === status)
    ) {
      return res.status(400).json("invalid request");
    }
    if (status === "pending") {
      fltr = { ...fltr, approved: true, "verification.isverified": false };
    } else if (status === "verified") {
      fltr = { ...fltr, "verification.isverified": true, approved: true };
    } else if (status === "locked") {
      fltr = { ...fltr, approved: false, "verification.isverified": true };
    } else {
      fltr = { ...fltr, approved: true, status: status };
    }
  }
  const clnts = await Driver.find(
    fltr,
    typ === "lst"
      ? {
          operatedby: 1,
          firstName: 1,
          lastName: 1,
          driverid: 1,
          email: 1,
          phone: 1,
          _id: 0,
        }
      : {
          password: 0,
          cPassword: 0,
          termCondition: 0,
          tokens: 0,
          _id: 0,
        }
  )
    .limit(entry)
    .skip(entry * (pag - 1));
  if (!clnts || clnts.length <= 0) {
    return res.status(400).json("No client found");
  } else {
    return res.json(clnts);
  }
};

// === === === update driver === === === //

exports.admn_updtdrvr = async (req, res) => {
  const { basc, prfl, aadh, dl, reqdoc, verified, oprtrid, phone, email } =
    req.body;
  if (
    !email ||
    !phone ||
    typeof phone !== "string" ||
    typeof email !== "string" ||
    !validator.isMobilePhone(phone, "en-IN") ||
    !validator.isEmail(email)
  ) {
    return res.status(400).json("invalid request");
  }
  let updt = {};
  const bools = ["true", "false"];
  if (basc) {
    if (typeof basc !== "string" || !bools.some((itm) => itm === basc)) {
      return res.status(400).json("invalid request");
    }
    updt = { ...updt, "faultin.basc": basc === "true" ? true : false };
  }
  if (prfl) {
    if (typeof prfl !== "string" || !bools.some((itm) => itm === prfl)) {
      return res.status(400).json("invalid request");
    }
    updt = { ...updt, "faultin.prfl": prfl === "true" ? true : false };
  }
  if (aadh) {
    if (typeof aadh !== "string" || !bools.some((itm) => itm === aadh)) {
      return res.status(400).json("invalid request");
    }
    updt = { ...updt, "faultin.aadh": aadh === "true" ? true : false };
  }
  if (dl) {
    if (typeof dl !== "string" || !bools.some((itm) => itm === dl)) {
      return res.status(400).json("invalid request");
    }
    updt = { ...updt, "faultin.dl": dl === "true" ? true : false };
  }
  if (reqdoc) {
    if (typeof reqdoc !== "string" || !bools.some((itm) => itm === reqdoc)) {
      return res.status(400).json("invalid request");
    }
    updt = {
      ...updt,
      "verification.request": reqdoc === "true" ? true : false,
    };
  }
  if (verified) {
    if (
      typeof verified !== "string" ||
      !bools.some((itm) => itm === verified)
    ) {
      return res.status(400).json("invalid request");
    }
    updt = {
      ...updt,
      "verification.isverified": verified === "true" ? true : false,
    };
  }
  let toupdt = { email, phone };
  if (oprtrid) {
    if (typeof oprtrid !== "string") {
      return res.status(400).json("invalid request");
    }
    toupdt = { ...toupdt, operatedby: oprtrid };
  }
  const update = await Driver.updateOne(toupdt, updt);
  if (update) {
    return res.status(201).json("updated successfully");
  } else {
    return res.status(400).json("invalid request");
  }
};

// === === === approve login === === === //
const axios = require("axios");
exports.admn_drvrlgnaprv = async (req, res) => {
  const { alog, email, drvrid, oprtrid, phone } = req.body;
  let updt = {};
  if (
    !validator.isEmail(email) ||
    !validator.isMobilePhone(phone, "en-IN") ||
    typeof drvrid !== "string" ||
    typeof oprtrid !== "string" ||
    typeof alog !== "boolean"
  ) {
    return res.status(400).json("Invalid request");
  }
  const isdriver = await Driver.findOne(
    {
      email,
      phone,
      operatedby: oprtrid,
      driverid: drvrid,
    },
    { _id: 0, approved: 1, Credentials: 1, firstName: 1, email: 1 }
  );
  if (!isdriver) {
    return res.json(400).json("No driver found");
  }
  if (isdriver.approved === alog) {
    return res.json(400).json("invalid request");
  } else {
    updt = { approved: alog };
  }
  let password = "";
  if (alog && !isdriver.Credentials) {
    const chars =
      "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const passwordLength = 8;
    for (var i = 0; i <= passwordLength; i++) {
      var randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }
    updt = { ...updt, password, cPassword: password, Credentials: true };
  }
  const result = await Driver.updateOne(
    {
      email,
      phone,
      operatedby: oprtrid,
      driverid: drvrid,
    },
    updt
  );
  if (!result) {
    return res.status(400).json("invalid request");
  } else {
    if (alog && !isdriver.Credentials) {
      const data = {
        to: [
          {
            name: isdriver.firstName,
            email: isdriver.email,
          },
        ],
        from: {
          name: "Revacabs",
          email: "service@1cyqpu.mailer91.com",
        },
        domain: "1cyqpu.mailer91.com",
        mail_type_id: "2",
        reply_to: [
          {
            email: "contact@1cyqpu.mailer91.com",
          },
        ],
        template_id: "driver_profile_approval",
        variables: {
          EMAIL: isdriver.email,
          NAME: isdriver.firstName,
          PASSWORD: password,
        },
      };
      const customConfig = {
        headers: {
          "Content-Type": "application/JSON",
          Accept: "application/json",
          authkey: process.env.MSG91AUTH,
        },
      };
      const emailreq = await axios.post(
        "https://api.msg91.com/api/v5/email/send",
        data,
        customConfig
      );
      if (emailreq.data.status === "success") {
        return res
          .status(201)
          .json("Login approved and credentials sent on email");
      } else {
        return res
          .status(400)
          .json("Login approved but failed to send credentials on email");
      }
    } else {
      return res.status(201).json("Updated Successfully");
    }
  }
};

// === === === listing cars === === === //
const Cars = require("../models/partner/Cars");
exports.admn_listcar = async (req, res) => {
  const { oprtrid, rcnum, status, typ, entry, pag } = req.body;
  if (!entry || typeof entry !== "number" || !pag || typeof pag !== "number") {
    return res.status(400).json("invalid request");
  }
  let fltr = {};
  if (!typ || !["lst", "dtl"].map((itm) => itm === typ)) {
    return res.status(400).json("invalid request");
  }
  if (rcnum) {
    if (typeof rcnum !== "string") {
      return res.status(400).json("invalid request");
    }
    let regex = new RegExp(["^", rcnum, "$"].join(""), "i");
    fltr = { ...fltr, carNumber: regex };
  }
  if (oprtrid) {
    if (typeof oprtrid !== "string") {
      return res.status(400).json("invalid request");
    }
    fltr = { ...fltr, operatedby: oprtrid };
  }
  if (status) {
    if (
      typeof status !== "string" ||
      ![
        "pending",
        "verified",
        "Active",
        "Suspended",
        "Inactive",
        "Dispute",
        "OnDuty",
      ].some((itm) => itm === status)
    ) {
      return res.status(400).json("invalid request");
    }
    if (status === "pending") {
      fltr = { ...fltr, "verification.isverified": false };
    } else if (status === "verified") {
      fltr = { ...fltr, "verification.isverified": true };
    } else {
      fltr = { ...fltr, approved: true, status: status };
    }
  }
  const cars = await Cars.find(
    fltr,
    typ === "lst"
      ? {
          carNumber: 1,
          name: 1,
          operatedby: 1,
          policyValidity: 1,
          permitValidity: 1,
          _id: 0,
        }
      : { cab_id: 0, group_id: 0, _id: 0 }
  )
    .limit(entry)
    .skip(entry * (pag - 1));
  if (cars) {
    if (cars.length <= 0) {
      return res.status(400).json("No records found");
    }
    return res.status(200).json(cars);
  } else {
    return res.status(400).json("invalid request");
  }
};

// === === === update car === === === //

exports.admn_updtcar = async (req, res) => {
  const { rc, car, policy, permit, reqdoc, verified, oprtrid, rcnum } =
    req.body;

  let updt = {};
  const bools = ["true", "false"];
  if (rc) {
    if (typeof rc !== "string" || !bools.some((itm) => itm === rc)) {
      return res.status(400).json("invalid request");
    }
    updt = { ...updt, "faultin.rc": rc === "true" ? true : false };
  }
  if (car) {
    if (typeof car !== "string" || !bools.some((itm) => itm === car)) {
      return res.status(400).json("invalid request");
    }
    updt = { ...updt, "faultin.car": car === "true" ? true : false };
  }
  if (policy) {
    if (typeof policy !== "string" || !bools.some((itm) => itm === policy)) {
      return res.status(400).json("invalid request");
    }
    updt = { ...updt, "faultin.policy": policy === "true" ? true : false };
  }
  if (permit) {
    if (typeof permit !== "string" || !bools.some((itm) => itm === permit)) {
      return res.status(400).json("invalid request");
    }
    updt = { ...updt, "faultin.permit": permit === "true" ? true : false };
  }
  if (reqdoc) {
    if (typeof reqdoc !== "string" || !bools.some((itm) => itm === reqdoc)) {
      return res.status(400).json("invalid request");
    }
    updt = {
      ...updt,
      "verification.request": reqdoc === "true" ? true : false,
    };
  }
  if (verified) {
    if (
      typeof verified !== "string" ||
      !bools.some((itm) => itm === verified)
    ) {
      return res.status(400).json("invalid request");
    }
    updt = {
      ...updt,
      "verification.isverified": verified === "true" ? true : false,
    };
  }
  if (
    !oprtrid ||
    typeof oprtrid !== "string" ||
    !rcnum ||
    typeof rcnum !== "string"
  ) {
    return res.status(400).json("invalid request");
  }

  let toupdt = { carNumber: rcnum, operatedby: oprtrid };

  const update = await Cars.updateOne(toupdt, updt);
  if (update) {
    return res.status(201).json("updated successfully");
  } else {
    return res.status(400).json("invalid request");
  }
};

// === === === list city === === === //
const City = require("../models/autocity");
exports.admn_listcity = async (req, res) => {
  let { cty, ctycode, entry, pag, typ } = req.body;
  if (
    !entry ||
    typeof entry !== "string" ||
    !pag ||
    typeof pag !== "string" ||
    !typ ||
    typeof typ !== "string" ||
    !["lst", "dtl"].some((itm) => itm === typ)
  ) {
    return res.status(400).json("invalid request");
  } else {
    entry = entry * 1;
    pag = pag * 1;
  }
  let fltr = {};
  if (cty) {
    if (typeof cty !== "string") {
      return res.status(400).json("invalid request");
    }
    fltr = { ...fltr, cityname: { $regex: `${cty}`, $options: "i" } };
  }
  if (ctycode) {
    if (typeof ctycode !== "string" || isNaN(ctycode)) {
      return res.status(400).json("invalid request");
    }
    fltr = { ...fltr, citycode: ctycode };
  }
  const ctys = await City.find(
    fltr,
    typ === "lst"
      ? {
          _id: 0,
          cityname: 1,
          citycode: 1,
          longlat: 1,
        }
      : { _id: 0 }
  )
    .limit(entry)
    .skip(entry * (pag - 1));
  if (ctys) {
    if (ctys.length <= 0) {
      return res.status(400).json("No records found");
    }
    return res.json(ctys);
  } else {
    res.status(400).json("Some Error occured");
  }
};

// === === === add city === === === //

exports.admn_addcity = async (req, res) => {
  let valstate = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttarakhand",
    "Uttar Pradesh",
    "West Bengal",
    "India",
  ];
  let { city, state, longlat } = req.body;
  if (
    !city ||
    !state ||
    !longlat ||
    typeof city !== "string" ||
    typeof state !== "string" ||
    typeof longlat !== "string"
  ) {
    return res.status(400).json("invalid request");
  }
  city = city.charAt(0).toUpperCase() + city.slice(1);

  if (!valstate.some((itm) => itm === state)) {
    return res.status(400).json("invalid request");
  }
  let statics = await Stats.findOne({}, { city: 1, _id: 0 });
  const code = statics.city.count + 1 + 1000;
  let ctydata = {
    cityname: city.concat(", " + state),
    citycode: code,
    longlat: longlat,
    localitycount: 0,
  };
  const iscity = await City.findOne({
    $or: [{ cityname: ctydata.cityname }, { citycode: ctydata.citycode }],
  });
  if (iscity) {
    if (iscity.cityname === ctydata.cityname) {
      return res.status(400).json("City already exist");
    }
  }
  const savec = new City(ctydata);
  const result = await savec.save();
  if (result) {
    let updtst = await Stats.updateOne({
      "city.count": statics.city.count + 1,
    });
    return res.status(201).json("Added Successfully");
  } else {
    return res.status(500).json("error occurred");
  }
};

// === === === update city === === === //

exports.admn_updatecity = async (req, res) => {
  let valstate = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttarakhand",
    "Uttar Pradesh",
    "West Bengal",
    "India",
  ];
  let { city, state, longlat, code } = req.body;
  if (!code || typeof code !== "string" || isNaN(code)) {
    return res.status(400).json("invalid request 4");
  }
  let updt = {};
  if (city && state) {
    if (
      typeof city !== "string" ||
      typeof state !== "string" ||
      !valstate.some((itm) => itm === state)
    ) {
      return res.status(400).json("invalid request 3");
    }
    updt = {
      ...updt,
      cityname: city
        .charAt(0)
        .toUpperCase()
        .concat(city.slice(1) + `, ${state}`),
    };
  }
  if (longlat) {
    if (typeof longlat !== "string") {
      return res.status(400).json("invalid request 2");
    }
    updt = { ...updt, longlat };
  }
  const result = await City.updateOne({ citycode: code }, updt);
  if (result) {
    return res.status(201).json("updated successfully");
  } else {
    return res.status(400).json("invalid request 1");
  }
};

// === === === add locality === === === //

exports.admn_aduplocality = async (req, res) => {
  const { name, longlat, citycode, localitycode, cityname, actn } = req.body;
  if (
    !actn ||
    !longlat ||
    !name ||
    !citycode ||
    !cityname ||
    typeof actn !== "string" ||
    typeof longlat !== "string" ||
    typeof name !== "string" ||
    typeof citycode !== "string" ||
    typeof cityname !== "string" ||
    isNaN(citycode) ||
    !["add", "upd"].some((itm) => itm === actn)
  ) {
    return res.status(400).json("invalid request");
  }
  const iscity = await City.findOne({ cityname, citycode });
  if (!iscity) {
    return res.status(400).json("invalid request");
  }
  let oldlocs = iscity.locality;
  let statics;
  let updt = {};
  if (actn === "upd") {
    if (
      !localitycode ||
      typeof localitycode !== "string" ||
      isNaN(localitycode)
    ) {
      return res.status(400).json("invalid request");
    } else if (oldlocs.some((itm) => itm.code === localitycode)) {
      let [loca] = oldlocs.filter((itm) => itm.code === localitycode);
      loca = {
        name: name,
        longlat: longlat,
        code: loca.code,
        ind: loca.ind,
      };
      oldlocs[loca.ind] = loca;
      updt = {
        locality: oldlocs,
      };
    } else {
      return res.status(400).json("invalid request 2");
    }
  } else if (actn === "add") {
    statics = await Stats.findOne({}, { locality: 1, _id: 0 });
    oldlocs.push({
      name,
      longlat,
      code: statics.locality.count + 10000,
      ind: iscity.localitycount,
    });
    updt = {
      locality: oldlocs,
      localitycount: iscity.localitycount + 1,
    };
  }
  const result = await City.updateOne({ cityname, citycode }, updt);
  if (updt) {
    if (actn === "add") {
      let statup = await Stats.updateOne(
        {},
        { "locality.count": statics.locality.count + 1 }
      );
    }
    return res
      .status(201)
      .json(actn === "add" ? "added successfully" : "updated successfylly");
  } else {
    return res.status(400).json("invalid request");
  }
};

// === === === hourly package loader === === === //

const Hourly = require("../models/client/hourlyrental");
exports.admn_listhrly = async (req, res) => {
  let { cty, lstng, entry, pag, typ } = req.body;
  if (
    !entry ||
    typeof entry !== "string" ||
    !pag ||
    typeof pag !== "string" ||
    !typ ||
    typeof typ !== "string" ||
    !["lst", "dtl"].some((itm) => itm === typ)
  ) {
    return res.status(400).json("invalid request");
  } else {
    entry = entry * 10;
    pag = pag * 1;
  }
  let fltr = {};
  if (cty) {
    if (typeof cty !== "string") {
      return res.status(400).json("invalid request");
    }
    fltr = { ...fltr, from: { $regex: `${cty}`, $options: "i" } };
  }
  if (lstng) {
    if (
      typeof lstng !== "string" ||
      !["true", "false"].some((itm) => itm === lstng)
    ) {
      return res.status(400).json("invalid request");
    }
    fltr = { ...fltr, list: lstng === "true" ? true : false };
  }
  const hourly = await Hourly.find(
    fltr,
    typ === "lst"
      ? {
          _id: 0,
          from: 1,
          list: 1,
          longlat: 1,
        }
      : { _id: 0 }
  )
    .limit(entry)
    .skip(entry * (pag - 1));
  if (hourly) {
    if (hourly.length <= 0) {
      return res.status(400).json("No records found");
    }
    return res.json(hourly);
  } else {
    res.status(400).json("Some Error occured");
  }
};

// === === === add hourly package new city === === === //

exports.admn_addhrlycty = async (req, res) => {
  let { cty, ctycode, longlat } = req.body;
  if (
    !cty ||
    !ctycode ||
    !longlat ||
    typeof cty !== "string" ||
    typeof ctycode !== "string" ||
    typeof longlat !== "string"
  ) {
    return res.status(400).json("invalid request");
  }
  const iscity = await City.findOne({
    cityname: cty,
    citycode: ctycode,
    longlat,
  });
  if (!iscity) {
    return res.status(404).json("invalid city selected");
  }
  const ispackage = await Hourly.findOne({ fromcode: ctycode });
  if (ispackage) {
    return res.status(400).json("City already exist");
  }
  let nwpackage = new Hourly({
    from: cty,
    fromcode: ctycode,
    longlat,
    list: false,
    count: 0,
  });
  let result = await nwpackage.save();
  if (result) {
    return res.status(201).json("Added Successfully");
  } else {
    return res.status(500).json("error occurred");
  }
};
// === === === update listing hrly === === === //

exports.admn_ulh = async (req, res) => {
  let { cty, ctycode, longlat, lstng } = req.body;
  if (
    !cty ||
    !ctycode ||
    !longlat ||
    !lstng ||
    typeof cty !== "string" ||
    typeof ctycode !== "string" ||
    typeof longlat !== "string" ||
    typeof lstng !== "string" ||
    !["true", "false"].some((itm) => itm === lstng)
  ) {
    return res.status(400).json("invalid request");
  }
  const upd = await Hourly.updateOne(
    { cty, ctycode, longlat },
    { list: lstng === "true" ? true : false }
  );
  if (upd) {
    return res.status(201).json("Listing updated successfully");
  } else {
    return res.status(400).json("Invalid Request");
  }
};

// === === === hourly package add === === === /
exports.admn_addhrlypackage = async (req, res) => {
  let {
    city,
    citycode,
    longlat,
    actn,
    name,
    eqvcab,
    pakg,
    regamt,
    totalamt,
    gst,
    driverad,
    adv,
    avil,
    oprtramt,
    minbd,
  } = req.body;
  if (
    !actn ||
    typeof actn !== "string" ||
    !["nw", "edt"].some((itm) => itm === actn) ||
    !city ||
    !citycode ||
    !longlat ||
    typeof city !== "string" ||
    typeof citycode !== "string" ||
    typeof longlat !== "string"
  ) {
    return res.status(400).json("invalid request");
  }
  const ishrlycty = await Hourly.findOne({
    from: city,
    fromcode: citycode,
    longlat,
  });
  if (!ishrlycty) {
    return res.status(400).json("invalid request");
  }
  let results = ishrlycty.results;
  let pkg;
  let stts;
  const bools = ["true", "false"];
  if (
    !name ||
    !eqvcab ||
    !pakg ||
    typeof name !== "string" ||
    typeof eqvcab !== "string" ||
    typeof pakg !== "string" ||
    !bools.some((itm) => itm === eqvcab)
  ) {
    return res.status(400).json("Invalid request");
  }
  let tve = eqvcab === "true" ? true : false;
  let tvh = pakg === "typ1" ? 4 : pakg === "typ2" ? 8 : 12;
  let tvd = pakg === "typ1" ? 40 : pakg === "typ2" ? 80 : 120;
  if (actn === "edt") {
    if (
      !results.some(
        (itm) =>
          itm.name === name &&
          itm.distance === tvd &&
          itm.hour === tvh &&
          itm.equivalent.isequi === tve
      )
    ) {
      return res.status(400).json("Invalid request");
    }
    let toedt = results.filter(
      (itm) =>
        itm.name === name &&
        itm.distance === tvd &&
        itm.hour === tvh &&
        itm.equivalent.isequi === tve
    )[0];
    pkg = {
      _id: toedt._id,
      ind: toedt.ind,
      name: toedt.name,
      zero: toedt.zero,
      distance: toedt.distance,
      hour: toedt.hour,
      isavilable: toedt.isavilable,
      category: toedt.category,
      group_id: toedt.group_id,
      cab_id: toedt.cab_id,
      rdr: toedt.rdr,
      minchrg: toedt.minchrg,
      equivalent: toedt.equivalent,
      regularamount: toedt.regularamount,
      offerprice: toedt.offerprice,
      othercharges: toedt.othercharges,
      totalpayable: toedt.totalpayable,
      oprtramt: toedt.oprtramt,
    };
  } else {
    if (
      results.some(
        (itm) =>
          itm.name === name &&
          itm.distance === tvd &&
          itm.hour === tvh &&
          itm.equivalent.isequi === tve
      )
    ) {
      return res.status(400).json("Package already exist");
    }
    stts = await Stats.findOne({}, { _id: 0, package: 1 });
    const iscab = await Cabmod.findOne({ name }, { _id: 0 });
    if (!iscab) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      _id: `pkgh-${10001 + stts.package.count}`,
      ind: ishrlycty.count,
      name: iscab.name,
      category: iscab.category,
      cab_id: iscab.cab_id,
      group_id: iscab.group_id,
      rdr: iscab.rdr,
      hour: tvh,
      distance: tvd,
      othercharges: {
        Tolltaxes: {
          isinclude: false,
        },
        Night: {
          amount: iscab.charge.night,
        },
        Extrakm: {
          amount: iscab.charge.roundtrip,
        },
        Extrahour: {
          amount: iscab.charge.extrahour,
        },
        Driveraid: {
          amount: iscab.charge.driveraid,
        },
      },
    };
    if (eqvcab === "true") {
      const eqvcabs = await Cabmod.find(
        {
          name: { $ne: iscab.name },
          group_id: iscab.group_id,
        },
        { name: 1, _id: 0 }
      ).limit(5);
      let eqvstr = "";
      eqvcabs.map((itm, i) => {
        return (eqvstr = eqvstr.concat(
          i === 0 ? `${itm.name}` : `, ${itm.name}`
        ));
      });
      pkg = { ...pkg, equivalent: { isequi: true, txt: eqvstr } };
    } else {
      pkg = { ...pkg, equivalent: { isequi: false } };
    }
    if (pkg === "typ1") {
      pkg = { ...pkg, distance: 40, hour: 4 };
    } else if (pkg === "typ2") {
      pkg = { ...pkg, distance: 80, hour: 8 };
    } else if (pkg === "typ3") {
      pkg = { ...pkg, distance: 120, hour: 12 };
    }
    if (
      !regamt ||
      !totalamt ||
      !gst ||
      !driverad ||
      !adv ||
      !avil ||
      !oprtramt ||
      !minbd
    ) {
      return res.status(400).json("invalid request");
    }
  }
  if (regamt) {
    if (typeof regamt !== "number" || isNaN(regamt)) {
      return res.status(400).json("invalid request");
    }
    pkg = { ...pkg, regularamount: regamt };
  }
  if (totalamt) {
    if (typeof totalamt !== "number" || isNaN(totalamt)) {
      return res.status(400).json("invalid request");
    }
    pkg = { ...pkg, totalpayable: totalamt };
  }
  if (gst) {
    if (typeof gst !== "string" || !bools.some((itm) => itm === gst)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      "othercharges.GST.isinclude": gst === "true" ? true : false,
    };
  }
  if (driverad) {
    if (
      typeof driverad !== "string" ||
      !bools.some((itm) => itm === driverad)
    ) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      "othercharges.Driveraid.isinclude": driverad === "true" ? true : false,
    };
  }
  if (adv) {
    if (typeof adv !== "string" || !bools.some((itm) => itm === adv)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      zero: adv === "true" ? true : false,
    };
  }
  if (avil) {
    if (typeof avil !== "string" || !bools.some((itm) => itm === avil)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      isavilable: avil === "true" ? true : false,
    };
  }
  if (oprtramt) {
    if (typeof oprtramt !== "number" || isNaN(oprtramt)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      oprtramt: oprtramt,
    };
  }
  if (minbd) {
    if (typeof minbd !== "number" || isNaN(minbd)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      minchrg: minbd,
    };
  }
  let upd;
  if (actn === "nw") {
    results.push(pkg);
    upd = { results, count: ishrlycty.count + 1 };
  } else {
    results[pkg.ind] = pkg;
    upd = { results };
  }
  let updres = await Hourly.updateOne(
    {
      from: city,
      fromcode: citycode,
      longlat: longlat,
    },
    upd
  );
  if (updres) {
    if (actn === "nw") {
      const sttsup = await Stats.updateOne(
        {},
        { "package.count": stts.package.count + 1 }
      );
    }
    return res.status(201).json(pkg);
  } else {
    return res.status(400).json("invalid request");
  }
};

// === === === cab model lstr === === === //

const Cabmod = require("../models/cabmodel");
exports.admn_listcabmod = async (req, res) => {
  let { name, category, typ } = req.body;
  if (
    !typ ||
    typeof typ !== "string" ||
    !["lst", "dtl", "sugg"].some((itm) => itm === typ)
  ) {
    return res.status(400).json("invalid request");
  }
  if (typ === "sugg") {
    name = "";
    category = "";
  }
  let fltr = {};
  if (name) {
    if (typeof name !== "string") {
      return res.status(400).json("invalid request");
    }
    fltr = { ...fltr, name: { $regex: `${name}`, $options: "i" } };
  }
  if (category) {
    if (
      typeof category !== "string" ||
      !["Hatchback", "Sedan", "Muv", "Suv"].some((itm) => itm === category)
    ) {
      return res.status(400).json("invalid request");
    }
    fltr = { ...fltr, category };
  }
  const models = await Cabmod.find(fltr, { _id: 0 });
  if (models) {
    if (models.length <= 0) {
      return res.status(400).json("No records found");
    }
    return res.json(models);
  } else {
    res.status(400).json("Some Error occured");
  }
};

// === === === add cab model === === === //

const mime = require("mime");

exports.admn_addcabmodel = async (req, res) => {
  let {
    name,
    category,
    rdr,
    oneway,
    roundtrip,
    extrahr,
    driveraid,
    night,
    modimg,
  } = req.body;
  if (
    !name ||
    !category ||
    !rdr ||
    !oneway ||
    !roundtrip ||
    !extrahr ||
    !night ||
    !modimg ||
    typeof name !== "string" ||
    typeof category !== "string" ||
    typeof oneway !== "string" ||
    typeof roundtrip !== "string" ||
    typeof extrahr !== "string" ||
    typeof rdr !== "string" ||
    typeof night !== "string" ||
    typeof modimg !== "string" ||
    ![
      "Hatchback",
      "Sedan",
      "Muv",
      "Suv",
      "Prime Hatchback",
      "Prime Sedan",
      "Prime Muv",
      "Prime Suv",
    ].some((itm) => itm === category) ||
    !["3", "4", "5", "6", "7"].some((itm) => itm === rdr) ||
    isNaN(rdr) ||
    isNaN(oneway) ||
    isNaN(roundtrip) ||
    isNaN(extrahr)
  ) {
    return res.status(400).json("Invalid request");
  }
  const catg = [
    { category: "Hatchback", group_id: 11 },
    { category: "Prime Hatchback", group_id: 12 },
    { category: "Sedan", group_id: 21 },
    { category: "Prime Sedan", group_id: 22 },
    { category: "Muv", group_id: 31 },
    { category: "Prime Muv", group_id: 32 },
    { category: "Suv", group_id: 41 },
    { category: "Prime Suv", group_id: 42 },
  ];
  name = name.charAt(0).toUpperCase().concat(name.slice(1).toLowerCase());
  const iscab = await Cabmod.findOne({ name, category });
  if (iscab) {
    return res.status(400).json("Model already exist");
  }
  let [catedata] = catg.filter((itm) => itm.category === category);

  const uploadimage = (imagedata, name) => {
    let paths = "../public/images/car/";
    var matches = imagedata.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
      response = {};

    if (matches.length !== 3) {
      return { result: false, message: "Invalid input String" };
    }

    response.type = matches[1];
    response.data = Buffer.from(matches[2], "base64");
    let decodedImg = response;
    let imageBuffer = decodedImg.data;
    let type = decodedImg.type;
    let extension = mime.extension(type);
    if (extension !== "png") {
      return { result: false, message: "Please provide a png file only" };
    }
    let fileName = `${name}.` + "png";
    fs.writeFileSync(
      path.join(__dirname, paths, fileName),
      imageBuffer,
      "utf8"
    );
    return { result: true, message: "successfully uploaded", name: fileName };
  };
  const cabup = uploadimage(modimg, name);
  if (!cabup.result) {
    return res.status(400).json("failed to upload the image");
  }
  const stts = await Stats.findOne({}, { _id: 0, models: 1 });
  if (!stts) {
    return res.status(400).json("Please try again later");
  }
  const cabmod = new Cabmod({
    name,
    category: catedata.category,
    group_id: catedata.group_id,
    cab_id: stts.models.count + 1001,
    rdr: rdr * 1,
    charge: {
      oneway: oneway * 1,
      roundtrip: roundtrip * 1,
      night: night * 1,
      extrahour: extrahr * 1,
      driveraid: driveraid * 1,
    },
  });
  const result = await cabmod.save();
  if (result) {
    let statup = await Stats.updateOne(
      {},
      { "models.count": stts.models.count + 1 }
    );
    return res.status(201).json("Added successfully");
  } else {
    return res.status(400).json("Invalid request");
  }
};

//  === === === update cab model === === === //

exports.admn_upcabmodel = async (req, res) => {
  const {
    name,
    category,
    oneway,
    roundtrip,
    night,
    driveraid,
    extrahr,
    modimg,
  } = req.body;
  if (
    !name ||
    !category ||
    typeof name !== "string" ||
    typeof category !== "string" ||
    ![
      "Hatchback",
      "Sedan",
      "Muv",
      "Suv",
      "Prime Hatchback",
      "Prime Sedan",
      "Prime Muv",
      "Prime Suv",
    ].some((itm) => itm === category)
  ) {
    return res.status(400).json("Invalid request");
  }
  const iscab = await Cabmod.findOne({ name, category });
  if (!iscab) {
    return res.status(400).json("Invalid cab model");
  }
  let updt = {};
  if (oneway) {
    if (typeof oneway !== "string" || isNaN(oneway)) {
      return res.status(400).json("Please enter a valid oneway charge");
    }
    updt = { ...updt, "charge.oneway": oneway * 1 };
  }
  if (extrahr) {
    if (typeof extrahr !== "string" || isNaN(extrahr)) {
      return res.status(400).json("Please enter a valid Wating charge");
    }
    updt = { ...updt, "charge.extrahour": extrahr * 1 };
  }
  if (roundtrip) {
    if (typeof roundtrip !== "string" || isNaN(roundtrip)) {
      return res.status(400).json("Please enter a valid roundtrip charge");
    }
    updt = { ...updt, "charge.roundtrip": roundtrip * 1 };
  }
  if (night) {
    if (typeof night !== "string" || isNaN(night)) {
      return res.status(400).json("Please enter a valid night charge");
    }
    updt = { ...updt, "charge.night": night * 1 };
  }
  if (driveraid) {
    if (typeof driveraid !== "string" || isNaN(driveraid)) {
      return res.status(400).json("Please enter a valid Driver aid charge");
    }
    updt = { ...updt, "charge.driveraid": driveraid * 1 };
  }
  const uploadimage = (imagedata, name) => {
    let paths = "../public/images/car/";
    var matches = imagedata.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
      response = {};

    if (matches.length !== 3) {
      return { result: false, message: "Invalid input String" };
    }

    response.type = matches[1];
    response.data = Buffer.from(matches[2], "base64");
    let decodedImg = response;
    let imageBuffer = decodedImg.data;
    let type = decodedImg.type;
    let extension = mime.extension(type);
    if (extension !== "png") {
      return { result: false, message: "Please provide a png file only" };
    }
    let fileName = `${name}.` + "png";
    fs.writeFileSync(
      path.join(__dirname, paths, fileName),
      imageBuffer,
      "utf8"
    );
    return { result: true, message: "successfully uploaded", name: fileName };
  };
  if (modimg) {
    const cabup = uploadimage(modimg, iscab.name);
    if (!cabup.result) {
      return res.status(400).json("failed to upload the image");
    }
  }
  const result = await Cabmod.updateOne(
    {
      name: iscab.name,
      category: iscab.category,
    },
    updt
  );
  if (result) {
    return res.status(201).json("Updated successfully");
  } else {
    return res.status(400).json("Invalid request");
  }
};

// === === === list outstation === === === //
const outstation = require("../models/client/rates");
exports.admn_listoutsttn = async (req, res) => {
  let { cty, lstng, entry, pag, typ, tocode, fromcode } = req.body;
  if (
    !entry ||
    typeof entry !== "string" ||
    !pag ||
    typeof pag !== "string" ||
    !typ ||
    typeof typ !== "string" ||
    !["lst", "dtl"].some((itm) => itm === typ)
  ) {
    return res.status(400).json("invalid request");
  } else {
    entry = entry * 10;
    pag = pag * 1;
  }
  let fltr = {};
  if (cty) {
    if (typeof cty !== "string") {
      return res.status(400).json("invalid request");
    }
    fltr = {
      ...fltr,
      $or: [
        { from: { $regex: `${cty}`, $options: "i" } },
        { to: { $regex: `${cty}`, $options: "i" } },
      ],
    };
  }
  if (lstng) {
    if (
      typeof lstng !== "string" ||
      !["true", "false"].some((itm) => itm === lstng)
    ) {
      return res.status(400).json("invalid request");
    }
    fltr = { ...fltr, list: lstng === "true" ? true : false };
  }
  if (typ === "dtl") {
    if (
      !fromcode ||
      !tocode ||
      !lstng ||
      typeof fromcode !== "string" ||
      typeof tocode !== "string" ||
      typeof lstng !== "string" ||
      !["true", "false"].some((itm) => itm === lstng) ||
      isNaN(fromcode) ||
      isNaN(tocode)
    ) {
      return res.status(400).json("invalid request");
    }
    fltr = { tocode, fromcode, list: lstng === "true" ? true : false };
  }
  const outstn = await outstation
    .find(
      fltr,
      typ === "lst"
        ? {
            _id: 0,
            from: 1,
            fromcode: 1,
            to: 1,
            tocode: 1,
            list: 1,
            fromlonglat: 1,
            tolonglat: 1,
          }
        : { _id: 0 }
    )
    .limit(entry)
    .skip(entry * (pag - 1));
  if (outstn) {
    if (outstn.length <= 0) {
      return res.status(400).json("No records found");
    }
    return res.json(outstn);
  } else {
    res.status(400).json("Some Error occured");
  }
};

// === === === add route === === === //

exports.admn_addoutsttn = async (req, res) => {
  let { from, fromcode, fromlonglat, to, tocode, tolonglat } = req.body;
  if (
    !from ||
    !fromcode ||
    !fromlonglat ||
    !to ||
    !tocode ||
    !tolonglat ||
    typeof from !== "string" ||
    typeof fromcode !== "string" ||
    typeof fromlonglat !== "string" ||
    typeof to !== "string" ||
    typeof tocode !== "string" ||
    typeof tolonglat !== "string" ||
    isNaN(tocode) ||
    isNaN(fromcode)
  ) {
    return res.status(400).json("invalid request");
  }
  const iscity = await City.find({
    $or: [
      { cityname: from, citycode: fromcode, longlat: fromlonglat },
      { cityname: to, citycode: tocode, longlat: tolonglat },
    ],
  });
  if (!iscity) {
    return res.status(404).json("invalid city selected");
  } else if (iscity.length < 2) {
    return res.status(404).json("invalid request");
  }
  const isroute = await outstation.findOne({ fromcode, tocode });
  if (isroute) {
    return res.status(400).json("Route already exist");
  }
  let nwroute = new outstation({
    from,
    fromcode,
    fromlonglat,
    to,
    tocode,
    tolonglat,
    list: false,
    onecount: 0,
    roundcount: 0,
  });
  let result = await nwroute.save();
  if (result) {
    return res.status(201).json("Added Successfully");
  } else {
    return res.status(500).json("error occurred");
  }
};

// === === === outstation update === === === //
exports.admn_updoutstn = async (req, res) => {
  let { fromcode, tocode, lstng } = req.body;
  if (
    !fromcode ||
    !tocode ||
    !lstng ||
    typeof fromcode !== "string" ||
    typeof tocode !== "string" ||
    typeof lstng !== "string" ||
    !["true", "false"].some((itm) => itm === lstng)
  ) {
    return res.status(400).json("invalid request");
  }
  const upd = await outstation.updateOne(
    { fromcode, tocode },
    { list: lstng === "true" ? true : false }
  );
  if (upd) {
    return res.status(201).json("Listing updated successfully");
  } else {
    return res.status(400).json("Invalid Request");
  }
};

// === === === add outstation package === === === //

exports.admn_addoutpackage = async (req, res) => {
  let {
    from,
    fromcode,
    to,
    tocode,
    longlat,
    actn,
    name,
    eqvcab,
    regamt,
    totalamt,
    gst,
    driverad,
    adv,
    avil,
    oprtramt,
    minbd,
    distance,
    hours,
    bsfr,
    sttx,
    sttxamt,
  } = req.body;
  if (
    !actn ||
    typeof actn !== "string" ||
    !["nw", "edt"].some((itm) => itm === actn) ||
    !from ||
    !fromcode ||
    !to ||
    !tocode ||
    typeof from !== "string" ||
    typeof fromcode !== "string" ||
    typeof to !== "string" ||
    typeof tocode !== "string"
  ) {
    return res.status(400).json("invalid request");
  }
  const isroute = await outstation.findOne({
    from,
    fromcode,
    to,
    tocode,
  });
  if (!isroute) {
    return res.status(400).json("invalid request");
  }
  let results = isroute.results;
  let pkg;
  let stts;
  const bools = ["true", "false"];
  if (
    !name ||
    !eqvcab ||
    typeof name !== "string" ||
    typeof eqvcab !== "string" ||
    !bools.some((itm) => itm === eqvcab)
  ) {
    return res.status(400).json("Invalid request");
  }
  let tve = eqvcab === "true" ? true : false;
  if (actn === "edt") {
    if (
      !results.some((itm) => itm.name === name && itm.equivalent.isequi === tve)
    ) {
      return res.status(400).json("Invalid request");
    }
    let toedt = results.filter(
      (itm) => itm.name === name && itm.equivalent.isequi === tve
    )[0];
    pkg = {
      _id: toedt._id,
      ind: toedt.ind,
      name: toedt.name,
      zero: toedt.zero,
      distance: toedt.distance,
      hours: toedt.hours,
      isavilable: toedt.isavilable,
      category: toedt.category,
      group_id: toedt.group_id,
      cab_id: toedt.cab_id,
      rdr: toedt.rdr,
      minchrg: toedt.minchrg,
      equivalent: toedt.equivalent,
      regularamount: toedt.regularamount,
      offerprice: toedt.offerprice,
      basefare: toedt.basefare,
      othercharges: toedt.othercharges,
      totalpayable: toedt.totalpayable,
      oprtramt: toedt.oprtramt,
    };
  } else {
    if (
      results.some((itm) => itm.name === name && itm.equivalent.isequi === tve)
    ) {
      return res.status(400).json("Package already exist");
    }
    stts = await Stats.findOne({}, { _id: 0, package: 1 });
    const iscab = await Cabmod.findOne({ name }, { _id: 0 });
    if (!iscab) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      _id: `pkgh-${10001 + stts.package.count}`,
      ind: isroute.onecount,
      name: iscab.name,
      category: iscab.category,
      cab_id: iscab.cab_id,
      group_id: iscab.group_id,
      rdr: iscab.rdr,
      othercharges: {
        Night: {
          amount: iscab.charge.night,
        },
        Extrakm: {
          amount: iscab.charge.roundtrip,
        },
        Extrahour: {
          amount: iscab.charge.extrahour,
        },
        Driveraid: {
          amount: iscab.charge.driveraid,
        },
      },
    };
    if (eqvcab === "true") {
      const eqvcabs = await Cabmod.find(
        {
          name: { $ne: iscab.name },
          group_id: iscab.group_id,
        },
        { name: 1, _id: 0 }
      ).limit(5);
      let eqvstr = "";
      eqvcabs.map((itm, i) => {
        return (eqvstr = eqvstr.concat(
          i === 0 ? `${itm.name}` : `, ${itm.name}`
        ));
      });
      pkg = { ...pkg, equivalent: { isequi: true, txt: eqvstr } };
    } else {
      pkg = { ...pkg, equivalent: { isequi: false } };
    }

    if (
      !regamt ||
      !totalamt ||
      !gst ||
      !distance ||
      !hours ||
      !driverad ||
      !adv ||
      !avil ||
      !oprtramt ||
      !minbd ||
      !bsfr ||
      !sttx
    ) {
      return res.status(400).json("invalid request");
    }
  }
  if (distance) {
    if (typeof distance !== "number" || isNaN(distance)) {
      return res.status(400).json("invalid request");
    }
    pkg = { ...pkg, distance };
  }
  if (hours) {
    if (typeof hours !== "number" || isNaN(distance)) {
      return res.status(400).json("invalid request");
    }
    pkg = { ...pkg, hours };
  }
  if (bsfr) {
    if (typeof bsfr !== "number" || isNaN(bsfr)) {
      return res.status(400).json("invalid request");
    }
    pkg = { ...pkg, basefare: bsfr };
  }
  if (sttx) {
    if (typeof sttx !== "string" || !bools.some((itm) => itm === sttx)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      "othercharges.Tolltaxes.isinclude": sttx === "true" ? true : false,
    };
  }
  if (sttxamt) {
    if (typeof sttxamt !== "string") {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      "othercharges.Tolltaxes.amount": sttxamt,
    };
  }
  if (regamt) {
    if (typeof regamt !== "number" || isNaN(regamt)) {
      return res.status(400).json("invalid request");
    }
    pkg = { ...pkg, regularamount: regamt };
  }
  if (totalamt) {
    if (typeof totalamt !== "number" || isNaN(totalamt)) {
      return res.status(400).json("invalid request");
    }
    pkg = { ...pkg, totalpayable: totalamt };
  }
  if (gst) {
    if (typeof gst !== "string" || !bools.some((itm) => itm === gst)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      "othercharges.GST.isinclude": gst === "true" ? true : false,
    };
  }
  if (driverad) {
    if (
      typeof driverad !== "string" ||
      !bools.some((itm) => itm === driverad)
    ) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      "othercharges.Driveraid.isinclude": driverad === "true" ? true : false,
    };
  }
  if (adv) {
    if (typeof adv !== "string" || !bools.some((itm) => itm === adv)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      zero: adv === "true" ? true : false,
    };
  }
  if (avil) {
    if (typeof avil !== "string" || !bools.some((itm) => itm === avil)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      isavilable: avil === "true" ? true : false,
    };
  }
  if (oprtramt) {
    if (typeof oprtramt !== "number" || isNaN(oprtramt)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      oprtramt: oprtramt,
    };
  }
  if (minbd) {
    if (typeof minbd !== "number" || isNaN(minbd)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      minchrg: minbd,
    };
  }

  let upd;
  if (actn === "nw") {
    results.push(pkg);
    upd = { results, onecount: isroute.onecount + 1 };
  } else {
    results[pkg.ind] = pkg;
    upd = { results };
  }
  let updres = await outstation.updateOne(
    {
      from,
      fromcode,
      to,
      tocode,
    },
    upd
  );
  if (updres) {
    if (actn === "nw") {
      const sttsup = await Stats.updateOne(
        {},
        { "package.count": stts.package.count + 1 }
      );
    }
    return res.status(201).json(pkg);
  } else {
    return res.status(400).json("invalid request");
  }
};

// === === === add outstation package roundtrip === === === //

exports.admn_addoutpackageround = async (req, res) => {
  let {
    from,
    fromcode,
    to,
    tocode,
    actn,
    name,
    eqvcab,
    gst,
    driverad,
    adv,
    avil,
    bsfr,
    sttx,
    sttxamt,
    expand,
    dayrates,
  } = req.body;
  if (
    !actn ||
    typeof actn !== "string" ||
    !["nw", "edt"].some((itm) => itm === actn) ||
    !from ||
    !fromcode ||
    !to ||
    !tocode ||
    typeof from !== "string" ||
    typeof fromcode !== "string" ||
    typeof to !== "string" ||
    typeof tocode !== "string"
  ) {
    return res.status(400).json("invalid request");
  }
  const isroute = await outstation.findOne({
    from,
    fromcode,
    to,
    tocode,
  });
  if (!isroute) {
    return res.status(400).json("invalid request");
  }
  let roundresults = isroute.roundresults;
  let pkg;
  let stts;
  const bools = ["true", "false"];
  if (
    !name ||
    !eqvcab ||
    typeof name !== "string" ||
    typeof eqvcab !== "string" ||
    !bools.some((itm) => itm === eqvcab)
  ) {
    return res.status(400).json("invalid request");
  }
  let tve = eqvcab === "true" ? true : false;
  if (actn === "edt") {
    if (
      !roundresults.some(
        (itm) => itm.name === name && itm.equivalent.isequi === tve
      )
    ) {
      return res.status(400).json("invalid request");
    }
    let toedt = roundresults.filter(
      (itm) => itm.name === name && itm.equivalent.isequi === tve
    )[0];
    pkg = {
      _id: toedt._id,
      ind: toedt.ind,
      name: toedt.name,
      zero: toedt.zero,
      isavilable: toedt.isavilable,
      category: toedt.category,
      group_id: toedt.group_id,
      cab_id: toedt.cab_id,
      rdr: toedt.rdr,
      othercharges: toedt.othercharges,
      equivalent: toedt.equivalent,
      basefare: toedt.basefare,
      expand: toedt.expand,
      dayrates: toedt.dayrates,
    };
  } else {
    if (
      roundresults.some(
        (itm) => itm.name === name && itm.equivalent.isequi === tve
      )
    ) {
      return res.status(400).json("Package already exist");
    }
    stts = await Stats.findOne({}, { _id: 0, package: 1 });
    const iscab = await Cabmod.findOne({ name }, { _id: 0 });
    if (!iscab) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      _id: `pkgh-${10001 + stts.package.count}`,
      ind: isroute.roundcount,
      name: iscab.name,
      category: iscab.category,
      cab_id: iscab.cab_id,
      group_id: iscab.group_id,
      rdr: iscab.rdr,
      othercharges: {
        Night: {
          amount: iscab.charge.night,
        },
        Extrakm: {
          amount: iscab.charge.roundtrip,
        },
        Extrahour: {
          amount: iscab.charge.extrahour,
        },
        Driveraid: {
          amount: iscab.charge.driveraid,
        },
      },
    };
    if (eqvcab === "true") {
      const eqvcabs = await Cabmod.find(
        {
          name: { $ne: iscab.name },
          group_id: iscab.group_id,
        },
        { name: 1, _id: 0 }
      ).limit(5);
      let eqvstr = "";
      eqvcabs.map((itm, i) => {
        return (eqvstr = eqvstr.concat(
          i === 0 ? `${itm.name}` : `, ${itm.name}`
        ));
      });
      pkg = { ...pkg, equivalent: { isequi: true, txt: eqvstr } };
    } else {
      pkg = { ...pkg, equivalent: { isequi: false } };
    }

    if (
      !gst ||
      !driverad ||
      !adv ||
      !avil ||
      !bsfr ||
      !sttx ||
      !sttxamt ||
      !expand ||
      !dayrates
    ) {
      return res.status(400).json("invalid request");
    }
  }
  if (dayrates) {
    if (
      dayrates.some(
        (itm) =>
          !itm.distance ||
          !itm.day ||
          !itm.regularamount ||
          !itm.totalpayable ||
          !itm.oprtramt ||
          !itm.minchrg ||
          typeof itm.distance !== "string" ||
          typeof itm.day !== "string" ||
          typeof itm.regularamount !== "string" ||
          typeof itm.totalpayable !== "string" ||
          typeof itm.oprtramt !== "string" ||
          typeof itm.minchrg !== "string" ||
          isNaN(itm.day) ||
          isNaN(itm.distance) ||
          isNaN(itm.regularamount) ||
          isNaN(itm.totalpayable) ||
          isNaN(itm.oprtramt) ||
          isNaN(itm.minchrg)
      )
    ) {
      return res.status(400).json("invalid request");
    }
    pkg = { ...pkg, dayrates };
  }
  if (expand) {
    if (
      !expand.distance ||
      !expand.regularamount ||
      !expand.totalpayable ||
      !expand.oprtramt ||
      !expand.minchrg ||
      typeof expand.distance !== "string" ||
      typeof expand.regularamount !== "string" ||
      typeof expand.totalpayable !== "string" ||
      typeof expand.oprtramt !== "string" ||
      typeof expand.minchrg !== "string" ||
      isNaN(expand.distance) ||
      isNaN(expand.regularamount) ||
      isNaN(expand.totalpayable) ||
      isNaN(expand.oprtramt) ||
      isNaN(expand.minchrg)
    ) {
      return res.status(400).json("invalid request");
    }
    pkg = { ...pkg, expand };
  }
  if (bsfr) {
    if (typeof bsfr !== "number" || isNaN(bsfr)) {
      return res.status(400).json("invalid request");
    }
    pkg = { ...pkg, basefare: bsfr };
  }
  if (sttx) {
    if (typeof sttx !== "string" || !bools.some((itm) => itm === sttx)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      "othercharges.Tolltaxes.isinclude": sttx === "true" ? true : false,
    };
  }
  if (sttxamt) {
    if (typeof sttxamt !== "string") {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      "othercharges.Tolltaxes.amount": sttxamt,
    };
  }
  if (gst) {
    if (typeof gst !== "string" || !bools.some((itm) => itm === gst)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      "othercharges.GST.isinclude": gst === "true" ? true : false,
    };
  }
  if (driverad) {
    if (
      typeof driverad !== "string" ||
      !bools.some((itm) => itm === driverad)
    ) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      "othercharges.Driveraid.isinclude": driverad === "true" ? true : false,
    };
  }
  if (adv) {
    if (typeof adv !== "string" || !bools.some((itm) => itm === adv)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      zero: adv === "true" ? true : false,
    };
  }
  if (avil) {
    if (typeof avil !== "string" || !bools.some((itm) => itm === avil)) {
      return res.status(400).json("invalid request");
    }
    pkg = {
      ...pkg,
      isavilable: avil === "true" ? true : false,
    };
  }

  let upd;
  if (actn === "nw") {
    roundresults.push(pkg);
    upd = { roundresults, onecount: isroute.roundcount + 1 };
  } else {
    roundresults[pkg.ind] = pkg;
    upd = { roundresults };
  }
  let updres = await outstation.updateOne(
    {
      from,
      fromcode,
      to,
      tocode,
    },
    upd
  );
  if (updres) {
    if (actn === "nw") {
      const sttsup = await Stats.updateOne(
        {},
        { "package.count": stts.package.count + 1 }
      );
    }
    return res.status(201).json(pkg);
  } else {
    return res.status(400).json("invalid request");
  }
};

// === === === list tour package === === === //

const Tour = require("../models/client/package");

exports.admn_listToupac = async (req, res) => {
  let { cty, id, entry, pag, typ, url } = req.body;
  if (
    !entry ||
    typeof entry !== "string" ||
    !pag ||
    typeof pag !== "string" ||
    !typ ||
    typeof typ !== "string" ||
    !["lst", "dtl"].some((itm) => itm === typ)
  ) {
    return res.status(400).json("invalid request");
  } else {
    entry = entry * 10;
    pag = pag * 1;
  }
  let fltr = {};

  if (cty) {
    if (typeof cty !== "string") {
      return res.status(400).json("invalid request");
    }
    fltr = {
      ...fltr,
      "citys.cityname": cty,
    };
  }
  if (id) {
    if (typeof id !== "string") {
      return res.status(400).json("invalid request");
    }
    fltr = { ...fltr, id: id };
  }
  if (typ === "dtl") {
    if (!url || typeof url !== "string" || !id) {
      return res.status(400).json("invalid request");
    }
    fltr = { ...fltr, url: url };
  }
  const tor = await Tour.find(
    fltr,
    typ === "dtl"
      ? { _id: 0, "plan._id": 0, "citys._id": 0 }
      : { _id: 0, plan: 0, citys: 0, bnrimg: 0 }
  )
    .limit(entry)
    .skip(entry * (pag - 1));
  if (tor) {
    if (tor.length <= 0) {
      return res.status(400).json("No records found");
    }
    return res.json(tor);
  } else {
    res.status(400).json("Some Error occured");
  }
};

// === === === add tour package === === === //

exports.admn_addtour = async (req, res) => {
  let { name, plan, citys, days, nights, bnrimg, title, description } =
    req.body;
  if (
    !name ||
    !plan ||
    !citys ||
    !days ||
    !nights ||
    !bnrimg ||
    !title ||
    !description ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof name !== "string" ||
    typeof days !== "string" ||
    typeof nights !== "string" ||
    description.length > 170 ||
    title.length > 70
  ) {
    return alert("please input all fields");
  }
  if (
    plan.some(
      (itm) =>
        !itm.day ||
        !itm.title ||
        !itm.description ||
        typeof itm.day !== "string" ||
        typeof itm.title !== "string" ||
        typeof itm.description !== "string" ||
        isNaN(itm.day)
    )
  ) {
    return res.status(400).json("invalid request");
  }
  if (
    citys.some(
      (itm) =>
        !itm.cityname ||
        !itm.citycode ||
        typeof itm.citycode !== "string" ||
        typeof itm.cityname !== "string" ||
        isNaN(itm.citycode)
    )
  ) {
    return res.status(400).json("invalid request");
  }
  let citydat = [];
  citys.map((itm) => {
    citydat = [...citydat, { cityname: itm.cityname, citycode: itm.citycode }];
    return;
  });
  const iscity = await City.find(
    { $or: citydat },
    { cityname: 1, citycode: 1, _id: 0 }
  );
  if (citys.length !== iscity.length) {
    return res.status(400).json("Invalid city data ");
  }
  let url = "";
  iscity.map((itm, i) => {
    let cityname = itm.cityname;
    if (i === 0) {
      return (url = cityname.split(",")[0]);
    } else if (i <= iscity.length) {
      return (url = url.concat(`-${cityname.split(",")[0]}`));
    }
  });

  if (nights * 1 > 0) {
    url = url.concat(`-${days}-day-${nights}-night`);
  } else {
    url = url.concat(`-${days}-day`);
  }
  const uploadimage = (imagedata, name) => {
    let paths = "../public/images/tour/";
    var matches = imagedata.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
      response = {};

    if (matches.length !== 3) {
      return { result: false, message: "Invalid input String" };
    }

    response.type = matches[1];
    response.data = Buffer.from(matches[2], "base64");
    let decodedImg = response;
    let imageBuffer = decodedImg.data;
    let type = decodedImg.type;
    let extension = mime.extension(type);
    if (extension !== "png" && extension !== "jpg" && extension !== "jpeg") {
      return { result: false, message: "Please provide a png file only" };
    }
    let fileName = `${name}.` + "png";
    fs.writeFileSync(
      path.join(__dirname, paths, fileName),
      imageBuffer,
      "utf8"
    );
    return { result: true, message: "successfully uploaded", name: fileName };
  };
  let stts = await Stats.findOne({}, { _id: 0, tour: 1 });
  const id = "tour-".concat(1000 + stts.tour.count);
  let iname = name.concat(1000 + stts.tour.count);
  const cabup = uploadimage(bnrimg, iname);
  if (!cabup.result) {
    return res.status(400).json("failed to upload the image");
  }
  const tosave = new Tour({
    id,
    citys: iscity,
    plan,
    days: days * 1,
    nights: nights * 1,
    bnrimg: "/tour/".concat(cabup.name),
    name,
    url,
    meta: {
      title,
      description,
    },
  });
  const result = await tosave.save();
  if (result) {
    let updtst = await Stats.updateOne({
      "tour.count": stts.tour.count + 1,
    });
    return res.status(201).json("Added Successfully");
  } else {
    return res.status(500).json("error occurred");
  }
};

// === === === update tour === === === //

exports.admn_updatetour = async (req, res) => {
  let { name, plan, citys, days, nights, bnrimg, id, url, title, description } =
    req.body;
  if (
    !name ||
    !plan ||
    !citys ||
    !days ||
    !nights ||
    !id ||
    !url ||
    !title ||
    !description ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof name !== "string" ||
    typeof days !== "string" ||
    typeof nights !== "string" ||
    typeof id !== "string" ||
    typeof url !== "string" ||
    isNaN(days) ||
    isNaN(nights)
  ) {
    return res.status(400).json("please input all fields");
  }
  const istour = await Tour.findOne(
    { id, url },
    { _id: 0, "plan._id": 0, "citys._id": 0 }
  );
  if (!istour) {
    return res.status(400).json("invalid request1");
  }
  if (
    Math.abs(days * 1 - nights * 1) !== 0 &&
    Math.abs(days * 1 - nights * 1) !== 1
  ) {
    return res.status(400).json("invalid request2");
  }
  let updt = {};
  if (name !== istour.name) {
    updt = { ...updt, name };
  }
  if (days * 1 !== istour.days) {
    updt = { ...updt, days };
  }
  let templan = [];
  plan.map((itm, i) => {
    return (templan[i] = {
      day: itm.day * 1,
      title: itm.title,
      description: itm.description,
    });
  });
  if (JSON.stringify(templan) !== JSON.stringify(istour.plan)) {
    if (
      plan.some(
        (itm) =>
          !itm.day ||
          !itm.title ||
          !itm.description ||
          typeof itm.day !== "string" ||
          typeof itm.title !== "string" ||
          typeof itm.description !== "string" ||
          isNaN(itm.day)
      )
    ) {
      return res.status(400).json("invalid request3");
    }
    updt = { ...updt, plan };
  }

  let iscity;
  if (JSON.stringify(citys) !== JSON.stringify(istour.citys)) {
    if (
      citys.some(
        (itm) =>
          !itm.cityname ||
          !itm.citycode ||
          typeof itm.citycode !== "string" ||
          typeof itm.cityname !== "string" ||
          isNaN(itm.citycode)
      )
    ) {
      return res.status(400).json("invalid request4");
    }
    let citydat = [];
    citys.map((itm) => {
      citydat = [
        ...citydat,
        { cityname: itm.cityname, citycode: itm.citycode },
      ];
      return;
    });
    iscity = await City.find(
      { $or: citydat },
      { cityname: 1, citycode: 1, _id: 0 }
    );
    if (citys.length !== iscity.length) {
      return res.status(400).json("Invalid city data ");
    }
    updt = { ...updt, citys: iscity };
  }
  if (
    JSON.stringify(citys) !== JSON.stringify(istour.citys) ||
    days * 1 !== istour.days ||
    nights * 1 !== istour.nights
  ) {
    let url = "";
    iscity.map((itm, i) => {
      let cityname = itm.cityname;
      if (i === 0) {
        return (url = cityname.split(",")[0]);
      } else if (i <= iscity.length) {
        return (url = url.concat(`-${cityname.split(",")[0]}`));
      }
    });
    if (nights * 1 > 0) {
      url = url.concat(`-${days}-day-${nights}-night`);
    } else {
      url = url.concat(`-${days}-day`);
    }
    updt = { ...updt, url };
  }
  const uploadimage = (imagedata, name) => {
    let paths = "../public/images/tour/";
    var matches = imagedata.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
      response = {};

    if (matches.length !== 3) {
      return { result: false, message: "Invalid input String" };
    }

    response.type = matches[1];
    response.data = Buffer.from(matches[2], "base64");
    let decodedImg = response;
    let imageBuffer = decodedImg.data;
    let type = decodedImg.type;
    let extension = mime.extension(type);
    if (extension !== "png" && extension !== "jpg" && extension !== "jpeg") {
      return { result: false, message: "Please provide a png file only" };
    }
    let fileName = `${name}.` + "png";
    fs.writeFileSync(
      path.join(__dirname, paths, fileName),
      imageBuffer,
      "utf8"
    );
    return { result: true, message: "successfully uploaded", name: fileName };
  };
  if (bnrimg) {
    let iname = name.concat(istour.id.split("-")[1]);
    const cabup = uploadimage(bnrimg, iname);
    if (!cabup.result) {
      return res.status(400).json("failed to upload the image");
    }
    updt = { ...updt, bnrimg: "/tour/".concat(cabup.name) };
  }
  if (title !== istour.meta.title) {
    updt = { ...updt, "meta.title": title };
  }
  if (description !== istour.meta.description) {
    updt = { ...updt, "meta.description": title };
  }
  const update = await Tour.updateOne({ id, url }, updt);
  if (update) {
    return res.status(201).json("Updated successfuly");
  } else {
    return res.status(400).json("Invalid request");
  }
};
