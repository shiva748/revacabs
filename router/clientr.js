const express = require("express");
const routers = express.Router();
// importing controller
const clientcont = require("../controller/clientcontroller");
const paycont = require("../controller/paymentcontroller");
// importing controller end
const cookie_par = require("cookie-parser");
const { json } = require("express");
const verifytoken = require("../Middleware/clientauth");
routers.use(cookie_par());
// =========================================//

// === === === register route === === === //

//=========================================//

routers.post("/register", clientcont.register_client);

//======================================//

// === === === login route === === === //

//======================================//

routers.post("/login", clientcont.login_client);
//======================================//

// === === === forgot  === === === //
routers.post("/forgot-password", clientcont.forgot_pass);

//======================================//

// === === === reset password === === === //

//======================================//

routers.post("/reset-pass", clientcont.reset_pass);

//======================================//

// === === === autologin === === === //

//======================================//

routers.get("/autologin", verifytoken, clientcont.client_autolog);

// ======================================//

// === === === logout === === === //

// ======================================//
routers.get("/logout", verifytoken, clientcont.client_logout);

//======================================//

// === === === ongoing booking === === === //

routers.post("/booking/ongoing", verifytoken, clientcont.client_ongoing);

// === === === completed booking === === === //

routers.post("/booking/completed", verifytoken, clientcont.client_completed);
// === === === cancelled booking === === === //

routers.post("/booking/cancelled", verifytoken, clientcont.client_cancelled);

//======================================//

// === === === selectcar === === === //

//======================================//

routers.post("/selectcar", clientcont.select_car);
// ========================================//

// === === === create booking === === === //

// =======================================//

routers.post("/booking", clientcont.crt_booking);

// ========================================//

// === === === Account === === === //

// ========================================//

routers.get("/account", verifytoken, clientcont.account);

// ========================================//

// === === === update profile === === === //

// ========================================//

routers.put("/update-profile", verifytoken, clientcont.updateprofile);

//======================================//

// === === === update password === === ===//

//======================================//

routers.put("/update-pass", verifytoken, clientcont.updatepassword);

//======================================//

// === === === verify === === === //

//======================================//

routers.post("/reqverification", clientcont.createotp);

//======================================//

// === === === validate otp === === === //

//======================================//

routers.post("/validateotp", clientcont.validateotp);

//======================================//

// ==== ==== ==== updt booking ==== ==== ==== //

routers.post("/updatebooking", clientcont.updatebooking);

// === ==== ==== cancel request ==== ==== ==== //

routers.put("/cancelbooking", verifytoken, clientcont.cancel_bookreq);

// === === === view package === === === //

routers.post("/tourpackages", clientcont.findpackage);

// === === === get details of a tour package === === === //

routers.get("/tourpackages/details/:packageurl", clientcont.pkgdtl);

// === === === create tour inquiry === === === //

routers.post("/tourpackages/inquiry", clientcont.crt_tourinqu);

// === === === homedata === === === //

routers.get("/hmdata", clientcont.hmdata);

// === === === email verification otp === === === //

routers.post("/verifyemail", verifytoken, clientcont.email_verification);

// === === === verify email otp === === === //

routers.post("/verifyemail/otp", verifytoken, clientcont.validatemailotp);

// === === === reschedule booking === === === //

routers.post("/booking/resheduled", verifytoken, clientcont.bkng_rscld);

// === === === booking auto fill === === === //

routers.get("/atofl", clientcont.bkng_autofill);

module.exports = routers;
