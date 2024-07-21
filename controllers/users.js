const User = require("../models/user");
const Appointment = require("../models/appointment.js");
const Order = require("../models/order.js");
const Address = require("../models/address.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const Doctor = require("../models/doctorsModel.js");
const Medicine = require("../models/medicine.js");
const appointment = require("../models/appointment.js");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Dipti Medical");
      res.redirect("/");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Dipti Medical!");
  let redirectUrl = res.locals.redirectUrl || "/";
  res.redirect(redirectUrl);
};

module.exports.adminDashboard = async (req, res) => {
  const users = await User.find();
  const doctors = await Doctor.find().populate("userId");
  const orders = await Order.find().populate("user");
  const medicines = await Medicine.find();
  const appointment = await Appointment.find();
  const usersCount = await User.find().count();
  const doctorsCount = await Doctor.find().count();
  const ordersCount = await Order.find().count();
  const medicinesCount = await Medicine.find().count();
  const appointmentCount = await Appointment.find().count();
// res.send({users});
  res.render("users/admin.ejs", {
    users,
    doctors,
    orders,
    medicines,
    appointment,
    usersCount,
    doctorsCount,
    ordersCount,
    medicinesCount,
    appointmentCount,
  });
};


module.exports.renderEditForm = async (req, res) => {
  // let { id } = req.user._id;
  const myAccount = await User.findOne(req.user._id);
  // console.log(myAccount);
  
  res.render("users/editAccount.ejs", { myAccount  });
};

module.exports.updateUser = async (req, res) => {
  let NewAccount = await User.findByIdAndUpdate(req.user.id, {
    ...req.body.myAccount}, {runValidators:true, new:true}); 
  console.log(NewAccount);
  req.flash("success", "Profile Updated!");
  res.redirect("/myAcc");
}

module.exports.renderOrder = async (req, res) => {
  const myorders = await Order.find({ user: req.user.id }).populate({
    path: "cart.items.productId",
    select: "drugName image ",
  });
    // const userAdd = await Address.findOne({ user: req.user._id });
  // console.log(myorders);    
  res.render("users/myOrders.ejs", { myorders });

  
}

module.exports.renderAppointments = async (req, res) => {
  const myAppointment = await Appointment.find({
    patientName: req.user.id,
  })
    .populate("doctor");
  let doctors = [];
  
  for (let eachDoc of myAppointment) {
    const myAccount = await User.findOne(eachDoc.doctor.userId);
    doctors.push(myAccount);
  }
  // res.send({ myAppointment, doctors });
  res.render("users/myAppointments.ejs", { myAppointment, doctors });
};

module.exports.renderPayments = async (req, res) => {
  const myorders = await Order.find({ user: req.user.id }).populate(
    "user"
  );
  // const userAdd = await Address.findOne({ user: req.user._id });
  // console.log(myorders);
  res.render("users/myPayments.ejs", { myorders });
};

module.exports.renderAddress = async (req, res) => {
  const userAdd = await Address.findOne({ user: req.user.id }).populate(
    "user"
  );
// console.log(userAdd.location);
  // let response = await geocodingClient
  //   .forwardGeocode({
  //     query: userAdd.location,
  //     limit: 1,
  //   })
  //   .send();  
  // let geo = response.body.features[0].geometry.coordinates;
  // console.log(userAdd.geometry.coordinates);
  res.render("users/myAddress.ejs", { userAdd, mapToken });
};

module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/");
  });
};


