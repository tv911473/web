const monthNameET = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const dateOfTodayEn = function(){
	let timeNow = new Date();
	let dateET = (monthNameET[timeNow.getMonth()]) + " " + timeNow.getDate() + ", " + timeNow.getFullYear();
	return dateET;
}

const dayOfTodayEn = function(){
	const dayNameET = ["sunday","monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
	let timeNow = new Date();
	return (dayNameET[timeNow.getDay()]);
	}

const timeOfTodayEn = function(){
	let timeNow = new Date();
	const hours = String(timeNow.getHours()).padStart(2, '0');
	const minutes = String(timeNow.getMinutes()).padStart(2, '0');
	const seconds = String(timeNow.getSeconds()).padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
}

const timeOfDayEn = function(){
	let partOfDay = "random time";
	let hourNow = new Date().getHours();
	if(hourNow >= 6 && hourNow < 10){
		partOfDay = "morning";
	}
	if(hourNow >= 10 && hourNow < 14){
		partOfDay = "lunch";
	}
	if (hourNow >= 14 && hourNow < 18){
		partOfDay = "afternoon";
	}
	if(hourNow >= 18){
		partOfDay = "evening";
	}
	return partOfDay;
}

//ekspordin koik asjad
module.exports = {dateOfTodayEn: dateOfTodayEn, timeOfTodayEn: timeOfTodayEn, timeOfDayEn: timeOfDayEn, dayOfTodayEn: dayOfTodayEn}