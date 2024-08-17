const express = require("express");
const router = express.Router();

router.get("/terms", async (req, res) => {
  res.render("policies/terms.ejs", { page: "policies" });
});

router.get("/refundPolicy", async (req, res) => {
  res.render("policies/refundPolicy.ejs", { page: "policies" });
});

router.get("/shippingPolicy", async (req, res) => {
  res.render("policies/shippingPolicy.ejs", { page: "policies" });
});

router.get("/returnsPolicy", async (req, res) => {
  res.render("policies/returnsPolicy.ejs", { page: "policies" });
});

router.get("/privacyPolicy", async (req, res) => {
  res.render("policies/privacyPolicy.ejs", { page: "policies" });
});

module.exports = router;
