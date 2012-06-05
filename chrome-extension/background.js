console.log("Background page runinngs!");

// data that contains mapping from "lecture title" -> [ <"time":"pastebin code"> ]
data = {};
loadData("pastebin.txt");


// load pastebin data
function loadData(file) {
    console.log("Loading data");
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            if (request.responseText == "Not found") {
                console.log("Not found");
            } else {
                console.log("Data loaded");
                data = JSON.parse(request.responseText);
                console.log("Data conveted from JSON:" + data);
            }
        }

    }
    request.open("GET", file, true);
    request.send(null);
}

// add time code to data
function addTimeCode(title, start, end, code){
	pastebin_codes = data[title];
	if(pastebin_codes == null){
		pastebin_codes = [];
	} 
	var value = {"start":start, "code":code};
	if(end.length > 0){
		value.end = end;
	}
	pastebin_codes.push(value);
	data[title] = pastebin_codes;
	console.log("Data after add : \n" + JSON.stringify(data));
}


// handle extension icon click
function extensionClickHandler(tab) {
    var editMode = false;
    if (!editMode) {
		console.log("Showing popup");
        // change icon for user mode
        chrome.browserAction.setIcon({
            path: "icon.png"
        })
        // no popup to show
        chrome.browserAction.setPopup({ tabId: tab.id,
            popup: "popup.html"
        });
        // open tab with pastebin link
        //getLectureInfo(tab, handleLectureInfo);
    } else {
        // change icon for edit mode
        chrome.browserAction.setIcon({
            path: "edit_icon.png"
        })
        // show popup		
        chrome.browserAction.setPopup({
            tabId: tab.id,
            popup: "edit_popup.html"
        });
    }
	// no popup to show
	/*
        chrome.browserAction.setPopup({tabId: tab.id,
            popup: ""
        });
		*/
}

function handleLectureInfo(response) {
    console.log("Received response on lecture info");
    console.log(response.lecture_info);
    lecture_info = response.lecture_info;
    pastebinLink = get_pastebin_link(lecture_info);

    if (pastebinLink)
    // create new tab
    chrome.tabs.create({
        url: pastebinLink
    }, function callback() {});
    else alert("Sorry this lecture is not supported yet");
}

// retrieve lecture info from current page using content script
function getLectureInfo(tab, callback) {
    console.log("Get lecture info");
    var port = chrome.tabs.connect(tab.id);
    port.postMessage({
        method: "get_lecture_info"
    });
    console.log("Sending request on lecture info to content script");
    port.onMessage.addListener(callback);
}

// Retrieve lecture info
chrome.browserAction.onClicked.addListener(extensionClickHandler);

// Retrieve pastebin codes for specific lecture and time.
// Time is optional, if not specified all returned
function get_pastebin_codes(title, time){
	pastebin_codes = data[title];    
    if (pastebin_codes) {
        pastebin_time = "00:00";
		result = []; 
		// sort pastebin by start time
		pastebin_codes.sort(function(a,b){
			return a.start>b.start
		});
		
        // find all pastebin codes that time into their interval: start <= time < end
        for (var i = 0; i < pastebin_codes.length; i++) {
            var pbc = pastebin_codes[i];
            console.log("Try start time:" + pbc["start"] + " end time:"+pbc["end"]+" , code:" + pbc["code"]);
			var start = pbc.start;
			var end = pbc.end ? pbc.end : '99:99';
			if(time){
				if ( start <= time && end > time) {                
					result.push(pbc);
				}
			} else result.push(pbc);
        }					       

		
        return result;
    }
    return [];
}


function get_pastebin_link(lecture_info) {
    pastebin_codes = data[lecture_info.title];
    time = lecture_info.time;
    if (pastebin_codes) {
        pastebin_time = "00:00";
        pastebin_code = null;
        // find maximum pastebin time less than current time
        for (var i = 0; i < pastebin_codes.length; i++) {
            var pbc = pastebin_codes[i];
            console.log("Try time:" + pbc["time"] + ", code:" + pbc["code"]);
            if (pbc.time <= time && pbc.time > pastebin_time) {
                pastebin_time = pbc.time;
                pastebin_code = pbc.code;
            }
        }			
		
        // get first element if time is too earlier
        if (pastebin_code == null && pastebin_codes.length > 0) {
            pastebin_code = pastebin_codes[0].code;
        }

        if (pastebin_code) {
            return "http://pastebin.com/" + pastebin_code;
        }
    }
    return null;
}

// listener to request on lecture data (title, current_time, time->pastebin code) from current page
chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (request) {
        chrome.tabs.getSelected(null, function (tab) {
            if (request.method = "get_lecture_data") {
                console.log("Receiving request on lecture data");
				// send request on current lecture info
                getLectureInfo(tab, function (response) {
                    console.log("Sending response on lecture data");
                    lecture_info = response.lecture_info;
					pastebin_codes = get_pastebin_codes(lecture_info.title);					
                    lecture_data = {
                        lecture_info: lecture_info,
                        pastebin_codes: pastebin_codes
                    };
					
                    port.postMessage({
                        lecture_data: lecture_data
                    });
                });
            }
        });
    });
});