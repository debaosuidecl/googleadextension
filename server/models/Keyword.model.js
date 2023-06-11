const mongoose = require("mongoose");

const Keyword = new mongoose.Schema(
  {
    keywordid: {
      type: String,
    },
    scheduled: {
      type: Boolean,
    },
    savingtogooglesheet: {
      type: Boolean,
      default: false,
    },
    downloadablefiles: [String],
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
    keywords: [String],
    // keywords: [String],
  },

  {
    timestamps: true,
  }
);

Keyword.index({ subid: 1 });

module.exports = SubIDM = mongoose.model("Keyword", Keyword);
