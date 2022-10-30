const jwt = require("jsonwebtoken");
const Client = require("../models/client/clientReg");

const verify = async (req, res, next) => {
  try {
    const data = req.body;
    const token = req.cookies.ltk;
    if (!token || typeof token !== "string") {
      return res.status(500).json("Unauthorized: No token provided");
    }
    const match = jwt.verify(token, process.env.SECRET_KEY);
    if (!match) {
      return res.status(500).json("Unauthorized: No token provided");
    }
    const isuser = await Client.findOne({
      _id: match._id,
      "tokens.token": token,
    });
    if (!isuser) {
      throw new Error("User not found");
    }
    if (isuser.isverified === "blocked") {
      return res.status(400).json("Your Profile has been blocked");
    }
    if (isuser.isverified !== "authorised") {
      return res.status(400).json("Please verify your profile");
    }
    req.token = token;
    req.user = isuser;
    req.body = data;
    next();
  } catch (err) {
    res.status(403).clearCookie("ltk").send("Unauthorized: No token provided");
  }
};
module.exports = verify;
