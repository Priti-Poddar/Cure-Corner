const express = require("express");
const router = express.Router();
// IMPORTING PACKAGE/MODELS
const fs = require('fs');
const csvParser = require('csv-parser');
const path = require('path');
const File = require("../models/csv.js");
const Medicine = require("../models/medicine.js");
const { isAdmin } = require("../middleware.js");
const multer = require("multer");
const csv = require("csvtojson");
// const upload = multer({ dest:"uploads" });
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
});
const upload = multer({ storage });


router.get("/uploadAll", async (req, res) => {
 try {
        let file = await File.find({});
        return res.render("medicines/createMany.ejs", {
          files: file,
        });
     
    } catch (error) {
        console.log('Error in homeController/home', error);
        return res.redirect("/");
    }
});

router.post("/uploadAll", upload.single("file"),async (req, res) => {
    // console.log(req.file);
try {
  // file is not present
  if (!req.file) {
    return res.status(400).send("No files were uploaded.");
  }
  // file is not csv
  if (req.file.mimetype != "text/csv") {
    return res.status(400).send("Select CSV files only.");
  }
  // console.log(req.file);
  let file = await File.create({
    fileName: req.file.originalname,
    filePath: req.file.path,
    file: req.file.filename,
  });
//     console.log(file);

    const jsonArray = await csv().fromFile(req.file.path);
    // res.send(jsonArray);
    const newMedicine = await Medicine.insertMany(jsonArray);
    req.flash("success", "Csv file uploaded successfully!");
    res.redirect("/admin/uploadAll");
} catch (error) {
  console.log("Error in fileController/upload", error);
  res.status(500).send("Internal server error");
}
});

// fileController.view;fileController.delete
// EXPORTING FUNCTION To open file viewer page
router.get("/view/:id", async (req, res) => {
    try {
      // console.log(req.params);
      let csvFile = await File.findOne({ file: req.params.id });
    //   console.log(csvFile);
      const results = [];
      const header = [];
      fs.createReadStream(csvFile.filePath) //seeting up the path for file upload
        .pipe(csvParser())
        .on("headers", (headers) => {
          headers.map((head) => {
            header.push(head);
          });
        })
        .on("data", (data) => results.push(data))
        .on("end", () => {
          res.render("medicines/showInventory.ejs", {
            fileName: csvFile.fileName,
            head: header,
            data: results,
            length: results.length,
          });
        });
    } catch (error) {
      console.log("Error in fileController/view", error);
      res.status(500).send("Internal server error");
    }

} );
router.get("/delete/:id", async (req, res) => {
     try {
       // console.log(req.params);
       let isFile = await File.findOne({ file: req.params.id });
      // console.log(isFile);
       if (isFile) {
         const jsonArray = await csv().fromFile(isFile.filePath);
         await File.deleteOne({ file: req.params.id });
         for (let i of jsonArray) { 
           const del = await Medicine.deleteOne(i);
          //  console.log(del);
         }
         return res.redirect("/admin/uploadAll");
       } else {
         console.log("File not found");
         return res.redirect("/admin/uploadAll");
       }
     } catch (error) {
       console.log("Error in fileController/delete", error);
       return;
     }
} );




module.exports = router;
