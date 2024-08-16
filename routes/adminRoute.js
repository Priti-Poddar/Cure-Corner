const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/adminController.js");
const { isAdmin } = require("../middleware.js");
const multer = require("multer");
// const upload = multer({ dest:"uploads" });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
});
const upload = multer({ storage });


router.get("/uploadAll",isAdmin, AdminController.uploadAllForm);

router.post("/uploadAll",isAdmin, upload.single("file"), AdminController.uploadAll);

// EXPORTING FUNCTION To open file viewer page
router.get("/view/:id",isAdmin, AdminController.viewInventory);

router.get("/delete/:id",isAdmin, AdminController.deleteInventory);




module.exports = router;
