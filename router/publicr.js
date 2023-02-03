const express = require("express");
const routers = express.Router();

// === === === importing controller === === === //

const publiccont = require("../controller/publiccontroller");
const cookie_par = require("cookie-parser");

routers.post("/autocomplete", publiccont.autocomplete);

// === === === export city === === === //

routers.get("/catalon", publiccont.cts)

// === === === locality lstr === === === //

routers.post("/locality", publiccont.locality);

module.exports = routers;
