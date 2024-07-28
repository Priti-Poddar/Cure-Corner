const express = require("express");
const router = express.Router();
const Medicine = require("../models/medicine.js");
const Address = require("../models/address.js");

router.get("/babyCare", async (req, res) => {
  const allmedicines = await Medicine.find({ category: "Baby Care" });
  //   console.log(allmedicines);
  
      res.render("medicines/catagory.ejs", {
        allmedicines,
        category: "Baby Care",
        page:"Baby"
      });
});

router.get("/NutritionalDrinks", async (req, res) => {
  const allmedicines = await Medicine.find({
    category: "Nutritional Drinks & Supplements",
  });

  
    res.render("medicines/catagory.ejs", {
      allmedicines,
      category: "Nutritional Drinks & Supplements",
      page: "Drinks",
    });
  
  
});


router.get("/womenCare", async (req, res) => {
  const allmedicines = await Medicine.find({ category: "Women Care" });
  //   console.log(allmedicines);
  
     res.render("medicines/catagory.ejs", {
       allmedicines,
       category: "Women Care",
       page: "Women",
     });
  
 
});

router.get("/personalCare", async (req, res) => {
  const allmedicines = await Medicine.find({ category: "personal care" });
  //   console.log(allmedicines);
  
     res.render("medicines/catagory.ejs", {
       allmedicines,
       category: "Personal Care",
       page: "Personal",
     });
  
 
});

router.get("/Ayurveda", async (req, res) => {
  const allmedicines = await Medicine.find({ category: "Ayurveda" });
  //   console.log(allmedicines);
  
      res.render("medicines/catagory.ejs", {
        allmedicines,
        category: "Ayurveda",
        page: "Ayurveda",
      });

  
});

router.get("/healthDevices", async (req, res) => {
  const allmedicines = await Medicine.find({ category: "Health Devices" });
  //   console.log(allmedicines);
  
    res.render("medicines/catagory.ejs", {
      allmedicines,
      category: "Health Devices",
      page: "Devices",
    });
  
  
});


module.exports = router;
