const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const doctorController = require("../controllers/doctorController");
const HealthRecords = require("../models/healthRecord.js");
const { isLoggedIn, validateDoctor } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.get("/", wrapAsync(doctorController.getDoctors));
router.get("/add", isLoggedIn, doctorController.getAddDoctor);
router.post(
  "/add",
  isLoggedIn,
  upload.single("doctor[image]"),
  validateDoctor,
  wrapAsync(doctorController.postAddDoctor)
);

router.get("/healthRecords", async (req, res) => {
  res.render("users/healthRecords.ejs", { page: "healthRecords" });
});


router.post(
  "/healthRecords",
  upload.single("healthRecords[image]"),
  async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const { Pname, phone, message } = req.body;
    console.log(req.body);
    const newHealthRecord = new HealthRecords({
      userId: req.user._id,
      image: { url, filename },
      Pname,
      phone,
      message,
    });

    let savedHealthRecord = await newHealthRecord.save();
    console.log(savedHealthRecord);

    req.flash("success", "Your prescription uploaded!");
    res.redirect("/myAcc");
  }
);

router.get("/editDoc", isLoggedIn, doctorController.renderUpdatePage);
router.put(
  "/:id",
  isLoggedIn,
  upload.single("myDocAccount[image]"),
  // validateDoctor,
  doctorController.updateDoctor
);


router.get("/:id",isLoggedIn, doctorController.renderBookingPage);
router.post("/:id", isLoggedIn, doctorController.postBooking);

module.exports = router;
