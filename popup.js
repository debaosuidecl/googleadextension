// state
const domain = "https://gadextdeba.com";
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
const tab2items = document.querySelector(".tab2items");
const initloader = document.querySelector("#init");
const cancelgeneration = document.querySelector("#cancelgeneration");
const cancelcont = document.querySelector(".cancelcont");
const homenav = document.querySelector("#home")
const livenav = document.querySelector("#live")
const savednav = document.querySelector("#saved")
const savedlist = document.querySelector("#saveddata")
//  eventlistners

keywordinputelement.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    console.log(e.target.value);
    if (keywordinputelement.value === "") {
      return;
    } else {
      keywords.push(keywordinputelement.value);
      refreshKeywordList(keywords);
    }
  }
});

generateButton.addEventListener("click", async (e) => {
  loadcont.classList.add("show");
  error = "";

  setErrorUI("", true);

  console.log(keywords, 'the ones we want to send')
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

    chrome.runtime.sendMessage({
      type: "bulkrun",
      data: {
        keywords,
        locations

      }
    });
    // chrome.tabs?.query({ active: true, currentWindow: true }, function (tabs) {
    //   // Send a message to the content script of the active tab
    //   chrome.tabs?.sendMessage(tabs[0].id, {
    //     type: "start-keywordplanner",
    //     id: makeid(25),
    //     data: {
    //       locations,
    //       keywords,
    //     },
    //   });
    // });

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

homenav.addEventListener("click", (e)=>{
  tab2items.classList.add("hiding");
  tab1items.classList.add("hiding");
  initloader.classList.remove("hiding")
  savednav.classList.remove("active")
  homenav.classList.add("active")
  getServerData()
})
savednav.addEventListener("click", (e)=>{
  tab1items.classList.add("hiding");
  tab2items.classList.remove("hiding");
  [homenav, livenav].forEach(v=> v.classList.remove("active"))
  savednav.classList.add("active")
  getSavedData()
})

// chrome listener

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

function refreshKeywordList(keywordsparam) {
  keywordselement.innerHTML = ``;
  keywordinputelement.value = "";
  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywordsparam[i];
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
      keywords = keywordsparam.filter((k) => k !== keyword);
      refreshKeywordList(keywords);
      
    });
  }

  return keywords;

  // console.log(keywords, 224)
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
    refreshKeywordList(keywords)
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
    refreshKeywordList(keywords)


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
    keywords = result.data.keywords;
    console.log("we  are scheduled,", result.data)
    refreshKeywordList(result.data.keywords);

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

async function getSavedData() {
  let result = {};

  try {
    initloader.classList.remove("hiding");

    result = await axios.get(`${domain}/api/keyword/saved-files`);
  } catch (error) {
    console.log(error);
    error = "Could Not Fetch Keyword Saved Data";
    initloader.classList.add("hiding");

    return setErrorUI("Could Not Fetch Keyword Saved Data");
  } finally{
    initloader.classList.add("hiding");

  }

  console.log(result.data);

  const savedKeywordDataSet = result.data;


  savedlist.innerHTML = ""



  for(let i=0; i < savedKeywordDataSet.length; i++)
    {
      const savedkeyword = savedKeywordDataSet[i]
      savedlist.innerHTML += `
        <li><p>Report Created on : ${formatdate(savedkeyword.createdAt)} ${formattime(savedkeyword.createdAt)}</p><p><a target="_blank"  href="${domain}/api/keyword/download/${savedkeyword.path}?date=${formatdate(savedkeyword.createdAt)}">Download</a></p></li>
      `

    }
}

function _2digits(number){
  let string = number.toString();

  if(string.length <= 1){
    return `0${string}`
  }
  return string;
}

function formatdate(date){

  return _2digits(new Date(date).getMonth()+1) + "/" + _2digits(new Date(date).getDate()) + "/" + new Date(date).getFullYear()
}
function formattime(date){

  return _2digits(new Date(date).getHours()) + ":" + _2digits(new Date(date).getMinutes()) + ":" + _2digits(new Date(date).getSeconds())
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

// refreshKeywordList(keywords);

// statusCheck();

getServerData();
