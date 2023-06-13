const express = require("express");
const router = express.Router();
const Keyword = require("../models/Keyword.model");
const crypto = require("crypto");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const SavedKeywordFileModel = require("../models/SavedKeywordFile.model");
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
router.get("/saved-files", async (req, res) => {
  try {
    const saved = await SavedKeywordFileModel.find();
    console.log(saved, 8);
    res.json(saved);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: true,
    });
  }
});
router.get("/download/:filename", async (req, res) => {
  try {
    // fs.readFileSync(path.join(__dirname, "..", "cacheres", req.params.filename))
    const filename = req.params.filename;
		const filejoin = path.resolve(__dirname, "..", "cacheres", filename + ".csv");
		const file = fs.createReadStream(filejoin);
		console.log(filename, "the file path", filejoin);

		res.setHeader("Content-Type", "application/csv");
		// res.setHeader(`Content-Disposition", "filename=cached-pdf-${req.query.date.replace(/\//g, "")}.csv`);
    const fileName = `cached-pdf-${req.query.date.replace(/\//g, "")}.csv`;

    // Set the Content-Disposition header
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  
  
		file.pipe(res);
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
        constantlocations: locations,
        constantkeywords: keywords,
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
          constantlocations: locations,
          constantkeywords: keywords,


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

  // const keywordsEvaluated = keywordStructure.keywords.slice(0, 10);
  
  const currentLocation = keywordStructure.locations[0]
  let newlocations = keywordStructure.locations.slice(1);
  let keywordsRemaining = keywordStructure.keywords

  if(newlocations.length <=0){

    keywordsRemaining = keywordStructure.keywords.slice(10);
    newlocations = keywordStructure.constantlocations;
  }

  //   const downloadableItems = keywordStructure
  const url = downloaditem.finalUrl;

  console.log({  keywordsRemaining });

  if (!keywordStructure) {
    return res.status(404).send({ message: "no keyword" });
  }

  //   if (keywords)
  let pathtoscrub = generateRandomVariable(30) + ".csv";

  keywordStructure.downloadablefiles.push({path: pathtoscrub, location: currentLocation});

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
      locations: newlocations,
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
