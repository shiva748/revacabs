const jwt = require("jsonwebtoken");
const Partner = require("../models/partner/Registration");

const verify = async (req, res, next) => {
  try {
    const data = req.body;
    const token = req.cookies.Partnertok;
    const match = jwt.verify(token, process.env.SECRET_KEY);
    const isuser = await Partner.findOne({
      _id: match._id,
      "tokens.token": token,
    });
    if (!isuser) {
      throw new Error("User not found");
    }
    if (!isuser.approved) {
      return res
        .status(401)
        .clearCookie("Partnertok")
        .send("Your Profile is Not Approved Please contact support");
    }
    req.token = token;
    req.user = isuser;
    req.body = data;
    next();
  } catch (err) {
    res
      .status(401)
      .clearCookie("Partnertok")
      .send("Unauthorized: No token provided");
  }
};
module.exports = verify;
