const express = require("express");
const routers = express.Router();
const paycont = require("../controller/paymentcontroller");
const verifytoken = require("../Middleware/partnerauth");
const cookie_par = require("cookie-parser");
routers.use(cookie_par());

// === === === === === === === === === === //

// === === === booking Advance === === === //

// === === === === === === === === === === //

// === === === create order === === === //

routers.post("/createorder/bkngadv", paycont.create_order);

// === === === success === === === //

routers.post("/success/bkngadv", paycont.success);

// === === === partner pay company balance === === === //

routers.post("/createorder/cmpnybal", verifytoken, paycont.create_order_cmpy);

// === === === partner company bal success === === === //

routers.post("/success/cmpnybal", verifytoken, paycont.success_companybal);

// === === === security fee === === === //

routers.post("/createorder/securityfee", verifytoken, paycont.create_order_SF);

// === === === security fee success === === === //

routers.post("/success/securityfee", verifytoken, paycont.success_securityfee);

// === === === penalty order === === === //

routers.post("/createorder/penalty", verifytoken, paycont.create_order_penalty);

// === === === penalty success === === === //

routers.post("/success/penalty", verifytoken, paycont.success_penalty);

module.exports = routers;
