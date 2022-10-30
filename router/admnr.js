const express = require("express");
const routers = express.Router();
const cookie_par = require("cookie-parser");
routers.use(cookie_par());
const blocker = require("../Middleware/blocker");
routers.use(blocker);
const verifytoken = require("../Middleware/adminauth");

// === === === importing controller === === === //

const admscont = require("../controller/admscontroller");
const { verify } = require("jsonwebtoken");

routers.post("/login", admscont.admn_login);

// === === === activate get route === === === //

routers.get("/pin", admscont.admn_activate_get);

// === === === activate post route === === === //

routers.post("/pin", admscont.admn_activate);

// === === === auto login === === === //

routers.get("/autolog", verifytoken, admscont.admn_autolog);

// === === === logout === === === //

routers.get("/logout", verifytoken, admscont.admn_logout);

// === === === get inquiry === === === //

routers.post("/booking/inquiry", verifytoken, admscont.admn_getinqui);

// === === === get progress === === === //

routers.post("/booking/progress", verifytoken, admscont.admn_getprogress);

// === === === get billing === === === //

routers.post("/booking/billing", verifytoken, admscont.admn_getbilling);

// === === === get history === === === //

routers.post("/booking/history", verifytoken, admscont.admn_gethistory);

// === === === update billing === === === //

routers.post("/booking/billing/update", verifytoken, admscont.admn_updtblng);

// === === === close booking === === === //

routers.put("/booking/inquiry/remove", verifytoken, admscont.admn_clsinqu);

// === === === assng operator === === === //

routers.put("/booking/progress/assignop", verifytoken, admscont.admn_assngop);

// === === === refuse operator === === === //

routers.put("/booking/progress/rfsop", verifytoken, admscont.rfs_oprtr);

// === === === tour bkng === === === //

routers.post("/booking/tour", verifytoken, admscont.admn_gettourbkng);

// === === === coustumer list === === === //

routers.post("/client", verifytoken, admscont.admn_clnt);

// === === ===  client status update === === === //

routers.put("/client/status", verifytoken, admscont.admn_chngclntstat);

// === === === operator finder === === === //

routers.post("/operator", verifytoken, admscont.admn_oprtr);

// === === === send partner profile === === === //

routers.get(
  "/partner/resources/images/:path/:id/:filename",
  verifytoken,
  admscont.prflloader
);

// === === === updt operator === === === //

routers.put("/operator/update", verifytoken, admscont.admn_updtoprtr);

// === === === get drvr === === === //

routers.post("/operator/driver", verifytoken, admscont.admn_driver);

// === === === update driver === === === //

routers.put("/operator/driver/update", verifytoken, admscont.admn_updtdrvr);

// === === === approve driver login === === === //

routers.put("/operator/driver/approve", verifytoken, admscont.admn_drvrlgnaprv);

// === === === get cars === === === //

routers.post("/operator/car", verifytoken, admscont.admn_listcar);

// === === === update cars === === === //

routers.put("/operator/car/update", verifytoken, admscont.admn_updtcar);

// === === === list citys === === === //

routers.post("/service/city", verifytoken, admscont.admn_listcity);

// === === === add city === === === //

routers.post("/service/city/add", verifytoken, admscont.admn_addcity);

// === === === update city === === === //

routers.put("/service/city/update", verifytoken, admscont.admn_updatecity);

// === === === locality === === === //

routers.put("/service/city/locality", verifytoken, admscont.admn_aduplocality);

// === === === hourly package === === === //

routers.post("/service/hourlypackage", verifytoken, admscont.admn_listhrly);

// === === === add new hrly city === === === //

routers.post(
  "/service/hourlypackage/new",
  verifytoken,
  admscont.admn_addhrlycty
);

// === === === update hrlu cty === === === //

routers.post("/service/hourlypackage/update", verifytoken, admscont.admn_ulh);

// === === === add or edit hourly package === === === //

routers.post(
  "/service/hourlypackage/add",
  verifytoken,
  admscont.admn_addhrlypackage
);

// === === === list cabmodels === === === //

routers.post("/service/cabmodel", verifytoken, admscont.admn_listcabmod);

// === === === add cabmodels === === === //

routers.post("/service/cabmodel/add", verifytoken, admscont.admn_addcabmodel);

// === === === update cabmodel === === === //

routers.post("/service/cabmodel/update", verifytoken, admscont.admn_upcabmodel);

// === === === list outstation === === === //

routers.post("/service/outstation", verifytoken, admscont.admn_listoutsttn);

// === === === add outstation === === === \\

routers.post("/service/outstation/add", verifytoken, admscont.admn_addoutsttn);

// === === === update outstation === === === //

routers.post(
  "/service/outstation/update",
  verifytoken,
  admscont.admn_updoutstn
);

// === === === add outstation package oneway === === === //

routers.post(
  "/service/outstation/add/oneway",
  verifytoken,
  admscont.admn_addoutpackage
);

// === ==== === add outstation package roundtrip === === === //

routers.post(
  "/service/outstation/add/roundtrip",
  verifytoken,
  admscont.admn_addoutpackageround
);

// === === === tour package === === === //

routers.post("/service/tourpackage", verifytoken, admscont.admn_listToupac);

// === === === add tourpackage === === === //

routers.post("/service/tourpackage/new", verifytoken, admscont.admn_addtour);

// === === === update tourpackage === === === //

routers.put(
  "/service/tourpackage/update",
  verifytoken,
  admscont.admn_updatetour
);

// === === === payment lstr === === === //

routers.post("/payment", verifytoken, admscont.admn_pmtlstr);

// === === === payment updater === === === //

routers.put("/payment/update", verifytoken, admscont.admn_updtpayment);

// === === === payment lstr === === === //

routers.post("/penalty", verifytoken, admscont.admn_penaltylstr);

// === === === payment updater === === === //

routers.put("/penalty/update", verifytoken, admscont.admn_updtpnlty);

// === === === stats === === === //

routers.get("/stats", verifytoken, admscont.admn_stts)

module.exports = routers;
