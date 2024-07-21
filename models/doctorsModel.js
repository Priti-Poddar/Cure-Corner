// const { string, required } = require("joi");
const mongoose = require("mongoose");

const schema = mongoose.Schema({
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  specialization: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
    min: 1,
  },
  fees: {
    type: Number,
    required: true,
    min: 0,
  },
  availableSlots: {
    type: Array,
    required: true,
  },
});

const Doctor = mongoose.model("Doctor", schema);

module.exports = Doctor;
