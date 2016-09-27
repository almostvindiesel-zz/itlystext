var serverUrl = 'http://mars-mac.local:5000';

function sendNoteOnContextMenuClick(info, tab) {
    //console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));
    console.log("server: " + serverUrl);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {action: "PostNoteToServer", info: info, tab: tab, serverUrl: serverUrl}, function(response) {});  
    });
}


chrome.contextMenus.create({
  title: "Save to itlyst", 
  contexts:["all"], 
  onclick: sendNoteOnContextMenuClick
});






// Called After the Content Script Sends Data back to background.js to send to the server
chrome.runtime.onMessage.addListener(function(request, sender, callback) {

    //Send data to Server from content script injection
    if (request.action == "xhttp") {
        //alert("read request");
        var xhttp = new XMLHttpRequest();
        var method = request.method ? request.method.toUpperCase() : 'GET';

        xhttp.onload = function() {
            callback(xhttp.responseText);
        };
        xhttp.onerror = function() {
            // Do whatever you want on error. Don't forget to invoke the
            // callback to clean up the communication port.
            callback();
        };
        xhttp.open(method, request.url, true);
        if (method == 'POST') {
            xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhttp.send(request.data);
        //console.log("request.url: " + request.url);
        //console.log("post params: " + request.data);
        //console.log("responseText: " + xhttp.responseText);

        return true; // prevents the callback from being called too early on return
    }
});

