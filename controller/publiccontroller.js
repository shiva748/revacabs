const City = require("../models/autocity");
exports.autocomplete = async (req, res) => {
  const { key, frst } = req.body;
  if(frst){
    const sgst = await City.find(
      {},
      { _id: 0, cityname: 1, citycode: 1 }
    ).limit(15)
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (sgst === "block") {
      return;
    }
    return res.json(sgst)
  }
  if (!key || typeof key !== "string") {
    return res.status(400).json("invalid request");
  }
  if (key <= 0) {
    return res.json([]);
  }
  const suggest = await City.find(
    { cityname: { $regex: `${key}`, $options: "i" } },
    { _id: 0, cityname: 1, citycode: 1 }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (suggest === "block") {
    return;
  }
  if (suggest) {
    return res.json(suggest);
  } else {
    return res.json([]);
  }
};

// === === === export city === === === //

exports.cts = async(req, res)=>{
  const suggest = await City.find()
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (suggest === "block") {
    return;
  }
  if (suggest) {
    return res.json(suggest);
  } else {
    return res.json([]);
  }
}

// === === === locality lstr === === === //

exports.locality = async (req, res) => {
  const { city, citycode } = req.body;
  if (
    !city ||
    !citycode ||
    typeof citycode !== "string" ||
    typeof city !== "string" ||
    isNaN(citycode)
  ) {
    return res.status(400).json("Invalid data");
  }
  const loca = await City.findOne(
    { cityname: city, citycode: citycode },
    { _id: 0, locality: 1 }
  )
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (loca === "block") {
    return;
  }
  if (loca) {
    return res.status(200).json(loca);
  } else {
    return res.status(400).json("Invalid data");
  }
};
