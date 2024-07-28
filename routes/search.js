const express = require("express");
const router = express.Router();
const Medicine = require("../models/medicine.js");
const Address = require("../models/address.js");


router.get("/", async (req, res) => {
  const allmedicines = await Medicine.find({});
  
      res.render("medicines/search.ejs", { allmedicines, page: "Search" });

  
});

router.post("/", async (req, res) => {
  const allmedicines = await Medicine.find({});
  const query = req.body.query.toLowerCase();
  const filteredProducts = allmedicines.filter(
    (medicine) =>
      medicine.drugName.toLowerCase().includes(query) ||
      medicine.description.toLowerCase().includes(query) ||
      medicine.category.toLowerCase().includes(query)
  );
  res.render("medicines/search.ejs", {
    allmedicines: filteredProducts,
    page: "Search",
  });
});


router.post("/close", async (req, res) => {
  let redirectUrl = res.locals.redirectUrl || "/";
  // console.log(res.locals.redirectUrl);
  res.redirect(redirectUrl);
});

module.exports = router;
