const express = require("express");
const router = express.Router();
const CartController = require("../controllers/cart");
const { isLoggedIn } = require("../middleware");



// GET: view shopping cart contents
router.get("/", CartController.renderCartPage);

router.get("/checkout",isLoggedIn, CartController.checkoutForm);

router.post("/order",CartController.createOrders);

router.post("/checkout", isLoggedIn, CartController.paymentRoute);

// GET: add a product to the shopping cart when "Add to cart" button is pressed
router.get("/:id", CartController.increaseItem);


// GET: reduce one from an item in the shopping cart
router.get("/reduce/:id", CartController.decreaseItem);

// GET: remove all instances of a single product from the cart
router.get("/removeAll/:id", CartController.removeAll);

// Save address
router.post("/reverse-geocode", CartController.saveAddressPage);


module.exports = router;
