const Doctor = require("../models/doctorsModel");


module.exports.getDoctors = async (req, res) => {
    const doctors = await Doctor.find().populate("userId");
    console.log(doctors);
  res.render("doctors/index", { doctors });
};

module.exports.getAddDoctor = (req, res) => {
  res.render("doctors/add-doctor");
};

module.exports.postAddDoctor = async (req, res) => {
    // let { userId } = req.user._id;
  const { specialization,experience,fees, availableSlots } = req.body;
    const doctor = new Doctor({
      userId:req.user._id,
      specialization,
      experience,
    fees,
    availableSlots: availableSlots.split(","),
  });
  await doctor.save();
  res.redirect("/doctors");
};