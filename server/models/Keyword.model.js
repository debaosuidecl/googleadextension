const mongoose = require("mongoose");

const Keyword = new mongoose.Schema(
    {
        keywordid: {
            type: String
        },
        downloadablefiles: [String],
        status: {
            type: String,
        },
        googlesheetsurl: {
            type: String,
        },
        locations: [
            String,
        ],
        keyword: [
            String
        ]
    },

    {
        timestamps: true,
    }
);

Keyword.index({ subid: 1 });

module.exports = SubIDM = mongoose.model("Keyword", Keyword); 