// Load popup data when ready
document.addEventListener("DOMContentLoaded", initEditPopup, false);

// set error
function setError(text){
	document.getElementById("error").innerHTML = text;
}
// handle save button click
function saveButtonClick(){
	 var timeStart = document.getElementById("timeStart").value;
	 var timeEnd = document.getElementById("timeEnd").value;
	 var code = document.getElementById("code").value;
	 var title = document.getElementById("title").innerHTML;
	 var timeRegex = /\d\d:\d\d/g;
	 var error = "";
	 if(!timeRegex.test(timeStart)){
		error += "Time should be in format '00:00'</br>";
	 } 
	 if(code.length == 0){
		error += "Code should not be empty.</br>";
	 }
	 setError(error);
	 if(error.length == 0){		
		// save time
		chrome.extension.getBackgroundPage().addTimeCode(title, timeStart, timeEnd, code);
	 }
	 getLectureData(handleLectureData);
}

// initialize popup
function initEditPopup(){	
	console.log("Edit popup window loading...");
	// Save button listener
	document.getElementById('saveTimeBtn').addEventListener("click", saveButtonClick);
	// Reload data
	getLectureData(handleLectureDataForEdit);
}


// handles retrieved lecture data for edit
function handleLectureDataForEdit(response){
	console.log("Retrieved response from content script");		
	lecture_data = response.lecture_data;	
	document.getElementById('timeStart').value = lecture_data.lecture_info.time;	
}




