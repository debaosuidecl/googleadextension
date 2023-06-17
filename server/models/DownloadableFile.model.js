const mongoose = require("mongoose");

const DownloadableFile = new mongoose.Schema(
  {
 
      path: {
        type: String,
      },
      location: {
        type: String
      },
      keywords:{
        type: String
      }
    
  },

  {
    timestamps: true,
  }
);

// Keyword.index({ subid: 1 });

module.exports = SubIDM = mongoose.model("DownloadableFile", DownloadableFile);
