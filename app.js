if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
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
const paymentRoute = require("./routes/paymentRoute.js");
const { isLoggedIn } = require("./middleware.js");
// const { render } = require("ejs");

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
  res.render("policies/terms.ejs", { page: "policies" });
});

app.get("/refundPolicy", async (req, res) => {
  res.render("policies/refundPolicy.ejs", { page: "policies" });
});

app.get("/shippingPolicy", async (req, res) => {
  res.render("policies/shippingPolicy.ejs", { page: "policies" });
});

app.get("/returnsPolicy", async (req, res) => {
  res.render("policies/returnsPolicy.ejs",{page:"policies"});
});

app.get("/privacyPolicy", async (req, res) => {
  res.render("policies/privacyPolicy.ejs", { page: "policies" });
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



app.use("/medicines", medicineRouter);
app.use("/", userRouter);
app.use("/search", searchRouter);
app.use("/category", categoryRouter);
app.use("/cart", cartRouter);
app.use("/doctors", doctorRoutes);
app.use("/admin", adminRoutes);
app.use("/payment", paymentRoute);

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
