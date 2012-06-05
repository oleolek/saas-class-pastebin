console.log("Background page runinngs!");

data = {};
loadData("pastebin.txt");


// load pastebin data
function loadData(file) {
	console.log("Loading data");
	var request = new XMLHttpRequest();
	request.onreadystatechange = function(){		
		if ( request.readyState == 4 && request.status == 200 ) 
		{			
			if ( request.responseText == "Not found" ) 
			{
				console.log("Not found");
			}
			else
			{
				console.log("Data loaded");
				data = JSON.parse(request.responseText);
				console.log("Data conveted from JSON:"+data);
			}                    
		}
		
	}
	request.open("GET", file, true);
	request.send(null);
}

function getLectureInfo(tab){
	console.log("Icon clicked!");
	var port = chrome.tabs.connect(tab.id);
	port.postMessage({method:"get_lecture_info"});
	 
	port.onMessage.addListener(function(response) {
		console.log("Retrieved response");
		console.log(response.lecture_info);
		lecture_info = response.lecture_info;
		pastebinLink = get_pastebin_link(lecture_info);
		
		if(pastebinLink)
			// create new tab
			chrome.tabs.create({url:pastebinLink}, function callback(){
			});
		else 
			alert("Sorry this lecture is not supported yet");
	
	  });
		
	
}

// Retrieve lecture info
chrome.browserAction.onClicked.addListener(getLectureInfo);

// Retrieve pastebin code for specific lecture and time 
function get_pastebin_link(lecture_info){
	pastebin_codes = data[lecture_info.title];
	time = lecture_info.time;
	if(pastebin_codes){		
		pastebin_time = "00:00";
		pastebin_code = null;
		// find maximum pastebin time less than current time
		for(var i=0;i<pastebin_codes.length;i++){	
			var pbc = pastebin_codes[i];
			console.log("Try time:"+pbc["time"]+", code:"+pbc["code"]);
			if(pbc.time <= time && pbc.time > pastebin_time){
				pastebin_time = pbc.time;
				pastebin_code = pbc.code;
			}
		}
		// get first element if time is too earlier
		if(pastebin_code == null && pastebin_codes.length > 0){
			pastebin_code = pastebin_codes[0].code;
		}
		
		if(pastebin_code){
			return "http://pastebin.com/"+pastebin_code;
		}
	}
	return null;
}


