const jwt = require("jsonwebtoken");
const Driver = require("../models/partner/Drivers");

const verify = async (req, res, next) => {
  try {
    const data = req.body;
    const token = req.cookies.drivertok;
    const match = jwt.verify(token, process.env.SECRET_KEY);
    const isuser = await Driver.findOne({
      _id: match._id,
      "tokens.token": token,
    });
    if (!isuser) {
      throw new Error("User not found");
    }
    if (!isuser.approved) {
      return res
        .status(401)
        .clearCookie("drivertok", { path: "/driver" })
        .send("Your Profile is Not Approved Please contact support");
    }
    req.token = token;
    req.user = isuser;
    req.body = data;
    next();
  } catch (err) {
    res
      .status(401)
      .clearCookie("drivertok", { path: "/driver" })
      .send("Unauthorized: No token provided");
  }
};
module.exports = verify;
