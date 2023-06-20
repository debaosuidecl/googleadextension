const mongoose = require("mongoose");

const Keyword = new mongoose.Schema(
  {
    keywordid: {
      type: String,
    },
    scheduled: {
      type: Boolean,
    },
    initurl:{
      type: String,
    },
    savingtogooglesheet: {
      type: Boolean,
      default: false,
    },
    downloadablefiles: [{
      path: {
        type: String,
      },
      location: {
        type: String
      },
      keywords:{
        type: String
      }
    }],
    status: {
      type: String,
    },
    googlesheetsurl: {
      type: String,
    },
    error: {
      type: String,
    },
    locations: [String],
    constantlocations : [String],
    constantkeywords : [String],
    keywords: [String],
    // keywords: [String],
  },

  {
    timestamps: true,
  }
);

Keyword.index({ subid: 1 });

module.exports = SubIDM = mongoose.model("Keyword", Keyword);
