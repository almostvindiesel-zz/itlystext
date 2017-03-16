console.log("Loading lyster.js...");


// ---------------------------------------------------------------------------------------------------------
// http://phrogz.net/js/classes/OOPinJS2.html

TextMetaData.prototype = new TextMetaData();  
TextMetaData.prototype.constructor=TextMetaData; 
function TextMetaData (original_text) {
	this.original_text = original_text;
	this.original_url = "";
	this.original_url_without_querystring = "";
	this.display_url = "";
	this.final_url = "";	
	this.source = "";

	//Find the first url in the string)
	this.findFirstUrl = function () {
		console.log("Searching for url in copied text: ");
		var urlRegex = /(https?:\/\/[^\s]+)/g;
		if (parsedUrls = this.original_text.match(urlRegex)) {
			this.original_url = parsedUrls[0];
			console.log("Found url: ")
			console.log(this.original_url);

			if (this.original_url.indexOf("?") > -1 ) {
				this.original_url_without_querystring = this.original_url.substring(0, this.original_url.indexOf("?"));
			} else {
				this.original_url_without_querystring = this.original_url;
			}
			console.log("URL w querystrings removed: ");
			console.log(this.original_url_without_querystring);

			//Create a url to display with extras chopped off
			this.display_url = this.original_url_without_querystring;
			var stringsToReplace = ["http://", "https://", "www."];
			for (var i = 0; i < stringsToReplace.length; i++) {
			    this.display_url = this.display_url.replace(stringsToReplace[i],"");
			}
			console.log("URL for display:");
			console.log(this.display_url);

		} else {
			console.log("Did not find a url");
		}
	}

	this.detectVenueSource = function () {
		if (this.original_url) {
			this.source = detectSource(this.original_url);
		} else {
			this.source = 'unknown';
		}
		console.log("Detected Source: " + this.source);
	}
}

function Page () {
	this.url = "";
	this.title = "";
	this.note = "";
	this.image_url = "";
}

function Location () {
	this.latitude = null;
	this.longitude = null;
	this.city = "";
	this.state = "";
	this.country = "";
}

function Venue () {
	this.source_id = null;
	this.name = "";
	this.source = "";
	this.url = "";
	this.rating = null;
	this.reviews = null;
	this.categories = [];
	this.location = new Location();
	this.post_params = {};
	this.jqdoc = null;
}

Venue.prototype.setPostParameters = function ()  {
	this.post_params = { 
		"source_id": this.source_id,
		"source": this.source,
		"name": this.name,
		"categories": this.categories,
		"rating": this.rating,
		"reviews": this.reviews,

		"page_url": this.page.url,
		"page_title": this.page.title,
		"note": this.page.note, 
		"image_url": this.page.image_url, 

		"latitude": this.location.latitude,
		"longitude": this.location.longitude,
		"city": this.location.city,

		"action": "new_venue_note_from_venue"
	};
	console.log("Post params:")
	console.log(this.post_params);
}

Venue.prototype.setJQueryDocument = function (jquery_document) {
	this.jqdoc = jquery_document;
}


FoursquareVenue.prototype = new Venue();  
FoursquareVenue.prototype.constructor=FoursquareVenue; 
function FoursquareVenue(page){
	this.source = 'foursquare';
	this.page = page;

	this.findImageOnPage = function () {
		//prototype		
	}

	this.simplifyPageUrl = function () {
		//prototype
	}

	//<meta content="Badmaash" property="og:title" />
	this.setName = function () {


		try {
			this.name = $(this.jqdoc).filter("[property='og:title']").first().attr('content');
			console.log("name: " + this.name);
			console.log("namelen: " + this.name.length);

		} catch(err) {
			console.log("Could not find name on page. Retrying...\r\n Err: " + err.message);
		}

		if (!(this.name)) {
			console.log("got here...");
			try {
				this.name = $(this.jqdoc).find("[property='og:title']").first().attr('content');
			} catch(err) {
				console.log("Could not find name on page second time. Giving up: " + err.message);
			}	
		}

	
	}

	//<meta content="foursquare://venues/48ff3964f964a52056521fe3" property="al:iphone:url" />
	this.setSourceId = function () {
		//this.source_id = document.querySelectorAll("[property='al:iphone:url']")[0].content.replace('foursquare://venues/','');
		try {
			this.source_id = $(this.jqdoc).filter("[property='al:iphone:url']").first().attr('content').replace('foursquare://venues/','');
		} catch(err) {
			console.log("Could not find source_id on page. Retrying... \r\n Err: " + err.message);
			try {
				this.source_id = $(this.jqdoc).find("[property='al:iphone:url").first().attr('content').replace('foursquare://venues/','');
			} catch(err) {
				console.log("Could not find source_id on page 2nd time. Giving up: " + err.message);
			}
		}
	}

	this.setLatitude = function () {
		//this.location.latitude = document.querySelectorAll("[property='playfoursquare:location:latitude']")[0].content;
		this.location.latitude = $(this.jqdoc).filter("[property='playfoursquare:location:latitude']").first().attr('content');
	}

	this.setLongitude = function () {
		//this.location.longitude = document.querySelectorAll("[property='playfoursquare:location:longitude']")[0].content;
		this.location.longitude = $(this.jqdoc).filter("[property='playfoursquare:location:longitude']").first().attr('content');
	}

	//<span class="venueCity">Florence</span>
	this.setCity = function () {
	    //var elements = document.querySelectorAll(".mapContainer")[0];
		//this.location.latitude = elements.getAttribute('data-lat');
		//this.location.city = 
		//console.log(this.jqdoc);
		try {
			this.location.city = $(this.jqdoc).find("[itemprop='addressLocality']").text(); 
		} catch(err) {
			console.log("Could not find embedded json on page. Retrying.... Err: " + err.message);
			try {
				this.location.city = $(this.jqdoc).find("span.venueCity").text(); 
			} catch(err) {
				console.log("Could not find embedded json on page 2nd time. : " + err.message);
			}
		}		
	}

	//<span itemprop="ratingValue">9.4</span>
	this.setRating = function () {
		this.rating = $(this.jqdoc).find("[itemprop='ratingValue']").text(); 
	} 

	//<div class="numRatings" itemprop="ratingCount">314</div>
	this.setReviews = function () {
		this.reviews = $(this.jqdoc).find("div.numRatings").text();
		this.reviews = this.reviews.replace(',','');
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




TripadvisorVenue.prototype = new Venue();  
TripadvisorVenue.prototype.constructor=TripadvisorVenue; 
function TripadvisorVenue(page){
	this.source = 'tripadvisor';
	this.page = page;
	this.pageJson = null;

	this.simplifyPageUrl = function () {
		//prototype
	}

	this.findImageOnPage = function () {
		//prototype		
	}

	//Overrides standard setJQueryDocument for tripadvisor
	this.setJQueryDocument = function (jquery_document) {
		this.jqdoc = jquery_document;

		//Tripadvisor has embedded json which has a lot of the data needed, specifically on the mobile page
		//When other methods fail, use this to populate parameters
		this.pageJson = "";
		try {
			var jsonDataIndexStart = this.jqdoc.indexOf("script");
			var jsonDataIndexEnd = this.jqdoc.substring(jsonDataIndexStart+34).indexOf("script");
			var jsonStr = this.jqdoc.substring(jsonDataIndexStart+34, jsonDataIndexStart+34+jsonDataIndexEnd-2);
			this.pageJson = jQuery.parseJSON(jsonStr);
		} catch(err) {
			console.log("Could not find embedded json on page: " + err.message);
		}
	}

	//<div class="warLocName">River Buna Spring</div>
	this.setName = function () {

		try {
			this.name = $(this.jqdoc).find("div.warLocName").first().text();
			var s = this.jqdoc.indexOf("<body");
			var e = this.jqdoc.indexOf("FOOT_CONTAINER");
			var len = this.jqdoc.length;

			if (this.name.length < 1) {
				throw "Could not find name in first attempt. Retrying";
			}
		} catch(err) {
			console.log("EXCEPTION: " + err.message);

			try {
				this.name = page.page_title;
				console.log(" partial name: " + this.name);
				
				var dashIndex = this.name.indexOf("-");
				this.name = this.name.substring(0, dashIndex);
				console.log(" partial name 2: " + this.name);
				var commaIndex = this.name.lastIndexOf(",");
				this.name = this.name.substring(0,commaIndex);

				if (this.name.length < 1) {
					throw "Could not find name on second attempt. Retrying final time";
				}
			} catch(err) {
				console.log("EXCEPTION: " + err.message);

				try {
					this.name = this.pageJson.name;

					if (this.name.length < 1) {
						throw "Could not find name on third attempt. Failing";
					}
				} catch(err) {
					console.log("EXCEPTION: " + err.message);
				}
			}
		}
		console.log("--- name: " + this.name);
		   
	}

	//https://www.tripadvisor.com/Attraction_Review-g1759888-d6601942-Reviews-River_Buna_Spring-Blagaj_Herzegovina_Neretva_Canton.html
	//between 'Review-' and '-Review'
	this.setSourceId = function () {
		var textWhichContainsSourceId = this.page.url;
		this.source_id = textWhichContainsSourceId.match("Review-(.*)-Review")[1];
		console.log("--- source_id: " + this.source_id);
	}

	//<div class="mapContainer" data-lat="37.798454" data-lng="-122.40787" data-name="Molinari Delicatessen"...>
	this.setLatitude = function () {
		try {
		    //var elements = document.querySelectorAll(".mapContainer")[0];
			//this.location.latitude = elements.getAttribute('data-lat');
			var elements = $(this.jqdoc).find(".mapWrap").first();
			this.location.latitude = $(elements).find("div.mapContainer").first().attr('data-lat');

			if (!(isNumeric(this.location.latitude))) {
				throw "Lat parsed is not a number";
			}

		}
		catch(err) {
			console.log("Could not get latitude. EXCEPTION: " + err.message);
		}
		console.log("--- latitude: " + this.location.latitude);
	}

	//<div class="mapContainer" data-lat="37.798454" data-lng="-122.40787" data-name="Molinari Delicatessen"...>
	this.setLongitude = function () {
		try {
			//var elements = document.querySelectorAll(".mapContainer")[0];
			//this.location.longitude = elements.getAttribute('data-lng');
			this.location.longitude = $(this.jqdoc).find(".mapWrap div.mapContainer").first().attr('data-lng');

			if (!(isNumeric(this.location.longitude))) {
				throw "Long parsed is not a number";
			}

		} catch(err) {
			console.log("Could not get longitude. EXCEPTION: " + err.message);
		}
		console.log("--- longitude: " + this.location.longitude);
	}

	//<span class="geoName" data-title="Florence">Florence</span>
	this.setCity = function () {
		
		/* !!! I think this works on desktop.... re-enable?
		try {
			this.location.city = $(this.jqdoc).find("span.geoName").text(); 		
			console.log("--- city: " + this.location.city);
		} catch(err) {
			console.log("Could not get city. EXCEPTION: " + err.message);
		}
		*/
		
		if ( this.location.city.length < 1) {
			console.log("Could not get city. Retrying with different method by parsing json");

			try {
				this.location.city = this.pageJson.address.addressLocality;

				console.log("Also setting rating, name, and reviews since we have them with this object");

			} catch(err) {
				console.log("EXCEPTION. Could not get city. Err:" + err.message);
			}
		}
	}

	//property="ratingValue" content="4.0"
	this.setRating = function () {
		try {
			this.rating = $(this.jqdoc).find("[property='ratingValue']").first().attr('alt').substring(0, 3);
			if (!(isNumeric(this.rating)))  {
				throw "Rating parsed is not a number. Retrying";
			}
		} catch(err) {
			console.log("EXCEPTION. Could not get rating. Err: " + err.message);
			try {
				this.rating = this.pageJson.aggregateRating.ratingValue;
			} catch(err) {
				console.log("EXCEPTION. Could not get rating on second attempt. Giving up. Err: " + err.message);
			}
		}
	} 

	//<div class="numRatings" itemprop="ratingCount">314</div>
	this.setReviews = function () {
		try {
			var reviewsStr = $(this.jqdoc).find("a.more").text();		//property="ratingValue" content="4.0"
			reviewsStr = reviewsStr.replace(',','');
			var index = reviewsStr.indexOf(' ');
			this.reviews = reviewsStr.substring(0, index);
			
			if (!(isNumeric(this.reviews))) {
				throw "Reviews parsed is not a number. Retrying...";
			}
		} catch(err) {
			console.log("EXCEPTION. Could not get reviews. Err: " + err.message);
			try {
				this.reviews = this.pageJson.aggregateRating.reviewCount.replace(',','');
			} catch(err) {
				console.log("EXCEPTION. Could not get reviews on second attempt. Giving up. Err: " + err.message);
			}
		}
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
			console.log("Could not set categories. Err: " + err.message);
		}
		*/
	}

	
}


YelpVenue.prototype = new Venue();  
YelpVenue.prototype.constructor=YelpVenue; 
function YelpVenue(page){
	this.source = 'yelp';
	this.page = page;

  	// https://www.yelp.com/biz_photos/1CkTVogrU7pmy4pkEFIubw?select=fUYM8vA84pHxQdoedWYgug&utm_source=ishare&utm_content=photo&utm_campaign=psb_sq
  	// to
  	// https://www.yelp.com/biz/1CkTVogrU7pmy4pkEFIubw
  	

	this.simplifyPageUrl = function () {
		try {
			if (this.source_id.length > 1) {
				this.page.url = 'https://www.yelp.com/biz/' + this.source_id;
			}
		} catch(err) {
			console.log("EXCEPTION. Could not get simplify page url. Err: " + err.message);
		}
	}

	this.findImageOnPage = function () {
		//console.log("page url: " + this.page.url);
		if (this.page.url.indexOf('https://www.yelp.com/biz_photos/') >= 0) {
			console.log("Page likely contains an image... Searching...");

			try {
				//<meta property="og:image" content="https://s3-media4.fl.yelpcdn.com/bphoto/fUYM8vA84pHxQdoedWYgug/o.jpg">
				this.page.image_url = $(this.jqdoc).filter("[property='og:image']").first().attr('content');
			} catch(err) {
				console.log("EXCEPTION. Could not get image_url. Err: " + err.message);
			}


			if (!(this.page.image_url > 0)) {
				console.log("Retrying second attempt to get image_url");
				try {
					//<meta property="og:image" content="https://s3-media4.fl.yelpcdn.com/bphoto/fUYM8vA84pHxQdoedWYgug/o.jpg">
					this.page.image_url = $(this.jqdoc).find('[property="og:image"]').first().attr('content');
				} catch(err) {
					console.log("EXCEPTION. Could not get image_url. Err: " + err.message);
				}
			}

			if (!(this.page.image_url > 0)) {
				console.log("Retrying third attempt to get image_url");
				try {
					//<meta property="og:image" content="https://s3-media4.fl.yelpcdn.com/bphoto/fUYM8vA84pHxQdoedWYgug/o.jpg">
					this.page.image_url = $(this.jqdoc).find('[class="photo-box-img"]').first().attr('src');
				} catch(err) {
					console.log("EXCEPTION. Could not get image_url. Err: " + err.message);
				}
			}

		}

		console.log("--- image_url: " + this.page.image_url);
		//console.log("=====================================");
		//console.log(this.jqdoc);
		//console.log("=====================================");

	}

	this.setName = function () {

		try {
			// <h1 class="biz-page-title embossed-text-white shortenough" itemprop="name">Proof Bakery</h1> 
			this.name = $(this.jqdoc).find(".biz-page-title").first().text().trim();
		} catch(err) {
			console.log("EXCEPTION. Could not get name. " + err.message);
		}
		
		if (!(this.name.length > 0)) {
			console.log("Retrying second attempt to get name");
			try {
				// iOS: <meta itemprop="name" content="Ohana Poke" />
				this.name = $(this.jqdoc).find("[itemprop='name']").last().attr('content');
			} catch(err) {
				console.log("EXCEPTION. Could not get name. " + err.message);
			}
		} 


		if (!(this.name) || this.name == 'Yelp')  {
			console.log("Retrying third attempt to get name");
			try {
				this.name = $(this.jqdoc).find("[property='og:title']").last().attr('content');
				this.name = this.name.replace(" photos","");
			} catch(err) {
				console.log("Could not get name. " + err.message);
			}
		} 

		if (!(this.name) || this.name == 'Yelp')  {
			console.log("Retrying fourth attempt to get name");
			try {
				//<meta property="og:title" content="Trick Dog photos">
				this.name = $(this.jqdoc).filter("[property='og:title']").first().attr('content');
				this.name = this.name.replace(" photos","");
			} catch(err) {
				console.log("Could not get name. " + err.message);
			}
		} 

		console.log("--- name: " + this.name);

		//console.log("=====================================");
		//console.log(this.jqdoc);
		//console.log("=====================================");

	}


	
	this.setSourceId = function () {
		try {
			// <meta name="yelp-biz-id" content="jQXj5x1V-mtVMFYoMQYOkg">
			this.source_id = $(this.jqdoc).filter("[name='yelp-biz-id']").first().attr('content');
		} catch(err) {
			console.log("EXCEPTION. Could not get source_id. Err: " + err.message);
		}

		if (!(this.source_id)) {
			console.log("Retrying second attempt to get source_id");
			try {
				//<meta property="twitter:app:url:iphone" content="yelp:///biz/photo?biz_id=1CkTVogrU7pmy4pkEFIubw&amp;photo_id=fUYM8vA84pHxQdoedWYgug&amp;utm_campaign=default&amp;utm_source=twitter-card">
				var textWhichContainsSourceId = $(this.jqdoc).filter("[property='twitter:app:url:iphone']").first().attr('content');
				this.source_id =gup('biz_id',textWhichContainsSourceId)
			} catch(err) {
				console.log("EXCEPTION. Could not get source_id. Err: " + err.message);
			}
		}

		if (!(this.source_id)) {
			console.log("Retrying third attempt to get source_id");
			try {
				var textWhichContainsSourceId = document.querySelectorAll("[property='twitter:app:url:iphone']")[0].content;

 				if  (textWhichContainsSourceId.indexOf("yelp:///biz/photo") >= 0) {
					//<meta property="twitter:app:url:iphone" content="yelp:///biz/photo?biz_id=trn_8V-tdgU9iYUziOclzw&amp;photo_id=16mRzcIt4Ewjl3aQnGSUXQ&amp;utm_campaign=default&amp;utm_source=twitter-card">
 					this.source_id = gup('biz_id',textWhichContainsSourceId);
				} else if  (textWhichContainsSourceId.indexOf("yelp:///biz/") >= 0) {
					this.source_id =gup('biz_id',textWhichContainsSourceId)
					textWhichContainsSourceId =  textWhichContainsSourceId.match("biz(.*)\\?")[1];
					textWhichContainsSourceId = textWhichContainsSourceId.replace("&","");
					textWhichContainsSourceId = textWhichContainsSourceId.replace("photos","");
					textWhichContainsSourceId = textWhichContainsSourceId.replace("/","");
					textWhichContainsSourceId = textWhichContainsSourceId.replace("?","");
					this.source_id = textWhichContainsSourceId.replace("utm_","");
				} 
				
			} catch(err) {
				console.log("EXCEPTION. Could not get source_id. Err: " + err.message);		
				this.source_id = '';	
			}
		}

		if (!(this.source_id)) {
			console.log("Retrying fourth attempt to get source_id");
			try {
				var n = this.jqdoc.indexOf("yelp:///biz/");
				console.log("n is :" + n);
				var textWhichContainsSourceId = this.jqdoc.substring(n,n+100);
				console.log("textWhichContainsSourceId: " + textWhichContainsSourceId);
				var locationOfQuestionMark = textWhichContainsSourceId.indexOf("?");
				this.source_id = textWhichContainsSourceId.substring(12,locationOfQuestionMark);
				
			} catch(err) {
				console.log("EXCEPTION. Could not get source_id. Giving up. Err: " + err.message);		
				this.source_id = '';	
			}
		}

		console.log("--- source_id:" + this.source_id);
	}


	//<div class="lightbox-map hidden"...
	this.setLatitude = function () {
		try {
			var textWhichContainsLatitude = $(this.jqdoc).find(".lightbox-map").first().attr('data-map-state');
			//console.log(textWhichContainsLatitude);
			textWhichContainsLatitude = textWhichContainsLatitude.match("url(.*)starred_business")[1];
			textWhichContainsLatitude = textWhichContainsLatitude.match("latitude(.*)longitude")[1];
			textWhichContainsLatitude = textWhichContainsLatitude.replace(/"/g,"");
			textWhichContainsLatitude = textWhichContainsLatitude.replace(":","");
			textWhichContainsLatitude = textWhichContainsLatitude.replace(",","");


			this.location.latitude = textWhichContainsLatitude.trim();
		} catch(err) {
			console.log("EXCEPTION. Could not get latitude " + err.message);	
			try {
				var textWhichContainsLatitude = this.jqdoc.match("latitude(.*)longitude")[1];
				textWhichContainsLatitude = textWhichContainsLatitude.replace(",","");
				textWhichContainsLatitude = textWhichContainsLatitude.replace(":","");
				textWhichContainsLatitude = textWhichContainsLatitude.replace(" ","");
				textWhichContainsLatitude = textWhichContainsLatitude.replace(/"/g,"");
				var n = textWhichContainsLatitude.indexOf("longitude");
				textWhichContainsLatitude = textWhichContainsLatitude.substring(0,n-1);
				this.location.latitude = textWhichContainsLatitude;
			
			} catch(err) {
				console.log("EXCEPTION. Could not get latitude second time " + err.message);		
			}	
		}	
	}

		
	this.setLongitude = function () {
		try {
			var textWhichContainsLongitude = $(this.jqdoc).find(".lightbox-map").first().attr('data-map-state');
			textWhichContainsLongitude = textWhichContainsLongitude.match("url(.*)starred_business")[1];
			textWhichContainsLongitude = textWhichContainsLongitude.match("longitude(.*)key")[1];
			textWhichContainsLongitude = textWhichContainsLongitude.replace(/"/g,"");
			textWhichContainsLongitude = textWhichContainsLongitude.replace(":","");
			textWhichContainsLongitude = textWhichContainsLongitude.replace(",","");
			textWhichContainsLongitude = textWhichContainsLongitude.replace("}","");
			this.location.longitude = textWhichContainsLongitude.trim();
		} catch(err) {
			console.log("EXCEPTION. Could not get longitude " + err.message);	
			try {
				var textWhichContainsLongitude = this.jqdoc.match("longitude(.*)zoom")[1];
				textWhichContainsLongitude = textWhichContainsLongitude.replace(",","");
				textWhichContainsLongitude = textWhichContainsLongitude.replace(":","");
				textWhichContainsLongitude = textWhichContainsLongitude.replace(" ","");
				textWhichContainsLongitude = textWhichContainsLongitude.replace(/"/g,"");
				var n = textWhichContainsLongitude.indexOf("}");
				textWhichContainsLongitude = textWhichContainsLongitude.substring(0,n);
				this.location.longitude = textWhichContainsLongitude;
			} catch(err) {
				console.log("EXCEPTION. Could not get longitude second time " + err.message);		
			}	
		}	
	}

	
	this.setCity = function () {
		try {
			//<span itemprop="addressLocality">Los Angeles</span>
			this.location.city = $(this.jqdoc).find('[itemprop="address"] [itemprop="addressLocality"]').first().text();
		} catch(err) {
			console.log("EXCEPTION. Could not get city in first attempt " + err.message);		
		}

		
		if (!(this.location.city.length) || this.location.city.length < 1) {
			try {
				//<input maxlength="80" name="find_loc" id="dropperText_Mast" autocomplete="off" value="Los Angeles, CA" ... >
				console.log("EXCEPTION. Attempting to find city for second time");	
				this.location.city = $(this.jqdoc).find('[name="find_loc"]').first().attr('value');	
			} catch(err) {
				console.log("EXCEPTION. Could not get city in second attempt. Failing" + err.message);		
			}
		}
		console.log("--- city: " + this.location.city);
 	}

	//<meta itemprop="ratingValue" content="4.0">
	this.setRating = function () {
		try {
			//this.rating = document.querySelectorAll("[itemprop='ratingValue']")[0].content;
			this.rating = $(this.jqdoc).find("[itemprop='ratingValue']").first().attr('content');
		} catch(err) {
			console.log("EXCEPTION. Could not set rating " + err.message);		
		}
	} 

	//<span itemprop="reviewCount">591</span> reviews
	this.setReviews = function () {
		try { 
			//this.reviews = document.querySelectorAll("[itemprop='reviewCount']")[0].textContent;
			this.reviews = $(this.jqdoc).find("[itemprop='reviewCount']").first().text();
		} catch(err) {
			console.log("EXCEPTION. Could not set reviews " + err.message);		
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
YelpVenue.generateVenueUrlFromBizPhotoURL = function (biz_photo_url) {
	return 'https://www.yelp.com/biz/' + biz_photo_url.match("photos/(.*)\\?")[1];
}
YelpVenue.generateImageUrlFromBizPhotoURL = function (biz_photo_url) {
	//console.log("Lyster url: " + biz_photo_url);
	//console.log("Lyster image id: " + gup('select',biz_photo_url));
	return 'https://s3-media1.fl.yelpcdn.com/bphoto/'+ gup('select',biz_photo_url) + '/o.jpg';
	//console.log(gup('select',biz_photo_url));
}


function detectSource (url) {
	if (url.search("foursquare.com/v") >= 0) {
		return 'foursquare'; 
	} else if (url.search("4sq.com/") >= 0) {
		return 'foursquare';
	} else if (url.search("yelp.com/biz") >= 0) {
		return 'yelp'; 
	} else if (url.search("www.tripadvisor") >= 0 && url.search("Review-") >= 0) {
		return 'tripadvisor'; 
	} else {
		return 'unknown';
	}
}

function isNumeric(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}

function gup( name, url ) {
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}

