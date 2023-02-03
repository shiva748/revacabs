require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT || 443;
const app = express();
const cors = require("cors");
var bodyParser = require("body-parser");
const helmet = require("helmet");
const https = require("https");
const fs = require("fs");
const http = require("http");
// routes import
const clientr = require("./router/clientr");
const partnerr = require("./router/partnerr");
const publicr = require("./router/publicr");
const paymentr = require("./router/paymentr");
const admnr = require("./router/admnr");
const driverr = require("./router/driverr");
const vhost = require("vhost");
const admin = express();
const client = express();
const partner = express();
const blocker = require("./Middleware/blocker")
// connections
require("./db/conn");

//==== ==== ==== static ==== ==== ====//
const path = require("path");
app.get("/.well-known/acme-challenge/UX-lZaL1D_rkycSsiKcvlmQxLIO6cTSvxsc-EBpssvY", (req, res)=>{
  options = {
    root: path.join(__dirname),
  };
  fileName = "a.txt";
res.sendFile(fileName, options)
})
app.use(express.static(`${path.join(__dirname, "/public/images/")}`));
// app.use(express.static(`${path.join(__dirname, "/public/images/")}`));

app.use("/partner/partnerverification", express.json({ limit: "1mb" }));
app.use("/partner/addriver", express.json({ limit: "1mb" }));
app.use("/partner/updatedriver", express.json({ limit: "1mb" }));
app.use("/partner/adcar", express.json({ limit: "1mb" }));
app.use("/partner/updatecar", express.json({ limit: "1mb" }));
app.use("/oceannodes/service/cabmodel/add", express.json({ limit: "1mb" }));
app.use(
  "/oceannodes/service/tourpackage/new",
  express.json({ limit: "500kb" })
);
app.use(
  "/oceannodes/service/tourpackage/update",
  express.json({ limit: "500kb" })
);
app.use(
  "/oceannodes/service/cabmodel/update",
  express.json({ limit: "150kb" })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(helmet());
//app.use(cors({ origin: ["http://localhost:3000/", "http://localhost:3006/"] }));
// routes usage
app.use("/api", clientr);
app.use("/partner", partnerr);
app.use("/api/public", publicr);

app.use("/payment", paymentr);
app.use("/oceannodes", admnr);
app.use("/driver", driverr);
/*admin.use(blocker, express.static("admin/build"));
admin.get("*", blocker, (req, res) => {
  res.sendFile(path.resolve(__dirname, "admin", "build", "index.html"));
});
app.use(vhost("pa98oceanodes.revacabs.com", admin));
partner.use(express.static("partner/build"));
partner.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "partner", "build", "index.html"));
});
app.use(vhost("partners.revacabs.com", partner));
client.use(express.static("client/build"));
client.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});
app.use(vhost("www.revacabs.com", client));
app.use(vhost("revacabs.com", client));
 const privatekey = fs.readFileSync(
    "/etc/letsencrypt/live/revacabs.com/privkey.pem",
    "utf8"
  );
  const certificate = fs.readFileSync(
    "/etc/letsencrypt/live/revacabs.com/cert.pem",
    "utf8"
  );
  const ca = fs.readFileSync(
    "/etc/letsencrypt/live/revacabs.com/chain.pem",
    "utf8"
  );
  const credentials = {
    key: privatekey,
    cert: certificate,
    ca: ca,
  };
  https.createServer(credentials, app).listen(PORT, () => {
    console.log("listining to port " + PORT);
  });
  http.createServer((req, res)=>{
    res.writeHead(301, {"Location":"https://"+req.headers['host']+req.url});
    res.end();
  }).listen(80)*/

  app.listen(PORT, () => {
    console.log(`listining to ${PORT}`);
  });