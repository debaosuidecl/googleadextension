const axios = require("axios");
const fs = require("fs");

function convertBlobToCSV(blob, filePath) {
  const fileStream = fs.createWriteStream(filePath);

  // Read the Blob data as a Buffer
  const reader = new FileReader();
  reader.onloadend = function () {
    const buffer = Buffer.from(reader.result);

    // Write the Buffer data to the file stream
    fileStream.write(buffer);
    fileStream.end();
  };
  reader.readAsArrayBuffer(blob);

  fileStream.on("finish", function () {
    console.log("Blob converted to CSV file successfully!");
  });

  fileStream.on("error", function (err) {
    console.error("Error converting Blob to CSV:", err);
  });
}
(async () => {
  try {
    const data = fs.readFileSync("./mypath.txt", "utf-8");
    // console.log(data.replace(/\t/g, ","), "data");
    let reformeddata = data.replace(/\t/g, ",").split("\n").slice(2).join("\n");

    // console.log(reformeddata, 32);
    fs.writeFileSync("./mypathreformed.csv", reformeddata);
  } catch (error) {
    console.log(error);
  }

  //   try {
  //     // console.log("fetching");
  //     console.log("fetching");
  //     axios({
  //       url: "https://storage.googleapis.com/awn-report-download/download/770481436/Keyword%20Stats%202023-06-09%20at%2017_44_07.csv?GoogleAccessId=816718982741-compute@developer.gserviceaccount.com&Expires=1686329651&response-content-disposition=attachment&Signature=f6n12XNj6va6sboxuWW3dsM3P6b%2F0XqFGoAYnqfE7f1wdI0863C%2BOxBiC8yAc6cWtkk74U5iPNDMLiaDG%2FwzdlQwTjz6iZRlp63cOYAchZAuV0zYdZ04mj9i4QyJkpkujt%2BsTplC5JNJgAI9O98kL5y%2BaxzaAojFFyY%2BjtoLMVtS3XN6Mct4oxUjFqJ6h6hxyjsE6M5iMLv6A8VSQpGDCSk8wcQfqglywtFc%2B9Lrw%2B%2B2DKZ5rB25vSM1yfhdg5EtB8QXFEchgTh%2BpGqapd0y9RzMLAme50BCveywLGmDzUzUbTqmERme50ZUcw2pEgD1Iv9gSaYidaSik8hUZTHviw%3D%3D",
  //       method: "GET",
  //       responseType: "blob", // important
  //     })
  //       .then((response) => {
  //         console.log("here");
  //         const filePath = "output.csv";
  //         // convertBlobToCSV(blobData, filePath);
  //         const buffer = Buffer.from(response.data, "binary");
  //         fs.writeFileSync("mypath.txt", response.data);
  //         fs.writeFileSync(filePath, buffer);
  //       })
  //       .catch((err) => {
  //         console.log(err.response, err);
  //       });
  //   } catch (error) {
  //     console.log(error.response);
  //   }
})();
