const axios = require("axios");
const uniqid = require("uniqid");
const sha256 = require("sha256");
const orderid = require("order-id")("key");
const Cart = require("../models/cart");
const Address = require("../models/address");
const Medicine = require("../models/medicine");
const Order = require("../models/order.js");

const Razorpay = require("razorpay");
const {
  KEY_ID,
  KEY_SECRET,
  PHONEPE_MERCHANT_ID,
  SALT_KEY,
  PHONE_PE_HOST_URL,
  SALT_INDEX,
} = process.env;

const razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

const key_id = process.env.KEY_ID;
const APP_BE_URL = "http://localhost:8080"; // our application

module.exports.checkoutForm = async (req, res) => {
  const cartItem = await Cart.findById(req.session.cart._id)
    .populate({ path: "items.productId" })
    .populate("user");
  const items = cartItem.items;
  const Add = await Address.findOne({ user: req.user._id });

  // console.log(items);
  // const orders = cartItem[0].items;
  res.render("payment/payment.ejs", {
    cartItem,
    Add,
    key: key_id,
    items,
    page: "Payment",
  });
};

module.exports.createOrders = async (req, res) => {
  const { amount } = req.body;
  // console.log(amount);
  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11",
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.RazorpaymentRoute = async (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/cart");
  }
  const cart = await Cart.findById(req.session.cart._id);
  const address = await Address.findOne({ user: req.user._id });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", KEY_SECRET);

  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generated_signature = hmac.digest("hex");

  if (generated_signature === razorpay_signature) {
    const order = new Order({
      user: req.user,
      cart: {
        totalQty: cart.totalQty,
        totalCost: cart.totalCost,
        items: cart.items,
      },
      address: address,
      paymentId: razorpay_payment_id,
    });
    let orders = await order.save();
    // console.log(orders);
    await cart.save();
    await Cart.findByIdAndDelete(cart._id);
    req.flash("success", "Successfully purchased");
    req.session.cart = null;
    console.log("successfull");
    res.json({ status: "success" });
  } else {
    res.json({ status: "failure" });
  }
};

module.exports.paylater = async (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/cart");
  }
  const cart = await Cart.findById(req.session.cart._id);
  const address = await Address.findOne({ user: req.user._id });
  const order = new Order({
    user: req.user,
    cart: {
      totalQty: cart.totalQty,
      totalCost: cart.totalCost,
      items: cart.items,
    },
    Order_id: orderid.generate(),
    address: address,
  });
  let orders = await order.save();
  // console.log(orders);
  await cart.save();
  await Cart.findByIdAndDelete(cart._id);
  req.flash("success", "Successfully purchased");
  req.session.cart = null;
  res.redirect("/myOrders");
};

module.exports.payload = async (req, res) => {
  const payEndPoint = "/pg/v1/pay";
  const merchantTransactionId = uniqid();
  const userId = 123;
  const { amount } = req.body;

  const payload = {
    merchantId: PHONEPE_MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: userId,
    amount: amount * 100,
    redirectUrl: `${APP_BE_URL}/payment/redirect-url/${merchantTransactionId}`,
    redirectMode: "REDIRECT",
    mobileNumber: req.user.mobile,
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  // SHA256(base64 encoded payload + “/pg/v1/pay” +
  // salt key) + ### + salt index
  const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
  const base64EncodedPayload = bufferObj.toString("base64");
  const xVerify =
    sha256(base64EncodedPayload + payEndPoint + SALT_KEY) + "###" + SALT_INDEX;
  try {
    res.json({ xVerify: xVerify, base64Payload: base64EncodedPayload });
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.payWithPhonepe = async (req, res) => {
  const payEndPoint = "/pg/v1/pay";
  //   const merchantTransactionId = uniqid();
  //   const userId = 123;
  //   const { amount } = req.body;

  //   const payload = {
  //     merchantId: PHONEPE_MERCHANT_ID,
  //     merchantTransactionId: merchantTransactionId,
  //     merchantUserId: userId,
  //     amount: amount * 100,
  //     redirectUrl: `${APP_BE_URL}/redirect-url/${merchantTransactionId}`,
  //     redirectMode: "REDIRECT",
  //     mobileNumber: req.user.mobile,
  //     paymentInstrument: {
  //       type: "PAY_PAGE",
  //     },
  //   };

  //   // SHA256(base64 encoded payload + “/pg/v1/pay” +
  //   // salt key) + ### + salt index
  //   const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
  //   const base64EncodedPayload = bufferObj.toString("base64");
  //   const xVerify =
  //     sha256(base64EncodedPayload + payEndPoint + SALT_KEY) + "###" + SALT_INDEX;

    const { xVerify, base64Payload } = req.body;
    console.log(xVerify);
    
  const options = {
    method: "post",
    url: `${PHONE_PE_HOST_URL}${payEndPoint}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": xVerify,
    },
    data: {
      request: base64Payload,
    },
  };
  axios
    .request(options)
    .then(async function (response) {
      // console.log(response.data);
      const url = response.data.data.instrumentResponse.redirectInfo.url;
        // console.log(url);
        const status = response.data.success;
      res.json({ status: status, url:url });
    })
    .catch(function (error) {
      console.error(error);
        res.json({ status: "failure" });
    });
};

module.exports.redirectPage = (req, res) => {
  const { merchantTransactionId } = req.params;
  // console.log("merchantTransactionId: ", merchantTransactionId);

  if (merchantTransactionId) {
    // SHA256(“/pg/v1/status/{merchantId}/{merchantTransactionId}” + saltKey) + “###” + saltIndex
    const xVerify =
      sha256(
        `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}` +
          SALT_KEY
      ) +
      "###" +
      SALT_INDEX;
    const options = {
      method: "get",
      url: `${PHONE_PE_HOST_URL}/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-MERCHANT-ID": merchantTransactionId,
        "X-VERIFY": xVerify,
      },
    };
    axios
      .request(options)
      .then( async function (response) {
        const paymentDetails = response.data;
        // console.log(paymentDetails);
          if (!req.session.cart) {
            return res.redirect("/cart");
          }
          const cart = await Cart.findById(req.session.cart._id);
          const address = await Address.findOne({ user: req.user._id });
          const order = new Order({
            user: req.user,
            cart: {
              totalQty: cart.totalQty,
              totalCost: cart.totalCost,
              items: cart.items,
            },
            paymentId: paymentDetails.data.transactionId,
            Order_id: orderid.generate(),
            address: address,
          });
          let orders = await order.save();
          // console.log(orders);
          await cart.save();
          // await Cart.findByIdAndDelete(cart._id);
          // req.session.cart = null;
        res.render("payment/success.ejs", { paymentDetails, orders });
      })
      .catch(function (error) {
        console.error(error);
      });
  } else {
    res.send("ERROR!!");
  }
};
