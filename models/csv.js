const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
    },
    filePath: {
      type: String,
    },
    file: {
      type: String,
    },
  },
  {
    timestamps: {
      options: { timeZone: "Asia/Kolkata" },
    },
  }
);

module.exports = mongoose.model("File", fileSchema);


