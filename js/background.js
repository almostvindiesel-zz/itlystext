console.log("Loading background.js...");


//var apiUrl = 'http://mars.local:5000';
var apiUrl  = 'http://www.itlyst.com';
var webUrl  = 'http://itlystweb.herokuapp.com';


// Update Login url on popup
//var a = document.getElementById('loginUrl'); //or grab it by tagname etc
//a.href = 




chrome.contextMenus.create({
  title: "Save to itlyst", 
  contexts:["all"], 
  onclick: sendNoteOnContextMenuClick
});


function sendNoteOnContextMenuClick(info, tab) {
    //console.log("item " + info.menuItemId + " was clicked");
    //console.log("info: " + JSON.stringify(info));
    //console.log("tab: " + JSON.stringify(tab));
    //console.log("server: " + apiUrl);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {action: "processNote", info: info, tab: tab, apiUrl: apiUrl}, function(response) {});  
    });
}


// Called After the Content Script Sends Data back to background.js to send to the server
chrome.runtime.onMessage.addListener(function(request, sender, callback) {

    //Send data to Server from content script injection
    if (request.action == "xhttp") {
        console.log("~~~~~~~~~~~~~~~~~~> does this ever come up")
        //alert("read request");
        var xhttp = new XMLHttpRequest();
        var method = request.method ? request.method.toUpperCase() : 'GET';

        xhttp.onload = function() {
            callback(xhttp.responseText);
        };
        xhttp.onerror = function() {
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

