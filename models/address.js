const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: false,
  },
  location: {
    type: String,
    required: true,
    default:"None",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"], //location type must be 'point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});


module.exports = mongoose.model("Address", addressSchema);
