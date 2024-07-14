const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { isLoggedIn } = require("../middleware");

router.get("/", doctorController.getDoctors);
router.get("/add",isLoggedIn, doctorController.getAddDoctor);
router.post("/add", doctorController.postAddDoctor);

module.exports = router;
