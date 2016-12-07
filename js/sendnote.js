/*
Resolve latitude and longitude
view-source:https://www.tripadvisor.com/Attraction_Review-g1759888-d6601942-Reviews-River_Buna_Spring-Blagaj_Herzegovina_Neretva_Canton.html
- lat: 43.259995
- lng: 17.882998
*/


chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
   if (msg.action == 'processNote') {
      postNoteToServer(msg.info, msg.tab, msg.serverUrl);
   }
});



//Send the selected note and related page attributes to the note and other related tables
var processNote = function (info, tab, serverUrl)  {

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
			//v.setCategories();
			saveVenueNoteToServer(serverUrl, v);
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
			saveVenueNoteToServer(serverUrl, v);
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
			saveVenueNoteToServer(serverUrl, v);
			break;
		default:
			console.log("Unknown source. Just submitting page");
			savePageNoteToServer(serverUrl, p);
	}
}

var savePageNoteToServer = function (serverUrl, page) {
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
	    url: serverUrl + "/addnote",
	    data: jQuery.param(post_params),
	    contentType: 'application/json',
        dataType : 'json'
	}, function(responseText) {
	    alert(responseText);

	});
}



var saveVenueNoteToServer = function (serverUrl, venue) {
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

	chrome.runtime.sendMessage({
	    method: 'POST',
	    action: 'xhttp',
	    url: serverUrl + "/addnote",
	    data: jQuery.param(post_params),
	    contentType: 'application/json',
        dataType : 'json'
	}, function(responseText) {
	    alert(responseText);
	    //var overlay = jQuery('<div id="itlystoverlay" style="position:absolute; top:10px; right: 10px; background-color: #fff; font-weight: bold; ">hellomynameisjoe</div>');
		//overlay.appendTo(document.body)
	});
}

    
    
    



