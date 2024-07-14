const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const medicineSchema = new Schema({
  drugName: {
    type: String,
    required: true,
  },
  manufacturer: {
    type: String,
  },
  description: String,
  image: {
    type: String,
    default:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY9lX-RAI4Z7sPe7oqfVHJa7rTBUz2Mhjjrg&s",
    set: (v) =>
      v === ""
        ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY9lX-RAI4Z7sPe7oqfVHJa7rTBUz2Mhjjrg&s"
        : v,
  },
  consumeType: String,
  expirydate: {
    type: String,
    // required: true,
  },
  price: { type:Number, required:true },
  sideEffects: String,
  disclaimer: String,
  category: {
    type: String,
    required: true,
  },
  countInStock: {
    type: Number,
    required: true,
  },
});

const Medicine = mongoose.model("Medicine", medicineSchema);

module.exports = Medicine;