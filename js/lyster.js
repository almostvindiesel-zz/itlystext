// ---------------------------------------------------------------------------------------------------------


var inheritsFrom = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
};

var Page = function () {
	this.url = "";
	this.title = "";
	this.note = "";
	this.image_url = "";
}

var Venue = function () {
	this.source_id = null;
	this.name = "";
	this.source = "";

	this.url = "";

	this.rating = "";
	this.reviews = "";
	this.categories = [];

	this.location = new Location();
	this.page = {};
}

var Location = function () {
	this.latitude = null;
	this.longitude = null;
	this.city = "";
	this.state = "";
	this.country = "";
}

var FoursquareVenue = function (page) {
	this.jqdoc = null;
	this.page = page;
	this.source = 'foursquare'
	this.location = new Location();

	this.setJQueryDocument = function (jquery_document) {
		this.jqdoc = jquery_document;
	}

	this.setName = function () {
		//this.name = document.querySelectorAll("[property='og:title']")[0].content;
		//this.name = $("[property='og:title']").first().attr('content');
		this.name = $(this.jqdoc).find("[property='og:title']").first().attr('content');
	}

	//<meta content="foursquare://venues/48ff3964f964a52056521fe3" property="al:iphone:url" />
	this.setSourceId = function () {
		//this.source_id = document.querySelectorAll("[property='al:iphone:url']")[0].content.replace('foursquare://venues/','');
		this.source_id = $(this.jqdoc).find("[property='al:iphone:url']").first().attr('content').replace('foursquare://venues/','');
	}

	this.setLatitude = function () {
		//this.location.latitude = document.querySelectorAll("[property='playfoursquare:location:latitude']")[0].content;
		this.location.latitude = $(this.jqdoc).find("[property='playfoursquare:location:latitude']").first().attr('content');
	}

	this.setLongitude = function () {
		//this.location.longitude = document.querySelectorAll("[property='playfoursquare:location:longitude']")[0].content;
		this.location.longitude = $(this.jqdoc).find("[property='playfoursquare:location:longitude']").first().attr('content');
	}

	//<span class="venueCity">Florence</span>
	this.setCity = function () {
		this.location.city = $(this.jqdoc).find("span.venueCity").text(); 
	}

	//<span itemprop="ratingValue">9.4</span>
	this.setRating = function () {
		this.rating = $(this.jqdoc).find("span[itemprop='ratingValue']").text(); 
	} 

	//<div class="numRatings" itemprop="ratingCount">314</div>
	this.setReviews = function () {
		this.reviews = $(this.jqdoc).find("div.numRatings").text();
	}

	//<span property="servesCuisine" content="Street Food"/></span>
	/* var category = $("*[property='servesCuisine']")[0].content; <-- why wont this work?
	   instead have to us this crazy hack:
		<div id="PAGE" class=" non_hotels_like desktop gutterAd scopedSearch" vocab="http://schema.org/" typeof="FoodEstablishment">
		<span property="servesCuisine" content="Poop"/></span>
		<span property="servesCuisine" content="Italian"/></span>
		</div>
	*/
	this.setCategories = function () {

		/* !!!
		var cats = [];
		$('span.unlinkedCategory').each(function(){
			console.log($(this).text());			
		    this.cats.push($(this).text());
		});

		this.categories = cats;
		*/
	}
}
inheritsFrom(FoursquareVenue, Venue);

var TripadvisorVenue = function (page) {
	this.jqdoc = null;
	this.page = page;
	this.source = 'tripadvisor'
	this.location = new Location();

	this.setJQueryDocument = function (jquery_document) {
		this.jqdoc = jquery_document;
	}

	//<div class="warLocName">River Buna Spring</div>
	this.setName = function () {
		this.name = $(this.jqdoc).find(".warLocName").first().text();
	}

	//https://www.tripadvisor.com/Attraction_Review-g1759888-d6601942-Reviews-River_Buna_Spring-Blagaj_Herzegovina_Neretva_Canton.html
	//between 'Review-' and '-Review'
	this.setSourceId = function () {
		var textWhichContainsSourceId = this.page.url;
		this.source_id = textWhichContainsSourceId.match("Review-(.*)-Review")[1];

	}

	//<div class="mapContainer" data-lat="37.798454" data-lng="-122.40787" data-name="Molinari Delicatessen"...>
	this.setLatitude = function () {
		try {
		    //var elements = document.querySelectorAll(".mapContainer")[0];
			//this.location.latitude = elements.getAttribute('data-lat');
			this.location.latitude = $(this.jqdoc).find(".mapContainer").first().attr('data-lat');

		}
		catch(err) {
			console.log("Could not get latitude. Error: " + err.message);
		}
		
	}

	//<div class="mapContainer" data-lat="37.798454" data-lng="-122.40787" data-name="Molinari Delicatessen"...>
	this.setLongitude = function () {
		try {
			//var elements = document.querySelectorAll(".mapContainer")[0];
			//this.location.longitude = elements.getAttribute('data-lng');
			this.location.longitude = $(this.jqdoc).find(".mapContainer").first().attr('data-lng');

		}
		catch(err) {
			console.log("Could not get longitude. Error: " + err.message);
		}
	}

	//<span class="geoName" data-title="Florence">Florence</span>
	this.setCity = function () {
		this.location.city = $(this.jqdoc).find("span.geoName").text(); 			
	}

	//property="ratingValue" content="4.0"
	this.setRating = function () {
		//var ratingStr = document.querySelectorAll("[property='ratingValue']")[0].alt;
		//this.rating = String(ratingStr.substring(0, 3));
		this.rating = $(this.jqdoc).find("[property='ratingValue']").first().attr('alt').substring(0, 3);
	} 

	//<div class="numRatings" itemprop="ratingCount">314</div>
	this.setReviews = function () {
		var reviewsStr = $(this.jqdoc).find("a.more").text();		//property="ratingValue" content="4.0"
		reviewsStr = reviewsStr.replace(',','');
		var index = reviewsStr.indexOf(' ');
		this.reviews = reviewsStr.substring(0, index);
	}

	this.setCategories = function () {
		/*
		try {
			var i = 0;
			do {
			    this.categories[i] = $("#PAGE").find("span").eq(i).attr("content")
			    i++;
			}
			while ($("#PAGE").find("span[property='servesCuisine']").eq(i).attr("content"))
		}
		catch(err) {
			console.log("Could not set categories. Error: " + err.message);
		}
		*/
	}
}
inheritsFrom(TripadvisorVenue, Venue);

var YelpVenue = function (page) {
	this.jqdoc = null;
	this.page = page;
	this.source = 'yelp'
	this.location = new Location();

	this.setJQueryDocument = function (jquery_document) {
		this.jqdoc = jquery_document;
	}

 	// <h1 class="biz-page-title embossed-text-white shortenough" itemprop="name">Proof Bakery</h1> 
	this.setName = function () {
		this.name = $(this.jqdoc).find(".biz-page-title").first().text().trim();
	}

	// Regular page:
	// <meta name="yelp-biz-id" content="jQXj5x1V-mtVMFYoMQYOkg">
	// image page: 
	// <meta property="twitter:app:url:iphone" content="yelp:///biz/photo?biz_id=BmDHbBWKESB6d3ZFRT5y_Q&amp;....">
	this.setSourceId = function () {
		try {
			this.source_id = document.querySelectorAll("[name='yelp-biz-id']")[0].content;
		} catch(err) {
			console.log("Could not get source_id. Retrying via other method: " + err.message);
			try {
				var textWhichContainsSourceId= document.querySelectorAll("[property='twitter:app:url:iphone']")[0].content;
				textWhichContainsSourceId =  textWhichContainsSourceId.match("id(.*)campaign")[1];
				textWhichContainsSourceId = textWhichContainsSourceId.replace("&","");
				textWhichContainsSourceId = textWhichContainsSourceId.replace("=","");
				this.source_id = textWhichContainsSourceId.replace("utm_","");
			} catch(err) {
				console.log("ERROR. Could not get source_id second time. Retrying via other method: " + err.message);			
			}
		}
	}

	//<div class="lightbox-map hidden"...
	this.setLatitude = function () {
		try {
			var textWhichContainsLatitude = $(this.jqdoc).find(".lightbox-map").first().attr('data-map-state');
			console.log(textWhichContainsLatitude);
			textWhichContainsLatitude = textWhichContainsLatitude.match("url(.*)starred_business")[1];
			textWhichContainsLatitude = textWhichContainsLatitude.match("latitude(.*)longitude")[1];
			textWhichContainsLatitude = textWhichContainsLatitude.replace(/"/g,"");
			textWhichContainsLatitude = textWhichContainsLatitude.replace(":","");
			textWhichContainsLatitude = textWhichContainsLatitude.replace(",","");
			this.location.latitude = textWhichContainsLatitude.trim();
		} catch(err) {
			console.log("ERROR. Could not get latitude " + err.message);		
		}	
	}

	this.setLongitude = function () {
		try {
			var textWhichContainsLongitude = $(this.jqdoc).find(".lightbox-map").first().attr('data-map-state');
			console.log(textWhichContainsLongitude);
			textWhichContainsLongitude = textWhichContainsLongitude.match("url(.*)starred_business")[1];
			textWhichContainsLongitude = textWhichContainsLongitude.match("longitude(.*)key")[1];
			textWhichContainsLongitude = textWhichContainsLongitude.replace(/"/g,"");
			textWhichContainsLongitude = textWhichContainsLongitude.replace(":","");
			textWhichContainsLongitude = textWhichContainsLongitude.replace(",","");
			textWhichContainsLongitude = textWhichContainsLongitude.replace("}","");
			this.location.longitude = textWhichContainsLongitude.trim();
		} catch(err) {
			console.log("ERROR. Could not get longitude " + err.message);		
		}	
	}

	//<span itemprop="addressLocality">Los Angeles</span>
	this.setCity = function () {
		try {
			//this.location.city = document.querySelectorAll("[itemprop='addressLocality']")[0].textContent;
			this.location.city = $(this.jqdoc).find("[itemprop='addressLocality']").first().text();

		} catch(err) {
			console.log("ERROR. Could not get city " + err.message);		
		}
	}

	//<meta itemprop="ratingValue" content="4.0">
	this.setRating = function () {
		try {
			//this.rating = document.querySelectorAll("[itemprop='ratingValue']")[0].content;
			this.rating = $(this.jqdoc).find("[itemprop='ratingValue']").first().attr('content');
		} catch(err) {
			console.log("ERROR. Could not set rating " + err.message);		
		}
	} 

	//<span itemprop="reviewCount">591</span> reviews
	this.setReviews = function () {
		try { 
			//this.reviews = document.querySelectorAll("[itemprop='reviewCount']")[0].textContent;
			this.reviews = $(this.jqdoc).find("[itemprop='reviewCount']").first().text();
		} catch(err) {
			console.log("ERROR. Could not set reviews " + err.message);		
		}
	}

	/*
	<span class="category-str-list">
        <a href="/c/la/bakeries">Bakeries</a>,
        <a href="/c/la/coffee">Coffee & Tea</a>
	</span>
	*/
	this.setCategories = function () {
		// !!!
	}
}
inheritsFrom(YelpVenue, Venue);


function detectSource (url) {
	if (url.search("foursquare.com/v") >= 0) {
		return 'foursquare'; 
	} else if (url.search("yelp.com/biz") >= 0) {
		return 'yelp'; 
	} else if (url.search("www.tripadvisor") >= 0 && url.search("Review-") >= 0) {
		return 'tripadvisor'; 
	} else {
		return 'unknown';
	}
}


