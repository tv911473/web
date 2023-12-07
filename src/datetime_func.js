const monthNameET = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
const monthNameEN = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const dateOfTodayET = function(){
	let timeNow = new Date();
	let dateET = timeNow.getDate() + ". " + (monthNameET[timeNow.getMonth()]) + " " + timeNow.getFullYear();
	return dateET;
}

const dateOfTodayEN = function(){
	let timeNow = new Date();
	let dateEN = (monthNameEN[timeNow.getMonth()]) + " " + timeNow.getDate() + ", " + timeNow.getFullYear();
	return dateEN;
}
const dateENShort = function(){
	let timeNow = new Date();
	let dateENshort = (timeNow.getMonth() + 1) + "/" + timeNow.getDate() + "/" + timeNow.getFullYear();
	return dateENshort
}

const dayOfTodayET = function(){
	const dayNameET = ["pühapäev","esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];
	let timeNow = new Date();
	return (dayNameET[timeNow.getDay()]);
}

const dayOfTodayEN = function(){
	const dayNameEN = ["sunday","monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
	let timeNow = new Date();
	return (dayNameEN[timeNow.getDay()]);
	}

const timeOfToday = function(){
	let timeNow = new Date();
	const hours = String(timeNow.getHours()).padStart(2, '0');
	const minutes = String(timeNow.getMinutes()).padStart(2, '0');
	const seconds = String(timeNow.getSeconds()).padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
}

const timeOfDayET = function(){
	let partOfDay = "suvaline hetk";
	let hourNow = new Date().getHours();
	if(hourNow >= 6 && hourNow < 10){
		partOfDay = "hommik";
	}
	if(hourNow >= 10 && hourNow < 14){
		partOfDay = "lõuna";
	}
	if (hourNow >= 14 && hourNow < 18){
		partOfDay = "pärastlõuna";
	}
	if(hourNow >= 18){
		partOfDay = "õhtu";
	}
	return partOfDay;
}

//ekspordin koik asjad
module.exports = {dateOfTodayET: dateOfTodayET, timeOfToday: timeOfToday, timeOfDayET: timeOfDayET, dayOfTodayET: dayOfTodayET, dateOfTodayEN: dateOfTodayEN, dayOfTodayEN: dayOfTodayEN, dateENShort: dateENShort}