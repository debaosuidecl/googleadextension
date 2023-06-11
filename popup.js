// state
const domain = `http://localhost:5000`;
let error = "";
let keywords = [
  "Traeger",
  "Pitboss",
  "Z Grill",
  "Campchef",
  "Weber",
  "BBQ",
  "BBQ Galore",
  "Smoker",
  "Electric Smoker",
  "Pellet Smoker",
  "Pellet Grill",
];

const locations = [
  "Victoria Australia",
  "New South Wales Australia",
  "Queensland Australia",
  "Western Australia",
  "Northern Territory Australia",
  "Tasmania Australia",
  "South Australia",
  "Perth Australia",
  "Townsville",
  "Australia",
];

// elements
const keywordinputelement = document.querySelector("#keywordinput");
const locationelement = document.querySelector("#locationinput");
const keywordselement = document.querySelector(".keywords");
const loadcont = document.querySelector("#loadcont");
const generateButton = document.querySelector("#generate");
const tabselement = document.querySelector(".tabs");
const tab1items = document.querySelector(".tab1items");
const initloader = document.querySelector("#init");
const cancelgeneration = document.querySelector("#cancelgeneration");
const cancelcont = document.querySelector(".cancelcont");
//  eventlistners

keywordinputelement.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    console.log(e.target.value);
    if (keywordinputelement.value === "") {
      return;
    } else {
      keywords.push(keywordinputelement.value);
      refreshKeywordList();
    }
  }
});

generateButton.addEventListener("click", async (e) => {
  loadcont.classList.add("show");
  error = "";

  setErrorUI("", true);

  try {
    await axios.post(`${domain}/api/keyword/schedule/${makeid(25)}`, {
      id: makeid(25),

      locations,
      keywords,
    });
    cancelcont.classList.remove("hiding");
  } catch (error) {
    console.log(error);
    loadcont.classList.remove("show");

    return setErrorUI("could not generate report", true);
  }
  try {
    // send request to background
    chrome.tabs?.query({ active: true, currentWindow: true }, function (tabs) {
      // Send a message to the content script of the active tab
      chrome.tabs?.sendMessage(tabs[0].id, {
        type: "start-keywordplanner",
        id: makeid(25),
        data: {
          locations,
          keywords,
        },
      });
    });
  } catch (error) {
    console.log(error);
  } finally {
    // loadcont.classList.remove("show")
  }
});

cancelgeneration.addEventListener("click", async (e) => {
  loadcont.classList.add("show");
  error = "";

  setErrorUI("", true);

  try {
    await axios.post(`${domain}/api/keyword/stop/${makeid(25)}`, {
      keywords,
      locations,
    });
    tabselement.classList.remove("hiding");
    tab1items.classList.remove("hiding");
    tab1items.classList.remove("hiding");
    initloader.classList.add("hiding");
    loadcont.classList.add("hiding");
    generateButton.disabled = false;
    generateButton.textContent = "Generate";
    cancelcont.classList.add("hiding");
    chrome.tabs?.query({ active: true, currentWindow: true }, function (tabs) {
      // Send a message to the content script of the active tab
      chrome.tabs?.executeScript(tabs[0].id, { code: null });
    });
  } catch (error) {
    console.log(error);
    loadcont.classList.remove("show");

    return setErrorUI("could not generate report", true);
  }
  try {
    // send request to background
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Send a message to the content script of the active tab
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "cancel",
      });
    });
  } catch (error) {
    console.log(error);
  } finally {
    loadcont.classList.remove("show");
    initloader.classList.add("hiding");
  }
});

chrome.runtime?.onMessage?.addListener(function (
  message,
  sender,
  sendResponse
) {
  if (message.data.status === "processing") {
    // Handle the received data
    loadcont.classList.add("show");
    document.getElementById("generate").textContent = "PROCESSING";
    document.getElementById("generate").disabled = true;

    sendResponse("seen");
    // console.log("Received data from content script:", message.data);
  }
  if (message.data.status === "error") {
    // Handle the received data
    loadcont.classList.remove("show");
    // document.getElementById("generate").textContent = "PROCESSING"
    document.getElementById("generate").disabled = false;

    sendResponse("seen");
    // console.log("Received data from content script:", message.data);
  }
  if (message.type === "update-popup-ui") {
    // Handle the received data
    getServerData();

    sendResponse("seen");
    // console.log("Received data from content script:", message.data);
  }
});

// functions

function refreshKeywordList() {
  keywordselement.innerHTML = ``;
  keywordinputelement.value = "";
  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    keywordselement.innerHTML += `
        <div class="keyword">
              <p>${keyword} <span class="del" data-keyword="${keyword}">&#x2715;</span></p>
        </div>
        `;
  }

  const alldels = document.querySelectorAll(".keywords .del");

  for (let i = 0; i < alldels.length; i++) {
    const del = alldels[i];
    del.addEventListener("click", (e) => {
      const keyword = e.target.getAttribute("data-keyword");
      keywords = keywords.filter((k) => k !== keyword);
      refreshKeywordList();
    });
  }
}

function setErrorUI(message, noreload) {
  initloader.classList.add("hiding");

  document.querySelector("#errorcont").classList.remove("hiding");

  // console.log(document.querySelector("#error"),)

  document.querySelector("#error").textContent = message;
  if (noreload) {
    document.querySelector("#errorcont a").classList.add("hiding");
  } else {
    document.querySelector("#errorcont a").addEventListener("click", (e) => {
      getServerData();
    });
  }
}
async function getServerData() {
  let result = {};

  try {
    initloader.classList.remove("hiding");

    result = await axios.get(`${domain}/api/keyword`);
  } catch (error) {
    console.log(error);
    error = "Could Not Fetch Keyword Planner Data";
    return setErrorUI("Could Not Fetch Keyword Planner Data");
  }

  console.log(result.data);
  if (!result.data) {
    tabselement.classList.remove("hiding");
    tab1items.classList.remove("hiding");
    tab1items.classList.remove("hiding");
    initloader.classList.add("hiding");
    generateButton.disabled = false;

    return;
  }

  if (!result.data.scheduled) {
    tabselement.classList.remove("hiding");
    tab1items.classList.remove("hiding");
    initloader.classList.add("hiding");
    loadcont.classList.add("hiding");
    loadcont.classList.remove("show");
    cancelcont.classList.add("hiding");
    generateButton.disabled = false;
    generateButton.textContent = "Generate";

    return;
  }
  if (result.data.scheduled) {
    tabselement.classList.remove("hiding");
    tab1items.classList.remove("hiding");
    tab1items.classList.remove("hiding");
    initloader.classList.add("hiding");
    loadcont.classList.add("show");
    generateButton.disabled = true;
    generateButton.textContent = "Generating report...";
    cancelcont.classList.remove("hiding");
    return;
  }
  if (result.data.error) {
    tabselement.classList.remove("hiding");
    tab1items.classList.remove("hiding");
    initloader.classList.add("hiding");
    loadcont.classList.add("hiding");
    generateButton.disabled = false;
    generateButton.textContent = "generate";

    setErrorUI(result.data.error, false);

    return;
  }
}

function statusCheck() {
  chrome.tabs?.query({ active: true, currentWindow: true }, function (tabs) {
    // Send a message to the content script of the active tab
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "status-check",
    });
  });
}
// INITIALIZE

refreshKeywordList();

// statusCheck();

getServerData();
