const express = require("express");
const router = express.Router();
const Keyword = require("../models/Keyword.model");
const crypto = require("crypto");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
function generateRandomVariable(length) {
  const buffer = crypto.randomBytes(length);
  const randomVariable = buffer.toString("hex");
  return randomVariable;
}
router.get("/", async (req, res) => {
  try {
    const keyword = await Keyword.findOne();
    console.log(keyword, 8);
    res.json(keyword);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: true,
    });
  }
});

router.post("/schedule/:id", async (req, res) => {
  console.log(req.body, req.params);

  const { id, locations, keywords } = req.body;

  try {
    const keywordalreadyexists = await Keyword.findOne();

    if (!keywordalreadyexists) {
      const newkeyword = await new Keyword({
        keywordid: id,
        locations,
        keywords,
        scheduled: true,
        savingtogooglesheet: false,
      }).save();

      res.json(newkeyword);
    } else {
      const updatekeyword = await Keyword.findOneAndUpdate(
        {
          //   keyword: id,
        },
        {
          scheduled: true,
          savingtogooglesheet: false,
          keywords,
          keywordid: id,
          locations,
          error: "",
          downloadablefiles: [],
        },
        {
          new: true,
        }
      );

      res.json(updatekeyword);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: true,
    });
  }
});

router.post("/stop/:id", async (req, res) => {
  console.log(req.body, req.params);

  const { id, locations, keywords } = req.body;

  try {
    const updatekeyword = await Keyword.findOneAndUpdate(
      {},
      {
        scheduled: false,
        keywords,
        // keywordid: id,
        locations,
        error: "",
      },
      {
        new: true,
      }
    );

    res.json(updatekeyword);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: true,
    });
  }
});

router.post("/save-keyword/:id", async (req, res) => {
  console.log(req.body, req.params);

  const downloaditem = req.body.data.downloadItem;
  const data = req.body.data;

  console.log("full data", data);
  const keywordStructure = await Keyword.findOne().lean();

  const keywordsEvaluated = keywordStructure.keywords.slice(0, 10);

  const keywordsRemaining = keywordStructure.keywords.slice(10);
  //   const downloadableItems = keywordStructure
  const url = downloaditem.finalUrl;

  console.log({ keywordsEvaluated, keywordsRemaining });

  if (!keywordStructure) {
    return res.status(404).send({ message: "no keyword" });
  }

  //   if (keywords)
  let pathtoscrub = generateRandomVariable(30) + ".csv";

  keywordStructure.downloadablefiles.push(pathtoscrub);

  try {
    console.log("trying to download url");
    const response = await axios({
      url,
      method: "GET",
      responseType: "blob", // important
    });
    let reformedData = response.data
      .replace(/\t/g, ",")
      .split("\n")
      .slice(2)
      .join("\n");
    fs.writeFileSync(
      path.join(__dirname, "..", "files", pathtoscrub),
      reformedData
    );
    // fs.writeFileSync(filePath, buffer);
  } catch (error) {
    console.log(error);
  }

  const updatedKeyword = await Keyword.findOneAndUpdate(
    {},
    {
      keywords: keywordsRemaining,
      // k,
      scheduled: keywordsRemaining.length <= 0 ? false : true,
      downloadablefiles: keywordStructure.downloadablefiles,
      savingtogooglesheet: keywordsRemaining.length <= 0,
    },
    {
      new: true,
    }
  );

  console.log(updatedKeyword, 154);
  res.json({
    message: "saved",

    downloaditem,
    updatedKeyword,
  });
});

module.exports = router;
