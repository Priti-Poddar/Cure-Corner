const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const doctorController = require("../controllers/doctorController");
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
