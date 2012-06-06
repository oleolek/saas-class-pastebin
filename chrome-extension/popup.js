// Load popup data when ready
document.addEventListener("DOMContentLoaded", initPopup, false);

// initialize popup
function initPopup(){	
	console.log("Popup window loading...");	
	getLectureData(handleLectureData);
}

// handles retrieved lecture data
function handleLectureData(response){
	console.log("Retrieved response from content script");		
	lecture_data = response.lecture_data;	
	document.getElementById('title').innerHTML = lecture_data.lecture_info.title;	
	populateTimeCodesList(lecture_data);
}

function handleLinkClick(e){
	console.log("Link clicked");
	var link = e.target;
	// create new tab
    chrome.tabs.create({url: link.href});
}

function in_interval(time, left, right){
	right = right ? right : "99:99";
	return time >= left && time < right;
}

// populate list of time codes
function populateTimeCodesList(lecture_data){	
	pastebin_codes = lecture_data.pastebin_codes;
	var list = document.getElementById("timeList");
	if(pastebin_codes) {
		if(pastebin_codes.length > 0){
			list.innerHTML = "<thead><th>Video Time</th><th>Pastebin Code</th></thead>";
		} else {
			list.innerHTML = "No pastebin links for this video or lecture is not prepared yet.";
		}
		for(var i=0;i<pastebin_codes.length; i++){		
			var pbc = pastebin_codes[i];			
			var tr = document.createElement("tr");
			
			var time = document.createElement("td");
			time.innerHTML = pbc.start + " -> " + (pbc.end ? pbc.end : "end");
			var code = document.createElement("td");
			
			var link = document.createElement("a");
			link.setAttribute("href", createPastebinLink(pbc.code));
			link.href = createPastebinLink(pbc.code);
			link.innerHTML = pbc.code;
			code.appendChild(link);
			link.addEventListener("click", handleLinkClick, false);
			
			
			if(in_interval(lecture_data.lecture_info.time, pbc.start, pbc.end)){
				tr.setAttribute("class", "current_time");
			} else tr.setAttribute("class", "not_current_time");
			
			tr.appendChild(time);
			tr.appendChild(code);
			list.appendChild(tr);
		}
	} else {
		list.innerHTML = "No pastebin codes for this lecture";
	}
}

// construct hyperlink to pastebin code
function createPastebinLink(code){
	return "http://pastebin.com/"+code;
}


// retrieve lecture data from background
function getLectureData(callback){
	console.log("Get lecture data!");	
	var port = chrome.extension.connect();
	port.postMessage({method:"get_lecture_data"});	 
	port.onMessage.addListener(callback);		
}

