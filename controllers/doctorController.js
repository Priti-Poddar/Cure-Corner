const Doctor = require("../models/doctorsModel");
const Address = require("../models/address.js");
const Appointment = require("../models/appointment.js");
const User = require("../models/user.js");

module.exports.getDoctors = async (req, res) => {
  const doctors = await Doctor.find().populate("userId");
  if (req.user) {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    // console.log(doctor);
  res.render("doctors/index", { doctors, doctor, page: "Doctor" });
  } else {
  res.render("doctors/index", { doctors, doctor: null, page: "Doctor" });
    
  }
};


module.exports.getAddDoctor = (req, res) => {
  res.render("doctors/add-doctor", { page: "Doctor" });
};


module.exports.postAddDoctor = async (req, res) => {
  // let { userId } = req.user._id;
  let url = req.file.path;
  let filename = req.file.filename;
  const { specialization, experience, fees, availableSlots } = req.body.doctor;
    const doctor = new Doctor({
      userId: req.user._id,
      image:{url, filename},
      specialization,
    experience,
    fees,
    availableSlots: availableSlots.split(","),
  });
  let saveDocs = await doctor.save();
  // console.log(saveDocs);
  req.flash("success", "You are register as a doctor!");
  res.redirect("/doctors");
  // console.log(req.file);
  // res.send(req.file);
};

module.exports.renderUpdatePage = async (req, res) => {
  const myDocAccount = await Doctor.findOne({ userId: req.user._id }).populate(
    "userId"
  );
  let originalImageUrl = myDocAccount.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("doctors/editDoctor.ejs", {
    myDocAccount,
    originalImageUrl,
    page: "Doctor",
  });
};


module.exports.updateDoctor = async (req, res) => {
  if (!req.body.myDocAccount) {
    throw new ExpressError(400, "Send valid data for listing");
  }
  let { id } = req.params;
  let newUser = await User.findByIdAndUpdate(req.user._id, {
    ...req.body.myAccount
  },{ runValidators: true, new: true }
  );
  let NewDocAcc = await Doctor.findByIdAndUpdate(
    id,
    {
      ...req.body.myDocAccount,
    },
    // { runValidators: true, new: true }
  );
  
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    NewDocAcc.image = { url, filename };
    await NewDocAcc.save(); //img update hobe
  }
  req.flash("success", "Profile Updated!");
  res.redirect("/myAcc");
};

module.exports.renderBookingPage = async (req, res) => {
  let { id } = req.params;
  // const address = await Address.findOne({ user: id});
  // console.log(address);
  const doctor = await Doctor.findOne({ _id: id }).populate("userId");
  // console.log(doctor.address);
  res.render("doctors/bookAppoinment.ejs", { doctor, page: "Doctor" });
};

module.exports.postBooking = async (req, res) => {
  let { id } = req.params;
  console.log(id, req.body);
  const { slot, date } = req.body;
  const appointment = new Appointment({
    doctor: id,
    patientName: req.user._id,
    date: date,
    time: slot,
  });
  let saveAppointment = await appointment.save();
  console.log(saveAppointment);
  req.flash("success", "Your appointment booked successfully!");
  res.redirect("/doctors");
  // console.log(req.file);
  // res.send(req.file);
};