const domain = "https://gadextdeba.com";

// event listeners

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  sendResponse("seen");
  // console.log()
  console.log(message, "message in content");
  if (message.type === "ping") {
    return console.log("pong");
  }
  if (message.type === "cancel") {
    location.reload();
    return;
  }
  if (message.type === "start-keywordplanner") {
    location.reload();
    return;
  }
  if (message.type === "status-check") {
    let status = localStorage.getItem("status");
    console.log(status, 15);
    chrome.runtime.sendMessage({
      data: {
        status,
      },
    });
    return;
  }

  if (message.type === "download-data") {
    // let data = localStorage.getItem("data");
    // if (!data) return console.log("data not found");

    // data = JSON.parse(data);
    var url = new URL(window.location.href);

    // Get the search parameters from the URL
    var searchParams = new URLSearchParams(url.search);
    let location = searchParams.get("location");
    let keywords = searchParams.get("keywords");

    let downloadItem = message.data;
    // console.log(status, 15)
    chrome.runtime.sendMessage({
      type: "download-final",
      data: {
        downloadItem,
        data: "",
        keywords: keywords.split("xxxxxx") ,
        location
      },
    });

    return;
  }
});
async function delay(ms) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res("done");
    }, ms);
  });
}
function errorhandler(message = "") {
  localStorage.setItem("status", "error");
  console.log(message, "DEM DON SEND ME OOOO");
  localStorage.setItem("errormessage", message);

  localStorage.setItem("PROCESSINGALREADY", "no");

  chrome.runtime.sendMessage({
    data: {
      status: "error",
    },
  });
}

// let PROCESSINGALREADY = false;

async function keywordplaninit(data) {

  var url = new URL(window.location.href);

  // Get the search parameters from the URL
  var searchParams = new URLSearchParams(url.search);
  
  // Retrieve a specific query parameter by name
  var keywords = searchParams.get("keywords");
  let location = searchParams.get("location");
  
 
  
  // Log the parameter value to the console
  console.log(keywords, "keyword ");
  if(!keywords) return console.log("kw not available");
  if(!location) return console.log("locations not available");


  // let kwindex = parseInt(keyw) 

  keywords = keywords.split("xxxxxx")

  console.log(keywords, location);
  // return;
  data = await fetch(`${domain}/api/keyword`);
  data = await data.json();
  console.log(data, "after request");
  //   data = data.data;
  let status = data.scheduled === false ? "none" : "processing";
  console.log(data, 87);
  if (status !== "processing") {
    return console.log("status is not processing");
  }

  // chrome.runtime.sendMessage({
  //   data: {
  //     status: "processing",
  //   },
  // });

  // console.log("processing request");

  // click on light bulb to start

  await checkIfElisthere(".lightbulb-img");
  const searchstart = document.querySelector(".lightbulb-img");

  if (!searchstart) {
    errorhandler("could not start keyword planner");
    return false;
  }

  searchstart.click();

  await delay(1000);

  const remainder = await enterkeywords(data, keywords);
  console.log(remainder, "remainder");
  //   await delay(30000);
  localStorage.setItem("temp-remainder", JSON.stringify(remainder));

  // select country

  // select location button
  document.querySelector(".location-button").click();

  console.log("time to submit");

  await delay(1000);
  const result = await enterlocations(data, location);
  console.log(result, "result of locations");
  if (!result) {
    errorhandler("could not enter all locations");
    return false;
  }
  localStorage.setItem("status", "processing");

  // chrome.runtime.sendMessage({
  //   data: {
  //     status: "processing",
  //   },
  // });

  document.querySelector(".submit-button").click();

  await delay(1000);

  //   return;
  const calenderButton = await checkIfElisthere(`[icon="calendar_today"]`);

  if (!calenderButton) {
    errorhandler("could not find calendar button");
    return false;
  }
  document.querySelector(`[icon="calendar_today"]`).click();

  await delay(1000);
  const allAvailableButton = await checkIfElisthere(
    `[aria-label="Date range, All available"]`
  );

  if (!allAvailableButton) {
    errorhandler("could not find calendar button");
    return false;
  }

  document.querySelector(`[aria-label="Date range, All available"]`).click();

  await delay(1000);
  const refineWordButton = document.querySelector(".refine-message")

  if(refineWordButton){
    refineWordButton.click();
    await delay(1000)
  }
  
  const downloadavailable = await checkIfElisthere(".expand-collapse-all");

  console.log(downloadavailable, "can find expand all");

  if (!downloadavailable) {
    errorhandler("could find download trigger");
    console.log("could not find expand");
    // return false;
  }

  document.querySelector(".download.download-menu material-button").click();
  const csvdownloaditem = await checkIfElisthere(
    "material-select-item .menu-item-label-section"
  ,10);
  
  await delay(1000);
  if (!csvdownloaditem) {
    errorhandler("could not find csv item");
    console.log("could not find csv item");
    window.location.reload()
    // return false;
  }

  document
    .querySelector("material-select-item .menu-item-label-section")
    .click();
  localStorage.setItem("PROCESSINGALREADY", "no");
  console.log("waiting for 3 minutes")
  await delay(125000);
  window.location.reload();
}

async function enterkeywords(data, keywords) {
  // const keywords = data.keywords;
  const remainingValues = [];
  const el = document.querySelector(".search-input");

  for (let i = 0; i < keywords.length; i++) {
    const word = keywords[i];

    if (i >= 10) {
      remainingValues.push(word);
    }
    el.value = `${word},`;
    el.focus();
    document.execCommand("insertText", false, "extra");
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  el.value = ``;
  //   el.focus();
  return remainingValues;
}

async function checkIfElisthere(selector, tries = 0) {
  elexists = document.querySelector(selector);
  if (tries > 20) return false;
  if (elexists) return true;

  console.log(selector, "not there, trying in a second. tries:=> ", tries);

  await delay(3000);
  return checkIfElisthere(selector, tries + 1);
}
async function enterlocations(data,location) {
  const locations = data.locations;
  const el = document.querySelector(".suggest-input-container input");
  await delay(800);
  // delete previously selected locations

  const removeicons = document.querySelectorAll(".remove .icon");

  for (let i = 0; i < removeicons.length; i++) {
    const rem = removeicons[i];

    rem.click();
  }
  await delay(1000);
  console.log("enter the dragon", locations);
  // for (let i = 0; i < locations.length; i++) {
    // const location = locations[0];
    console.log(location, 187);
    el.focus();
    document.execCommand("insertText", false, location);
    // el.dispatchEvent(new Event("change", { bubbles: true }));

    // el.blur();
    // el.dispatchEvent(new Event("click", { bubbles: true }));
    console.log("still looking for this")

    const exists = await checkIfElisthere(".location-item", 15);
    if(!exists){
      document.querySelectorAll(".btn-no .content")[3].click()
      await delay(1000)
      document.querySelector(".location-button").click();
      await delay(1000)

      return enterlocations(data, location);
    }
    console.log("I saw it waiting 3 seconds to click")
    try {
       await delay(500);
      document.querySelector(".location-info").click();
    } catch (error) {
      console.log(error);
      return false;
    }
    await delay(500);
    // break
  // }

  const btns = document.querySelectorAll("material-dialog .btn-yes");

  if (btns.length === 4) {
    btns[3].click();

    return true;
  } else {
    return false;
  }
}

keywordplaninit();

console.log("connected");
