const Keyword = require("../models/Keyword.model");
const { google } = require("googleapis");
const spreadsheetId = "138hLBPL_QWZhJgv4nCZtZDYSGpCyxmVnwdbTyl2qhlA";
const path = require("path");
const fs = require("fs");
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
  for (let i = 0; i < downloadablefiles.length; i++) {
    const filepath = downloadablefiles[i];
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
      data.push(row.split(","));
    }

    // console.log("formed file", data, "formed file");
    const request = {
      spreadsheetId,
      range: "Sheet1", // Replace with the sheet name or range where you want to append the data
      valueInputOption: "USER_ENTERED",
      resource: { values: data },
    };
    console.log("making request now");
    const response = await sheets.spreadsheets.values.append(request);
    console.log(`${response.data.updates.updatedCells} cells appended.`);
  }

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
}

module.exports = googlesheet;
