/*
* Retrieve information from current page about lecture title and current time.
*/
chrome.extension.onConnect.addListener(function(port) {    
  port.onMessage.addListener(function(msg) {	
	console.log("Receiving request");
	lecture_info = get_lecture_info();
	if(lecture_info){
		port.postMessage({lecture_info: lecture_info});
	} else
		alert("Page doesn't contain lecture video");
	
  });
});

function get_lecture_info(){	

	// Video <iframe>
	var videoFrame = document.getElementById("fancybox-frame");
	if(videoFrame){
		var content = videoFrame.contentDocument;

		// retrieve lecture title and current time
		title = content.getElementById("lecture_title");
		time = content.querySelector(".mejs-currenttime");
		console.log("Title:"+title);
		console.log("Time:"+time);
		if(title && time){
			return { title: title.innerHTML, time: time.innerHTML};
		}
	}
	return null		
}

console.log("Content script initialized!");