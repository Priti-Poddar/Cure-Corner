if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");
const uniqid = require("uniqid");
const sha256 = require("sha256");
const HealthRecords = require("./models/healthRecord");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Cart = require("./models/cart.js");
const Address = require("./models/address.js");
const Order = require("./models/order.js");
const Doctor = require("./models/doctorsModel.js");

const medicineRouter = require("./routes/medicine.js");
const userRouter = require("./routes/user.js");
const searchRouter = require("./routes/search.js");
const categoryRouter = require("./routes/category.js");
const cartRouter = require("./routes/cart.js");
const doctorRoutes = require("./routes/Doctors.js");
const adminRoutes = require("./routes/adminRoute.js");
const { isLoggedIn } = require("./middleware.js");
const { render } = require("ejs");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

// const MONGO_URL = "mongodb://127.0.0.1:27017/curecorner";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
  store: store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.session = req.session;
  res.locals.currUser = req.user;
  res.locals.query = req.body.query;
  // res.locals.address_data = req.body;
  next();
});

// let medicin1 = new Medicine({
//   drugName: "paracitamol",
//   manufacturer: "ABC",
//   description: "Helps to reduce headache",
//   consumeType: "oral",
//   expirydate: 2025 - 10 - 10,
//   price: 220,
//   sideEffects: "nothing",
//   disclaimer:"ask your doctor",
// });

// medicin1.save().then((res) => {
//     console.log(res);
// }).catch((err) => { console.log(err) });
// let cart = [];

app.get("/", async (req, res) => {
  // const allmedicines = await Medicine.find({});
  res.render("medicines/index.ejs", { page: "Home" });
});

app.get("/myAcc", isLoggedIn, async (req, res) => {
  const doctors = await Doctor.findOne({ userId: req.user._id }).populate(
    "userId"
  );
  // console.log(doctors);
  res.render("users/account.ejs", { doctors, page: "User" });
});

app.get("/terms", async (req, res) => {
  res.render("payment/terms.ejs", { page: "policies" });
});

app.get("/refundPolicy", async (req, res) => {
  res.render("payment/refundPolicy.ejs", { page: "policies" });
});

app.get("/shippingPolicy", async (req, res) => {
  res.render("payment/shippingPolicy.ejs", { page: "policies" });
});

app.get("/returnsPolicy", async (req, res) => {
  res.render("payment/returnsPolicy.ejs",{page:"policies"});
});

app.get("/healthRecords", async (req, res) => {
  res.render("users/healthRecords.ejs", { page: "healthRecords" });
});

const multer = require("multer");
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });



app.post(
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
    req.flash("success", "Your prescription uploaded!");
    res.redirect("/");
  }
);

const PHONEPE_MERCHANT_ID = "PGTESTPAYUAT86";
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
// const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const SALT_INDEX = 1;
const APP_BE_URL = "http://localhost:8080"; // our application

app.post("/pay",isLoggedIn, async (req, res) => {
  const payEndPoint = "/pg/v1/pay";
  const merchantTransactionId = uniqid();
  const userId = 123;
  const { amount } = req.body;
  
  const payload = {
    merchantId: PHONEPE_MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: userId,
    amount: amount * 100,
    redirectUrl: `http://localhost:8080/redirect-url/${merchantTransactionId}`,
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

  const options = {
    method: "post",
    url: `${PHONE_PE_HOST_URL}${payEndPoint}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": xVerify,
    },
    data: {
      request: base64EncodedPayload,
    },
  };
  axios
    .request(options)
    .then(async function (response) {
      // console.log(response.data);
      const url = response.data.data.instrumentResponse.redirectInfo.url;
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
    address: address,
  });
  let orders = await order.save();
  // console.log(orders);
  await cart.save();
  await Cart.findByIdAndDelete(cart._id);
  req.flash("success", "Successfully purchased");
  req.session.cart = null;
      res.redirect(url);
    })
    .catch(function (error) {
      console.error(error);
      res.send(error);
    });
});


app.get("/redirect-url/:merchantTransactionId", (req, res) => {
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
      .then(function (response) {
        const paymentDetails = response.data;
        console.log(paymentDetails);

        res.render("payment/success.ejs", { paymentDetails });
      })
      .catch(function (error) {
        console.error(error);
      });
    // res.send({ merchantTransactionId });
  } else {
    res.send("ERROR!!");
  }
});

app.use("/medicines", medicineRouter);
app.use("/", userRouter);
app.use("/search", searchRouter);
app.use("/category", categoryRouter);
app.use("/cart", cartRouter);
app.use("/doctors", doctorRoutes);
app.use("/admin", adminRoutes);

app.all("*", (req, res, next) => {
  // res.send({ cart });
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Listining to port 8080");
});
