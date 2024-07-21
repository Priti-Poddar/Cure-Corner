const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  patientName: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: String,
  time: String,
});

module.exports = mongoose.model("Appointment", appointmentSchema);
