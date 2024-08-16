const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/paymentController.js");
const { isLoggedIn } = require("../middleware.js");


router.get("/success", (req, res) => {
  res.render("payment/success.ejs",{page: "payment"});
});

router.get("/checkout", isLoggedIn, PaymentController.checkoutForm);

router.post("/order",isLoggedIn, PaymentController.createOrders);

router.post("/payWrazorpe", isLoggedIn, PaymentController.RazorpaymentRoute);

router.post("/payLater", isLoggedIn, PaymentController.paylater);

router.post("/payload", isLoggedIn, PaymentController.payload);

router.post("/payWphonepe", isLoggedIn, PaymentController.payWithPhonepe);

router.get(
  "/redirect-url/:merchantTransactionId",
  isLoggedIn,
  PaymentController.redirectPage
);

module.exports = router;
