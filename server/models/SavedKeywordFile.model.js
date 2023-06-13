const mongoose = require("mongoose");

const SavedKeywordFile = new mongoose.Schema(
  {
    path: {
        type: String,
    }, 

    name: {
        type: String,
    }
  },

  {
    timestamps: true,
  }
);


module.exports = SubIDM = mongoose.model("SavedKeywordFile", SavedKeywordFile);
