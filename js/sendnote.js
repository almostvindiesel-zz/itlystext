chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
   if (msg.action == 'PostNoteToServer') {
//      alert("Message recieved!");
      sendnotetoserver(msg.info, msg.tab, msg.serverUrl);
   }
   else if (msg.action == 'PostPageUrlToServer') {
//      alert("Message recieved!");
      sendpageurltoserver(msg.info, msg.tab, msg.serverUrl);
   }
});


//Send the url of the page from the context menu to the saved_url table
var sendpageurltoserver = function (info, tab, serverUrl)  {
	var page_title = document.getElementsByTagName("title")[0].innerHTML;
    var page_url = info.pageUrl;
	var post_url = serverUrl + "addurl";
	//var user_id = 1 // !!!

	var post_params = "title=" + page_title + "&url=" + page_url

	chrome.runtime.sendMessage({
	    method: 'POST',
	    action: 'xhttp',
	    url: post_url,
	    data: post_params
	}, function(responseText) {

		alert("Posted: " + responseText);

	});

}

//Send the selected note and related page attributes to the note and other related tables
var sendnotetoserver = function (info, tab, serverUrl)  {
	//console.log("info: " + JSON.stringify(info));
    //console.log("tab: " + JSON.stringify(tab));

    var page_domain_url = extractDomain(info.pageUrl);
	var post_url = serverUrl + "addnote";
	//var post_url = "http://almostvindiesel.pythonanywhere.com/addnote";

	var page_title = document.getElementsByTagName("title")[0].innerHTML;
	var page_url = info.pageUrl;
	var selectedtext = info.selectionText;
    //console.log("Page Domain URL is: " + page_domain_url);

    //var elementsb = $("#PAGEA").children("span").attr("content");

	// Foursquare Specific Parameters
	// !!! Add logic to only do this if website is foursquare
	if (page_domain_url == "foursquare.com") { 
		//<meta content="Monk’s Kettle" property="og:title" />
		var name       = document.querySelectorAll("[property='og:title']")[0].content;
		var latitude     = document.querySelectorAll("[property='playfoursquare:location:latitude']")[0].content;
		var longitude    = document.querySelectorAll("[property='playfoursquare:location:longitude']")[0].content;
		var city = $("span.venueCity").text(); 		//<span class="venueCity">Florence</span>
		var rating = $("span[itemprop='ratingValue']").text(); 	//<span itemprop="ratingValue">9.4</span>
		var reviews = $("div.numRatings").text();	//<div class="numRatings" itemprop="ratingCount">314</div>
		//var categories = $("span.unlinkedCategory").first().text();

		var categories = [];
		$('span.unlinkedCategory').each(function(){
		    categories.push($(this).text());
		});

		//<span itemprop="ratingValue">

		//alert (""  + category );
		//return;

	} else if (page_domain_url == "www.tripadvisor.com") { 
		//<div class="mapContainer" data-lat="37.798454" data-lng="-122.40787" data-name="Molinari Delicatessen"...>

		var elements = document.querySelectorAll(".mapContainer")[0];
		var name = elements.getAttribute('data-name');
		var latitude = elements.getAttribute('data-lat');
		var longitude = elements.getAttribute('data-lng');

		//<span property="servesCuisine" content="Street Food"/></span>
		/* var category = $("*[property='servesCuisine']")[0].content; <-- why wont this work?
		   instead have to us this crazy hack:
			<div id="PAGE" class=" non_hotels_like desktop gutterAd scopedSearch" vocab="http://schema.org/" typeof="FoodEstablishment">
			<span property="servesCuisine" content="Poop"/></span>
			<span property="servesCuisine" content="Italian"/></span>
			</div>
		*/
		var i = 0;
		var categories = [];
		do {
		      categories[i] = $("#PAGE").find("span").eq(i).attr("content")
		      i++;
		  }
		  while ($("#PAGE").find("span[property='servesCuisine']").eq(i).attr("content"))

		var city = $("span.geoName").text(); 			//<span class="geoName" data-title="Florence">Florence</span>
		//<img class="sprite-rating_rr_fill rating_rr_fill rr50" property="ratingValue" content="5.0" src="https://static.tacdn.com/img2/x.gif" alt="5.0 of 5 stars">
		var ratingStr = document.querySelectorAll("[property='ratingValue']")[0].alt;
		var rating = String(ratingStr.substring(0, 3));
	
		var reviewsStr = $("a.more").text();		//property="ratingValue" content="4.0"
		reviewsStr = reviewsStr.replace(',','');
		var index = reviewsStr.indexOf(' ');
		var reviews = reviewsStr.substring(0, index);

		//alert (""  + category );
		//return;

	//!!! Still need to update this guy
	} else if (page_domain_url == "www.yelp.com") { 
		// !!! Still need to update dis!
		//destination: <h1 class="biz-page-title embossed-text-white shortenough" itemprop="name"> Konnubio </h1>
		//var elements = document.querySelectorAll(".mapContainer")[0];
		var destination = document.querySelectorAll("[class='biz-page-title embossed-text-white shortenough']")[0].text()
		destination = elements.getAttribute('data-name');
		//var latitude = elements.getAttribute('data-lat');
		//var longitude = elements.getAttribute('data-lng');
	} 

	if (page_domain_url == "foursquare.com" || page_domain_url == "www.tripadvisor.com") {
		var post_params = "note=" + selectedtext + "&page_url=" + page_url + "&page_title=" + page_title 
				  + "&latitude=" + latitude + "&longitude=" + longitude 
				  + "&name=" + name + "&reviews=" + reviews + "&rating=" + rating 
				  + "&city=" + city + "&categories=" + categories; 

		//alert(post_params);
		console.log("post params: " + post_params);

		alert("Posted: " + selectedtext);

		chrome.runtime.sendMessage({
		    method: 'POST',
		    action: 'xhttp',
		    url: post_url,
		    data: post_params
		}, function(responseText) {
		    //2alert(responseText);
		    /*Callback function to deal with the response*/
		});
	}
}

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}


// ---------------------------------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
  var checkPageButton = document.getElementByClassName('submitUrl');
  checkPageButton.addEventListener('click', function() {

    chrome.tabs.getSelected(null, function(tab) {
      d = document;

      alert()

      var user_id = 1 // !!! updated from teh session!


      var f = d.createElement('form');
      f.action = 'http://localhost:5000/addurl';
      f.method = 'post';

      var i = d.createElement('input');
      i.type = 'hidden';
      i.name = 'url';
      i.value = tab.url;
      f.appendChild(i);
      d.body.appendChild(f);

      /*
      var i = d.createElement('input');
      i.type = 'hidden';
      i.name = 'user_id';
      i.value = user_id;
      f.appendChild(i);
      d.body.appendChild(f);*/

      var t = d.createElement('input');
      t.type = 'hidden';
      t.name = 'title';
      t.value = tab.title;
      f.appendChild(t);
      d.body.appendChild(f);

      //alert("Saved page: " + tab.title);

      f.submit();
    });
  }, false);
}, false);



// ---------------------------------------------------------------------------------------------------------


function loadDoc(url, cfunc) {
  var xhttp;
  xhttp=new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      cfunc(xhttp);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

function myFunction(xhttp) {
  document.getElementById("link").innerHTML = xhttp.responseText  ;
}



