let domain = "http://localhost:4000"; // REPLACE WITH ACTUAL BASE DOMAIN
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

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // Send a message to the content script of the active tab
    chrome.tabs.sendMessage(tabs[0].id, {
      data: downloadItem,
      type: "download-data",
    });
  });

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
    item.url.indexOf("date=") === -1
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

chrome.runtime?.onMessage?.addListener(async function (
  message,
  sender,
  sendResponse
) {
  sendResponse("seen");
  if (message.data.status === "processing") {
    // console.log("Received data from content script:", message.data);
  }
  if (message.type === "download-final") {
    console.log(message.data, "sending ajax request now");

    const res = await ajaxCall(
      "POST",
      `api/keyword/save-keyword/${message.data.data.id}`,
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
