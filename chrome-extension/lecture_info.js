/*
* Retrieve information from current page about lecture title and current time.
*/
// listener to request on lecture info from current page
chrome.extension.onConnect.addListener(function(port) {    
  port.onMessage.addListener(function(request) {
	console.log("Receiving request:"+request.method);
	if(request.method = "get_lecture_info"){		
		lecture_info = get_lecture_info();
		if(lecture_info){
			port.postMessage({lecture_info: lecture_info});
		} else
			alert("Page doesn't contain lecture video");
	}
  });
});

// retrieve lecture title from video frame
function get_lecture_title(document){
	var title =  document.getElementById("lecture_title").innerHTML;
	// remove time from lecture title
	var timeRegexp = /\s+\(\d?\d:\d\d\)/g;
	return title.replace(timeRegexp, "");
}

// retrieve current video time
function get_current_time(document){
	return document.querySelector(".mejs-currenttime").innerHTML;
}

function get_lecture_info(){	

	// Video <iframe>
	var videoFrame = document.getElementById("fancybox-frame");
	if(videoFrame){
		var content = videoFrame.contentDocument;

		// retrieve lecture title and current time
		title = get_lecture_title(content);
		time = get_current_time(content);
		console.log("Title:'"+title+"'");
		console.log("Time:"+time);
		if(title && time){
			return { title: title, time: time};
		}
	}
	return null		
}

console.log("Content script initialized!");