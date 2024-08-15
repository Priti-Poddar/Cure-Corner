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
  Pname: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  message: {
    type: String
  }
});

const HealthRecords = mongoose.model("HealthRecord", schema);

module.exports = HealthRecords;
