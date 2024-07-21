const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    default: "",
  },
  gender: {
    type: String,
    default: "neither",
  },
  mobile: {
    type: Number,
    default: "",
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
