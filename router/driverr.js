const express = require("express");
const routers = express.Router();
const partnercont = require("../controller/partnercontroller");
const cookie_par = require("cookie-parser");
routers.use(cookie_par());
const verifytoken = require("../Middleware/driverauth");

// === === === driver login === === === //

routers.post("/login", partnercont.driver_login);

// === === === auto login === === === //

routers.get("/autologin", verifytoken, partnercont.driver_autolog);

// === === === driver logout === === === //

routers.get("/logout", verifytoken, partnercont.driver_logout);

// === === === driver change password === === === //

routers.put("/changepassword", verifytoken, partnercont.driver_changepass);

// === === === driver trip log === === === //

routers.post("/triplog", verifytoken, partnercont.driver_triplog);

// === === === driver start trip === === === //

routers.post("/trip/otp", verifytoken, partnercont.driver_submitkm);

// === === === driver verify and start trip === === === //

routers.post("/trip/verifyotp", verifytoken, partnercont.driver_tripotpver);

// === === === driver end trip === === === //

routers.post("/trip/end/otp", verifytoken, partnercont.driver_submitendkm);

// === === === driver verify and end the trip === === === //

routers.post("/trip/end/verifyotp", verifytoken, partnercont.driver_verandtrip);

// === === === driver profile === === === //

routers.get("/profile", verifytoken, partnercont.driver_profile);

// === === === forgot pass === === === //

routers.post("/forgot-password", partnercont.driver_forgot_pass);

// === === === reset pass === === === //

routers.post("/reset-pass", partnercont.driver_reset_pass);

// === === === resend otp === === === //

routers.post("/resend-otp", partnercont.driver_resendotp);

// === === === providing booking === === === //

routers.post("/booking", verifytoken, partnercont.partner_booking);

// === === === provide pic === === === //

routers.get("/profilepic", verifytoken, partnercont.driver_profilepic);

module.exports = routers;
