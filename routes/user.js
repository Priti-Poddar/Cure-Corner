const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const UserController = require("../controllers/users.js");
const { route } = require("./medicine.js");
const { isLoggedIn } = require("../middleware.js");

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
  
router.get("/adminDash",isLoggedIn, UserController.adminDashboard);

router.get("/myOrders",isLoggedIn, UserController.renderOrder);

router.get("/myAddress",isLoggedIn, UserController.renderAddress);

router.get("/myPayments",isLoggedIn, UserController.renderPayments);

router.get("/manageAcc", isLoggedIn, UserController.renderEditForm)
router.put("/manageAcc", isLoggedIn, UserController.updateUser);

router.get("/myAppointments", isLoggedIn, UserController.renderAppointments);
router.get("/logout", UserController.logout);

module.exports = router;
