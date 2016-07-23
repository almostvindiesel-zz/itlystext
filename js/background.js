function sendNoteOnContextMenuClick(info, tab) {
    //console.log("item " + info.menuItemId + " was clicked");
    //console.log("info: " + JSON.stringify(info));
    //console.log("tab: " + JSON.stringify(tab));
    var serverUrl = 'http://almostvindiesel.pythonanywhere.com/';
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {action: "PostNoteToServer", info: info, tab: tab, serverUrl: serverUrl}, function(response) {});  
    });
}

function sendNoteOnContextMenuClickLocal(info, tab) {
    var serverUrl = 'http://localhost:5000/';
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {action: "PostNoteToServer", info: info, tab: tab, serverUrl: serverUrl}, function(response) {});  
    });
}

function sendPageUrlOnContextMenuClick(info, tab) {
    var serverUrl = 'http://almostvindiesel.pythonanywhere.com/';
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {action: "PostPageUrlToServer", info: info, tab: tab, serverUrl: serverUrl}, function(response) {});  
    });
}

function sendPageUrlOnContextMenuClickLocal(info, tab) {
    var serverUrl = 'http://localhost:5000/';
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {action: "PostPageUrlToServer", info: info, tab: tab, serverUrl: serverUrl}, function(response) {});  
    });   
}

chrome.contextMenus.create({
  title: "Save Highlight", 
  //contexts:["selection"], 
  contexts:["all"], 
  onclick: sendNoteOnContextMenuClick
});

chrome.contextMenus.create({
  title: "Save Highlight (Local)", 
  //contexts:["selection"], 
  contexts:["all"], 
  onclick: sendNoteOnContextMenuClickLocal
});

chrome.contextMenus.create({
  title: "Save Page", 
  //contexts:["selection"], 
  contexts:["all"], 
  onclick: sendPageUrlOnContextMenuClick
});

chrome.contextMenus.create({
  title: "Save Page (Local)", 
  //contexts:["selection"], 
  contexts:["all"], 
  onclick: sendPageUrlOnContextMenuClickLocal
});



 //Attempt to Trigger a popup post highlight
/*
var cr= [];

$(document).on({
  'mouseup': function() {
    cr= window.getSelection().getRangeAt(0).getClientRects();
  },
  'mousemove': function(ev) {
    //hide the pop up
    for(var i = 0 ; i < cr.length ; i++) {
      if(ev.pageX >= cr[i].left && ev.pageX <= cr[i].right &&
         ev.pageY >= cr[i].top  && ev.pageY <= cr[i].bottom
        ) {
            alert("triggered highlight");
            break;
      }
    }
  }
});
*/



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

