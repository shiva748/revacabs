const express = require("express");
const routers = express.Router();
const partnercont = require("../controller/partnercontroller");
const cookie_par = require("cookie-parser");
routers.use(cookie_par());
const verifytoken = require("../Middleware/partnerauth");

// === === === register route === === === //

routers.post("/register", partnercont.register_partner);

// === === === verify registration otp === === === //

routers.post("/register/verify", partnercont.ver_reg_otp);

// === === === login route === === === //

routers.post("/login", partnercont.login_partner);

// === === === autologin === === === //

routers.get("/autologin", verifytoken, partnercont.partner_autolog);

// === === === logout === === === //

routers.get("/logout", verifytoken, partnercont.partner_logout);

// === === === verify partner === === === //

routers.post("/partnerverification", verifytoken, partnercont.partner_verify);

// === === === password changed === === === //

routers.put("/changepassword", verifytoken, partnercont.partner_changepass);

// === === === my profile image === === === //

routers.get("/profilepic", verifytoken, partnercont.partner_profilepic);

// === === === Profile === === === //

routers.get("/profile", verifytoken, partnercont.partner_profile);

// === === === Bookings === === === //

routers.post("/booking", verifytoken, partnercont.partner_booking);

// === === === Driveradd === === === //

routers.post("/addriver", verifytoken, partnercont.partner_addriver);

// === === === my Driver === === === //

routers.get("/driver", verifytoken, partnercont.partner_mydriver);

// === === === get driver history === === === //

routers.post("/driver/history", verifytoken, partnercont.driver_driverhistory);

// === === === update driver == === === //

routers.post("/updatedriver", verifytoken, partnercont.partner_updatedriver);

// === === === add car === === === //

routers.post("/adcar", verifytoken, partnercont.partner_addcar);

// === === === my cars === === === //

routers.get("/car", verifytoken, partnercont.partner_mycars);

// === === === car history === === === //

routers.post("/car/history", verifytoken, partnercont.partner_carhistory);

// === === === update car === === ===//

routers.post("/updatecar", verifytoken, partnercont.partner_updatecar);

// === === === get models == === === //

routers.get("/models", verifytoken, partnercont.partner_getmodels);

// === === === partner bid === === === //

routers.post("/bid", verifytoken, partnercont.partner_bid);

// === === === partner Earning === === === //

routers.post("/earning", verifytoken, partnercont.partner_earnings);

// === === === trip log === === === //

routers.post("/triplog", verifytoken, partnercont.partner_triplog);

// === === === addign driver and car === === === //

routers.put("/assign", verifytoken, partnercont.partner_assigndc);

// === === === get driver and car === === === //
routers.get("/inventory", verifytoken, partnercont.partner_getdc);

// === === === partner forgot password === === === //

routers.post("/forgot-password", partnercont.forgot_pass);

// === === === partner reset password === === === //

routers.post("/reset-pass", partnercont.reset_pass);

// === === === resend otp === === === //

routers.post("/resend-otp", partnercont.resendotp);

// === === === penalty lstr === === === //

routers.post("/penalty", verifytoken, partnercont.partner_pnltylst);

module.exports = routers;
