const mongoose = require("mongoose");
const initData = require("./data.js");
const Medicine = require("./../models/medicine.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/curecorner";
// const { faker } = require( "@faker-js/faker");


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Medicine.deleteMany({});//collection khali korbe  
  await Medicine.insertMany(initData.data);//new data add korbe
    console.log("data was inistialized");
}

initDB();//calling the func






