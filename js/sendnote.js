console.log("Loading sendnote.js...");



chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
   if (msg.action == 'processNote') {
      processNote(msg.info, msg.tab, msg.apiUrl);
   }

});




//Send the selected note and related page attributes to the note and other related tables
var processNote = function (info, tab, apiUrl)  {

	console.log("-----------------------------------------------");

	// Set Page Attributes
	p = new Page();
	p.url = info.pageUrl;
	p.title = $('title').first().text();
	if (info.selectionText != null && info.selectionText.length > 0) {
		p.note = info.selectionText;
		console.log("- Highlighted text: " + p.note)
	}
	if (info.srcUrl != null && info.srcUrl.length > 0) {
		p.image_url = info.srcUrl;
		console.log("- Selected Image: " + p.image_url)
	}
	//console.log("Set Page: ");
	//console.log(p);

	// Determine whether the Page Source is Supported
	var source = detectSource(info.pageUrl)
	console.log("- Detected source: " + source);

	//Set Attributes for Each Venue Source
	switch(source) {
		case 'foursquare':
			v = new FoursquareVenue(p);
			
			v.setJQueryDocument(document);
			
			v.setName();
			v.setSourceId();
			v.setLatitude();
			v.setLongitude();
			v.setCity();
			v.setRating();
			v.setReviews();
			//v.simplifyPageUrl();
			//v.setCategories();
			saveVenueNoteToServer(apiUrl, v);
			break;
		case 'tripadvisor':
			v = new TripadvisorVenue(p);
			v.setJQueryDocument(document);
			v.setName();
			v.setSourceId();
			v.setLatitude();
			v.setLongitude();
			v.setCity();
			v.setRating();
			v.setReviews();
			//v.setCategories();
			//v.simplifyPageUrl();
			saveVenueNoteToServer(apiUrl, v);
			break;
		case 'yelp':
			v = new YelpVenue(p);
			v.setJQueryDocument(document);
			v.setName();
			v.setSourceId();
			v.setLatitude();
			v.setLongitude();
			v.setCity();
			v.setRating();
			v.setReviews();
			//v.setCategories();
			v.simplifyPageUrl();
			saveVenueNoteToServer(apiUrl, v);
			break;
		default:
			console.log("Unknown source. Just submitting page");
			savePageNoteToServer(apiUrl, p);
	}
}

var savePageNoteToServer = function (apiUrl, page) {
	var post_params = { 
			"page_url": page.url,
			"page_title": page.title,
			"image_url": page.image_url, 
			"note": page.note, 

			"action": "new_page_note_from_other_page"
	};
	console.log("- Post Parameters: ");
	console.log(post_params);




	chrome.runtime.sendMessage({
	    method: 'POST',
	    action: 'xhttp',
	    url: apiUrl + "/addnote",
	    data: jQuery.param(post_params),
	    contentType: 'application/json',
        dataType : 'json'
	}, function(responseText) {
	    alert(responseText);

	});
	
}



var saveVenueNoteToServer = function (apiUrl, venue) {
	var post_params = { 
		"source_id": venue.source_id,
		"source": venue.source,
		"name": venue.name,
		"categories": venue.categories,
		"rating": venue.rating,
		"reviews": venue.reviews,

		"page_url": venue.page.url,
		"page_title": venue.page.title,
		"note": venue.page.note, 
		"image_url": venue.page.image_url, 

		"latitude": venue.location.latitude,
		"longitude": venue.location.longitude,
		"city": venue.location.city,

		"action": "new_venue_note_from_venue"
    };
	console.log("- Post Parameters: ");
	console.log(post_params);
	console.log(jQuery.param(post_params));
	console.log("Posting to " + apiUrl + "/addnote");

	//Create Overlay
	var div = document.createElement("div");
    div.id = "itlyst_status_overlay"
    div.style.width = "300px";
    div.style.height = "200px";
    div.style.position = "fixed";
    div.style.display = "block";
    div.style.backgroundColor = "#eef4ff";
    div.style.border = "thin solid #0000FF";
    div.style.borderRadius = "5px";
    div.style.top = "10px";
    div.style.right = "10px";
    div.style.zIndex = 90000000;

    //Create message to enduser
	var itlyst_img_url = chrome.extension.getURL("/img/itlyst-fork-logo-128x128-black.png");
    var divmessage = document.createElement("div");
    divmessage.fontcolor = "black";
    divmessage.id = "itlyst_msg";
    divmessage.innerHTML = "<b><img src='"+itlyst_img_url+"' height='20px'> Saving to itlyst...</b><br>";
    divmessage.style.padding = "5px 5px 5px 5px";

    //Append to dom in webpage
    div.appendChild(divmessage);
    document.body.appendChild(div);

    

	
	chrome.runtime.sendMessage({
	    method: 'POST',
	    action: 'xhttp',
	    url: apiUrl + "/addnote",
	    data: jQuery.param(post_params),
	    //data: post_params,
	    contentType: 'application/json',
        dataType : 'json'
	}, function(responseText) {
	    //alert(responseText);
	    console.log(responseText);
	    responseJson = JSON.parse(responseText);

	    var divmessage = document.getElementById("itlyst_msg");
	    divmessage.innerHTML = "<b><img src='"+itlyst_img_url+"' height='20px'> Saved</b>";
	    divmessage.innerHTML += " for " + responseJson.venue_name + "<br><br>";
	    if (responseJson.hasOwnProperty(responseJson.note)) {
	    	if (responseJson.note.length >  100) {
	    		var display_note = responseJson.note.substr(0, 100) + "...";
	    	}
	    	else {
	    		var display_note = responseJson.note;
	    	}
	    	divmessage.innerHTML += "<i>" + display_note + "</i>";
	    }

	    if (responseJson.hasOwnProperty('user_image_id')) {
	    	divmessage.innerHTML += "<br><img src=" + post_params.image_url + " height='100px'>";
	    }

	    //Remove the overlay
	    
	    setTimeout(function(){ 
	    	var ele = document.getElementById("itlyst_status_overlay");
			ele.parentNode.removeChild(ele);
	    }, 2000)
	    
	    

	    
	    //console.log("user image id: " + responseJson['user_image_id']);
	    if ( responseJson.hasOwnProperty('user_image_id') ) {
	    	console.log("Found image id. Sending to s3 for resizing..." );
	    	new_image_id = responseJson['user_image_id'];

	    	console.log("New image_id: " + new_image_id);

		    chrome.runtime.sendMessage({
			    method: 'PUT',
			    action: 'xhttp',
			    url: apiUrl + "/api/v1/image/" + new_image_id,
			    contentType: 'application/json',
		        dataType : 'json'
			}, function(responseText) {
				console.log(responseText);
			    //alert(responseText);
			    //var overlay = jQuery('<div id="itlystoverlay" style="position:absolute; top:10px; right: 10px; background-color: #fff; font-weight: bold; ">hellomynameisjoe</div>');
				//overlay.appendTo(document.body)
			});
		}


	    //var overlay = jQuery('<div id="itlystoverlay" style="position:absolute; top:10px; right: 10px; background-color: #fff; font-weight: bold; ">hellomynameisjoe</div>');
		//overlay.appendTo(document.body)
	});
	
	
}

    
    
    



