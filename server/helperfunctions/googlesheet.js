const Keyword = require("../models/Keyword.model");
const { google } = require("googleapis");
const spreadsheetId = "1_ojrEd341bmVpix-3OXPw0UGnPnT8HnAHVoZisQZTEM";
const path = require("path");
const fs = require("fs");
const { parse } = require("json2csv");
const SavedKeywordFileModel = require("../models/SavedKeywordFile.model");

// object to access information
async function clearSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./creator-app-key.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // create client instance for auth

  const client = await auth.getClient();

  // Instance of Google sheets API

  const sheets = google.sheets({ version: "v4", auth: client });
  try {
    // const spreadsheetId = "YOUR_SPREADSHEET_ID"; // Replace with the actual spreadsheet ID
    const range = "Sheet1!A1:ZZ"; // Replace with the sheet name or range you want to clear

    const request = {
      spreadsheetId,
      range,
    };

    const response = await sheets.spreadsheets.values.clear(request);
    console.log(`Cleared range: ${response.data.clearedRange}`);
  } catch (error) {
    console.error("Error clearing sheet:", error);
  }
}
async function googlesheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./creator-app-key.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // create client instance for auth

  const client = await auth.getClient();

  // Instance of Google sheets API

  const sheets = google.sheets({ version: "v4", auth: client });
  const keyword = await Keyword.findOne({
    savingtogooglesheet: true,
  });

  console.log(keyword, 8);
  if (!keyword) return;

  let downloadablefiles = keyword.downloadablefiles;

  console.log("clearing cells");
  console.time("clearing cells");
  await clearSheet();
  console.timeEnd("clearing cells");
  //   return;
  const constantkeywordsMap ={}

  for(let i=0; i < keyword.constantkeywords.length; i++){
    const key = keyword.constantkeywords[i];

    constantkeywordsMap[key.toLowerCase()] = 1;
  }
  let fields = []
  let opts = {}
  let arraytotransform = []

  for (let i = 0; i < downloadablefiles.length; i++) {
    try {
      const filepath = downloadablefiles[i].path;
      const location = downloadablefiles[i].location
      let data = [];
      let file = fs.readFileSync(
        path.join(__dirname, "..", "files", filepath),
        "utf-8"
      );
  
      let reformedfilearray = file.split("\n");
      
      for (let j = 0; j < reformedfilearray.length; j++) {
        if (i > 0 && j == 0) {
          
          continue;
        }
        const row = reformedfilearray[j].replace(/\x00/g, "");
        let arrayrow = row.split(",")
        if( i == 0 && j == 0){
          arrayrow.unshift("location")
          fields = arrayrow;
  
  
           opts = { fields };
  
  
           data.push(arrayrow);
  
  
        } else{
          arrayrow.unshift(location)
          const keyw = arrayrow[1].toLowerCase();
          if (!constantkeywordsMap.hasOwnProperty(keyw)){
            continue
          }
  
                // console.log(arrayrow, 86)
        data.push(arrayrow);
        let objectToPush = {}
        for(let i=0; i <fields.length; i++){
            const field = fields[i]
            objectToPush[field] = arrayrow[i]
        }
        arraytotransform.push(objectToPush)
  
        }
  
        // if(j === 2) return;
      }
  
      // console.log(data, 102)
  
  
      // return;
  
      // console.log("formed file", data, "formed file");
  
      // cachecsv
      // return;
      const request = {
        spreadsheetId,
        range: "Sheet1", // Replace with the sheet name or range where you want to append the data
        valueInputOption: "USER_ENTERED",
        resource: { values: data },
      };
      console.log("making request now");
      const response = await sheets.spreadsheets.values.append(request);
      console.log(`${response.data.updates.updatedCells} cells appended.`);
    } catch (error) {
      console.log(error)
    }
  }

  const csv1 = parse(arraytotransform, opts);
  fs.writeFileSync(
    path.join(__dirname, "..", `cacheres`, `${keyword.keywordid}.csv`),
    csv1
  );
    // return console.log("stop here")
  const updatedKeyword = await Keyword.findOneAndUpdate(
    {},
    {
      savingtogooglesheet: false,
    },
    {
      new: true,
    }
  );

  console.log(updatedKeyword, "updated");

  const updateCache = await new SavedKeywordFileModel({
    path: keyword.keywordid
  }).save()

  console.log(updateCache)
}

module.exports = googlesheet;
