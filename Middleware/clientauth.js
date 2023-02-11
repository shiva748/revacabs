const jwt = require("jsonwebtoken");
const Client = require("../models/client/clientReg");

const verify = async (req, res, next) => {
  try {
    const { body, cookies: { ltk: token } } = req;
    
    if (!token || typeof token !== "string") 
      throw new Error("Unauthorized: No token provided");
    
    const { _id } = jwt.verify(token, process.env.SECRET_KEY) || {};
    
    if (!_id) 
      throw new Error("Unauthorized: No token provided");
    
    const isuser = await Client.findOne({ _id, "tokens.token": token });
    
    if (!isuser) 
      throw new Error("User not found");
    
    if (isuser.isverified === "blocked") 
      throw new Error("Your Profile has been blocked");
    
    if (isuser.isverified !== "authorised") 
      throw new Error("Please verify your profile");
    
    req.token = token;
    req.user = isuser;
    req.body = body;
    next();
  } catch (err) {
    res.status(403)
       .clearCookie("ltk")
       .json("Unauthorized: " + err.message);
  }
  
};
module.exports = verify;
