if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Medicine = require("./models/medicine");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const medicineRouter = require("./routes/medicine.js");
const userRouter = require("./routes/user.js");
const searchRouter = require("./routes/search.js");
const categoryRouter = require("./routes/category.js");
const cartRouter = require("./routes/cart.js");
const doctorRoutes = require("./routes/Doctors.js");
const { isLoggedIn } = require("./middleware.js");
const { render } = require("ejs");




app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

const MONGO_URL = "mongodb://127.0.0.1:27017/curecorner";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const sessionOptions = {
  secret: "mySecretKey",
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
  const allmedicines = await Medicine.find({});
  // console.log(cart);
  res.render("medicines/home.ejs", { allmedicines });
});

const Razorpay = require("razorpay");
const { KEY_ID, KEY_SECRET } = process.env;
// const mapToken = process.env.MAP_TOKEN;

// const razorpayInstance = new Razorpay({
//   key_id: KEY_ID,
//   key_secret: KEY_SECRET,
// });

const razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});


app.post("/order", async (req, res) => {
  const { amount } = req.body;
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
});

app.post("/cart/checkout", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", KEY_SECRET);

  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generated_signature = hmac.digest("hex");

  if (generated_signature === razorpay_signature) {
    console.log("successfull");
    res.json({ status: "success" });
    // res.redirect("/myAcc");
    // res.status(200).send("Susscessfull");
  } else {
    res.json({ status: "failure" });
     res.status(400).send("Payment verification failed");
  }

});

app.get("/myAcc", (req, res) => {
  res.render("users/account.ejs");
});

// app.post("/payment", isLoggedIn, async (req, res) => {
//    try {
//      const amount = req.body.amount * 100;
//      const options = {
//        amount: amount,
//        currency: "INR",
//        receipt: "razorUser@gmail.com",
//      };

//      razorpayInstance.orders.create(options, (err, order) => {
//        if (!err) {
//          res.status(200).send({
//            success: true,
//            msg: "Order Created",
//            order_id: order.id,
//            amount: amount,
//            key_id: RAZORPAY_ID_KEY,
//            product_name: req.body.name,
//            description: req.body.description,
//            contact: "8567345632",
//            name: "Sandeep Sharma",
//            email: "sandeep@gmail.com",
//          });
//        } else {
//          res.status(400).send({ success: false, msg: "Something went wrong!" });
//        }
//      });
//    } catch (error) {
//      console.log(error.message);
//    }
// });

app.use("/medicines", medicineRouter);
app.use("/", userRouter);
app.use("/search", searchRouter);
app.use("/category", categoryRouter);
app.use("/cart", cartRouter);
app.use("/doctors", doctorRoutes);

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
