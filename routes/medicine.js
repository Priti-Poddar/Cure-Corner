const express = require("express");
const router = express.Router();
const Medicine = require("../models/medicine.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
// const { cart } = require("../app.js");

// Show route
router.get("/", async (req, res) => {
  const allmedicines = await Medicine.find({});
  res.render("medicines/index.ejs", { allmedicines });
});

router.get("/:id", async (req, res) => {
  let { id } = req.params;
  const medicine = await Medicine.findById(id);
  res.render("medicines/show.ejs", { medicine });
});



module.exports = router;
