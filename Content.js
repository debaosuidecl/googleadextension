// event listeners
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    sendResponse("seen")
    // console.log()
    console.log(message, 'message in content')
    if (message.type === "ping") {
        return console.log("pong")
    }
    if (message.type === "start-keywordplanner") {
        localStorage.setItem("status", "processing")
        localStorage.setItem("data", JSON.stringify(message))

        keywordplaninit(message)
        return

    }
    if (message.type === "status-check") {
        let status = localStorage.getItem("status")
        console.log(status, 15)
        chrome.runtime.sendMessage({
            data: {
                status
            }
        });
        return
    }


    if (message.type === "download-data") {
        let data = localStorage.getItem("data")
        if (!data) return console.log("data not found");

        data = JSON.parse(data);
        let downloadItem = message.data
        // console.log(status, 15)
        chrome.runtime.sendMessage({
            type: "download-final",
            data: {
                downloadItem,
                data
            }
        });

        return


    }




})
async function delay(ms) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res('done')
        }, ms)
    });
}
function errorhandler(message = "") {
    localStorage.setItem("status", "error")
    console.log(message, 'DEM DON SEND ME OOOO')
    localStorage.setItem("errormessage", message)

    localStorage.setItem("PROCESSINGALREADY", "no")

    chrome.runtime.sendMessage({
        data: {
            status: "error"
        }
    });
}


// let PROCESSINGALREADY = false;

async function keywordplaninit(data) {
    // let PROCESSINGALREADY = localStorage.getItem("PROCESSINGALREADY")
    // if (PROCESSINGALREADY === "yes") return console.log("it is already processing")
    // localStorage.setItem("PROCESSINGALREADY", "yes")

    if (!data) {
        // fet data from local storage and status

        data = localStorage.getItem("data")

        data = JSON.parse(data)
    }

    let status = localStorage.getItem("status");

    if (status !== "processing") {

        return console.log("status is not processing")
    }

    chrome.runtime.sendMessage({
        data: {
            status: "processing"
        }
    });



    console.log("processing request")

    // click on light bulb to start

    await checkIfElisthere(".lightbulb-img")
    const searchstart = document.querySelector('.lightbulb-img')

    if (!searchstart) {
        errorhandler("could not start keyword planner")
        return false;
    }

    searchstart.click();

    await delay(1000);

    const remainder = await enterkeywords(data.data)
    console.log(remainder, "remainder")

    localStorage.setItem("temp-remainder", JSON.stringify(remainder))

    // select country

    // select location button
    document.querySelector(".location-button").click()

    console.log("time to submit");

    await delay(1000);
    const result = await enterlocations(data.data)
    console.log(result, "result of locations")
    if (!result) {
        errorhandler("could not enter all locations")
        return false;
    }
    localStorage.setItem("status", "processing")

    chrome.runtime.sendMessage({
        data: {
            status: "processing"
        }
    });


    document.querySelector(".submit-button").click()


    const downloadavailable = await checkIfElisthere(".expand-collapse-all")

    console.log(downloadavailable, "can find expand all")


    if (!downloadavailable) {
        errorhandler("could find download trigger")
        console.log("could not find expand")
        return false;
    }

    document.querySelector('.download.download-menu material-button').click();
    const csvdownloaditem = checkIfElisthere("material-select-item .menu-item-label-section");
    await delay(1000);
    if (!csvdownloaditem) {
        errorhandler("could not find csv item")
        console.log("could not find csv item")
        return false;
    }


    document.querySelector("material-select-item .menu-item-label-section").click()
    localStorage.setItem("PROCESSINGALREADY", "no")


    // document.querySelector(".expand-collapse-all").click()

    // chrome.tabs.query({ active: true }, function (tabs) {
    //     chrome.debugger.attach({ tabId: tabs[0].id }, "1.0");
    //     // chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.insertText', { text: '1234567'});
    //     chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { type: 'char', text: "love" });

    //     // chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { type: 'char', text: "123456789"  });
    //     // chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { type: 'keyDown', windowsVirtualKeyCode:13, nativeVirtualKeyCode : 13, macCharCode: 13  });
    //     chrome.debugger.detach({ tabId: tabs[0].id });
    // });



}

async function enterkeywords(data) {
    const keywords = data.keywords
    const remainingValues = [];
    for (let i = 0; i < keywords.length; i++) {
        const word = keywords[i]

        if (i >= 10) {
            remainingValues.push(word)
        }
        const el = document.querySelector('.search-input');
        el.value = `${word},`
        el.focus();
        document.execCommand('insertText', false, 'extra');
        el.dispatchEvent(new Event('change', { bubbles: true }))

    }


    return remainingValues
}

async function checkIfElisthere(selector, tries = 0) {

    elexists = document.querySelector(selector);
    if (tries > 20) return false;
    if (elexists) return true;

    console.log(selector, 'not there, trying in a second. tries:=> ', tries)

    await delay(1000);
    return checkIfElisthere(selector, tries + 1)
}
async function enterlocations(data) {
    const locations = data.locations;
    const el = document.querySelector('.suggest-input-container input');
    await delay(800);
    // delete previously selected locations

    const removeicons = document.querySelectorAll(".remove .icon")

    for (let i = 0; i < removeicons.length; i++) {
        const rem = removeicons[i];

        rem.click();
    }
    await delay(1000);
    console.log("enter the dragon", locations)
    for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        console.log(location, 187)
        el.focus();
        document.execCommand('insertText', false, location);
        el.dispatchEvent(new Event('change', { bubbles: true }))
        await checkIfElisthere(".location-info")
        try {
            document.querySelector(".location-info").click()

        } catch (error) {
            console.log(error);
            return false;
        }
        await delay(500);
    }

    const btns = document.querySelectorAll("material-dialog .btn-yes")

    if (btns.length === 4) {

        btns[3].click();

        return true;
    } else {
        return false
    }
}

keywordplaninit()

console.log("connected")