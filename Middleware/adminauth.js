const adms = require("../models/admin/adms");
const jwt = require("jsonwebtoken");
const verify = async (req, res, next) => {
  try {
    const data = req.body;
    const token = req.cookies.oceannodesmkl;
    const match = jwt.verify(token, process.env.SECRET_KEY);
    const isadmin = await adms
      .findOne({
        _id: match._id,
        "tokens.token": token,
      })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        return res.status(500).json("failed to fetch data");
      });
    if (!isadmin) {
      throw new Error("not found");
    }
    if (!isadmin.approved) {
      throw new Error("Profile not approved");
    }
    // if (!isadmin.active) {
    //   return res.status(400).json("please activate profile");
    // }
    if (isadmin.Locked.islocked) {
      throw new Error("Profile in Locked");
    }
    if (
      new Date(isadmin.Records.Date).toLocaleDateString() ===
      new Date().toLocaleDateString()
    ) {
      if (isadmin.Records.failed > 5) {
        throw new Error("Profile is Locked");
      }
    }
    let filtered = isadmin.tokens.filter((itm) => itm.token === token);
    if (!filtered[0].active) {
      return res.status(400).json("invalid request");
    }
    req.token = token;
    req.admin = isadmin;
    req.body = data;
    next();
  } catch (error) {
    res
      .status(403)
      .clearCookie("oceannodesmkl", { path: "/oceannodes" })
      .json("Unauthorized or No token provided");
  }
};
module.exports = verify;
