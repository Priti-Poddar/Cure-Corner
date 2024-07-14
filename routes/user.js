const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const UserController = require("../controllers/users.js");
// const Medicine = require("../models/medicine.js");


router
  .route("/signup")
  .get(UserController.renderSignupForm)
  .post(wrapAsync(UserController.signup));

router
  .route("/login")
  .get(UserController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    UserController.login
);
  
router.get("/adminDash", UserController.adminDashboard);







router.get("/logout", UserController.logout);

module.exports = router;
