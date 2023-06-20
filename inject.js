
XMLHttpRequest.prototype.realSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.send = function(value) {
    this.addEventListener("progress", function(){
        console.log("Loading. Here you can intercept...", value);
        if (value){
            if (value.indexOf("report_download_id") !== -1) {

                
                let valueofdownloadid = decodeURIComponent(value).split(`{"1":"report_download_id","2":"`)[1].split(`"`)[0];
                console.log(valueofdownloadid, 330);
                // localStorage.setItem("dl", valueofdownloadid)
                // window.valueofdownloadid = valueofdownloadid;
                 let el = document.createElement("p")
                 el.id = `valueofdownloadid`
                 el.textContent = valueofdownloadid
                 document.querySelector("body").appendChild(el)
            }
        }
     
    }, false);
    this.realSend(value);
};