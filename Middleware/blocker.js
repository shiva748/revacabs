const blocker = async (req, res, next) => {
  try {
    const data = req.body;
    const ip = ["::1"];
    // console.log(req.connection.remoteAddress)
    if (!ip.some((itm) => itm === req.connection.remoteAddress)) {
      console.log(req.connection.remoteAddress);
      return res
        .status(403)
        .send(
          "<h1> Forbidden </h1><p>You Don't have access to this server</p>"
        );
    }
    req.body = data;
    next();
  } catch (error) {
    return res.status(500).json("Cant serve you right now");
  }
};
module.exports = blocker;
