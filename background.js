const domain = "https://gadextdeba.com"; // REPLACE WITH ACTUAL BASE DOMAIN
async function ajaxCall(type, path, data, callback, errCallback) {
  try {
    const result = await fetch(domain + "/" + path, {
      method: type,
      body: type === "GET" ? undefined : JSON.stringify(data),
      headers: {
        Accept: "application/json",
        // token,
        "Content-Type": "application/json",
      },
    });
    const resultjson = await result.json();

    // resolve(resultjson);
    return resultjson;
  } catch (error) {
    console.log(error);
    // reject(error);
    return error;
  }
}
chrome.downloads.onCreated.addListener(function (downloadItem) {
  // Do something with the downloadItem
  console.log(downloadItem, "downloading file");

  if(    downloadItem.finalUrl.indexOf("awn-report-download") !== -1
  )
  {chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // Send a message to the content script of the active tab
    
    chrome.tabs.sendMessage(tabs[0].id, {
      data: downloadItem,
      type: "download-data",
    });
  });}

  // send ajax request to server to parse csv
  // get csv id  from local storage
  // concatenate and create download link
});

chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
  // Prevent showing the download modal
  console.log("preventing download", item);

  if (
    item.state === "in_progress" &&
    item.referrer === "https://ads.google.com/" &&
    item.finalUrl.indexOf("awn-report-download") !== -1
    // item.url.indexOf("date=") === -1
  ) {
    // Wait for a short delay before canceling the download

    chrome.downloads.cancel(item.id, function () {
      // Perform any desired actions after canceling the download
      console.log("CSV file download canceled");
    });
  }

  // suggest({ cancel: true });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("trying to change again: ", tab, changeInfo, "changing");
  if (changeInfo.status === "complete" && /^http/.test(tab.url)) {
    try {
      chrome.tabs.sendMessage(tabId, { type: "ping" }, function (response) {
        if (response) {
          console.log("Already there");
        } else {
          console.log("Not there, inject contentscript");
          chrome.scripting
            .executeScript({
              target: { tabId: tabId },
              files: ["./Content.js"],
            })
            .then(() => {
              console.log("INJECTED THE FOREGROUND SCRIPT.");
            })
            .catch((err) => console.log(err, 12));
        }
      });
    } catch (error) {
      console.error("Error occurred:", error.message);
      console.log("Content script not injected");
    }
  }
});

const url = 'https://ads.google.com/aw/keywordplanner/home?ocid=1306628808&euid=307367185&__u=6916165065&uscid=1306628808&__c=8210297992&authuser=0'

chrome.runtime?.onMessage?.addListener(async function (
  message,
  sender,
  sendResponse
) {
  sendResponse("seen");

  if(message.type === "bulkrun"){
    console.log(message.data, 'bulk running');
    let i=0;
    message.data.locations.forEach(function(location) {
      chrome.windows.create({ url:`${url}&keywords=${message.data.keywords.join("xxxxxx")}&location=${location}`, type: "normal" }, function(window) {
        chrome.tabs.executeScript(window.tabs[0].id, { file: "Content.js" });
      });
      i++
    });
    return
  }
  if (message.data.status === "processing") {
    // console.log("Received data from content script:", message.data);
  }
  if (message.type === "download-final") {
    console.log(message.data, "sending ajax request now");

    const res = await ajaxCall(
      "POST",
      `api/keyword/save-keyword/v2/${message.data.data.id}`,
      {
        data: message.data,
      }
    );

    chrome.tabs?.query({ active: true, currentWindow: true }, function (tabs) {
      // Send a message to the content script of the active tab
      chrome.tabs?.sendMessage(tabs[0].id, {
        type: "start-keywordplanner",
      });
    });

    console.log(res, "response from ajax");

    if (res.updatedKeyword?.keywords?.length <= 0) {
      // updated UI

      chrome.runtime.sendMessage({
        type: "update-popup-ui",
        data: res.updatedKeyword,
      });
    }
  }
});
