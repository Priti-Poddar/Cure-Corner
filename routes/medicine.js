const express = require("express");
const router = express.Router();
const Medicine = require("../models/medicine.js");
const Address = require("../models/address.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isAdmin, validateMedicine } = require("../middleware.js");
const { render } = require("ejs");
// const { cart } = require("../app.js");

// Show route
router.get("/", async (req, res) => {
  const allmedicines = await Medicine.find({});
  if (req.user) {
    const userAdd = await Address.findOne({ user: req.user._id });
  res.render("medicines/product.ejs", { allmedicines, userAdd, page:"Product" });
  }else{
    res.render("medicines/product.ejs", { allmedicines, page: "Product" });
  }
});
  
router.get("/new", isAdmin, (req, res) => {
  res.render("medicines/new.ejs", { page: "Product" });
});

router.post("/", isAdmin, async (req, res) => {
  // console.log(req.body.medicines);
  const newMedicine = new Medicine(req.body.medicines);
  // console.log(newMedicine);
  let saveMedicine = await newMedicine.save();
  // let id = saveMedicine._id;
   req.flash("success", "New Medicine Created!");
   res.redirect("/medicines");
});

router.get("/:id", async (req, res) => {
  let { id } = req.params;
  const medicine = await Medicine.findById(id);
  if (req.user) {
    const userAdd = await Address.findOne({ user: req.user._id });
      res.render("medicines/show.ejs", { medicine, userAdd, page: "Product" });

  } else {
     res.render("medicines/show.ejs", { medicine, page: "Product" });

  }
});

router.get("/:id/edit",isAdmin, async (req, res) => {
  let { id } = req.params;
  const medicine = await Medicine.findById(id);
  if (!medicine) {
    req.flash("error", "Medicine you requested for does not exit");
    res.redirect("/medicines");
  }
    res.render("medicines/edit.ejs", { medicine, page: "Product" });
});

router.put("/:id", isAdmin, async (req, res) => {
  if (!req.body.medicine) {
    throw new ExpressError(400, "Send valid data for listing");
  }
  let { id } = req.params;
  let medicine = await Medicine.findByIdAndUpdate(
    id,
    { ...req.body.medicine },
    { runValidators: true, new: true }
  );
  // console.log(medicine);
  req.flash("success", "Medicine Updated!");
  res.redirect(`/medicines/${id}`);
});

router.delete("/:id", isAdmin, async (req, res) => {
  let { id } = req.params;
  let deletedMedicine = await Medicine.findByIdAndDelete(id);
  console.log(deletedMedicine);
  req.flash("success", "Medicine Deleted!");
  res.redirect("/medicines");
} );



module.exports = router;
