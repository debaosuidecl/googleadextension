let domain = "https://gadextdeba.com"; // REPLACE WITH ACTUAL BASE DOMAIN
let windowIDs = [];
let windowObjects = {}
let constantLocations = []
let keywordsarray = []
let constantkeywordsarray = []
let downloadList = [];
let creationDetails = []
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
async function delay(ms) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res("done");
    }, ms);
  });
}
chrome.downloads.onCreated.addListener(async function (downloadItem) {
  // Do something with the downloadItem
  console.log(downloadItem, "downloading file");

  if(    
    downloadItem.finalUrl.indexOf("awn-report-download") !== -1
  )
  {
    console.log("waiting for 5 seconds")
    await delay(5000)

  //   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //   // Send a message to the content script of the active tab
    
  //   chrome.tabs.sendMessage(tabs[0].id, {
  //     data: downloadItem,
  //     type: "download-data",
  //   });
  // });
//   let windowId = downloadList.shift();

//   // chrome.windows.get(windowId, function(window) {
//   //   // Use the window object as needed
//   //   console.log("Window:", window);

//   // });
//   chrome.tabs.query({ windowId}, function(tabs) {
//     // Get the first tab
//     var firstTab = tabs[0];
// // 
//     // Use the first tab as needed
//     console.log("First tab:", firstTab);
//     chrome.tabs.sendMessage(tabs[0].id, {
//     data: downloadItem,
//     type: "download-data",
//   });
//   });

// chrome.tabs.query({ url: downloadItem.url }, function(tabs) {
//     if (tabs.length > 0) {
//       var tabId = tabs[0].id;

//       // Use the tabId as needed
//       console.log("Download from Tab ID:", tabId);
//     }
//   });



  // chrome.windows.getCurrent(function(currentWindow) {
    // Get the tabs in the current window
    const downloadid = downloadItem.finalUrl.split("/download/")[1].split("/Keyword")[0]
  
    chrome.windows.getAll({ populate: true },  async function(windows) {

      // Process the windows
      windows.forEach(async function(window) {
        // Access window properties
        console.log('Window ID:', window.id);
        console.log('Window Type:', window.type);
        console.log('Window Tabs:', window.tabs);
      chrome.tabs.sendMessage(window.tabs[0].id, {
        data: downloadItem,
        downloadid,
        windowId:  window.id,
        type: "download-data",
    });
        // ...
      });
    });



}

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
  // console.log("trying to change again: ", tab, changeInfo, "changing");
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
function split(a, n) {
  let newArray = [];
  let total = a;
  for (let i = 0; i < total.length; i++) {
    if (a.length <= 0) return newArray;
    newArray.push([...a.slice(0, n)]);
    a = a.slice(n);
  }
  return newArray
}
function runBulkRun(message, start = false){
  if(start){
    console.log(message.data, 'bulk running');
    let i=0;
    constantkeywordsarray = message.data.keywords;
     keywordsarray =  split( message.data.keywords, 10)
    constantLocations = [...message.data.locations]
    console.log({constantLocations})
    
    
    for (let j=0; j < keywordsarray.length; j++){
      const  keywords = keywordsarray[j]
      console.log(keywords, j)
    message.data.locations.forEach(function(location) {
        creationDetails.push({ url:`${url}&keywords=${keywords.join("xxxxxx")}&location=${location}`, type: "normal" })
        i++
      });
    }
  }

 let chromeexexutionnow =  creationDetails.slice(0,3)
 creationDetails = creationDetails.slice(3);

 chromeexexutionnow.forEach(obj=>{
  chrome.windows.create(obj, function(window) {
    windowIDs.push(window.id)
    downloadList.push(window.id)
    });
 })

}
chrome.runtime?.onMessage?.addListener(async function (
  message,
  sender,
  sendResponse
) {


  if (message.action === 'getWindowId') {
    // Get the window ID from the sender
    var windowId = sender.tab.windowId;
    
    // Send the window ID as a response
    sendResponse({ windowId: windowId });
    return;
  }
  if (message.action === 'setDownloadObject') {
    // console.log("updated windowObjects")
    windowObjects[message.payload.valueofdownloadid] =  message.payload.windowId;
    console.log("updated windowObjects", windowObjects, 173)

  }
  sendResponse("seen");

  if(message.type === "bulkrun"){
      runBulkRun(message, true)
    
  
    return
  }
  if(message.type === "cancel"){

    for(let i=0; i < windowIDs.length; i++){
      const windowId = windowIDs[i]
      chrome.windows.remove(windowId);

    }
    windowIDs = []
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

    // chrome.tabs?.query({ active: true, currentWindow: true }, function (tabs) {
    //   // Send a message to the content script of the active tab
    //   chrome.tabs?.sendMessage(tabs[0].id, {
    //     type: "start-keywordplanner",
    //   });
    // });

    // Get the current window ID
    // chrome.windows.getCurrent(function(window) {
    //   var windowId = window.id;

      // Close the current window
      console.log("close window: ", windowId)
      chrome.windows.remove(message.data.windowId);
      windowIDs = windowIDs.filter(v=> v!= message.data.windowId)
      console.log(windowIDs, 'wids after close')
      if(windowIDs.length <= 0){
        runBulkRun({
          data: {
            locations: constantLocations,
            keywords: constantkeywordsarray
          }
        })
      }
    // });

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


