function dateCreator(inputString) {
    if (inputString.length !== 15) return console.log("Improper format!");

    let year = inputString.substring(0, 4);
    let month = inputString.substring(4, 6);
    let day = inputString.substring(6, 8);
    let hour = inputString.substring(9, 11);
    let min = inputString.substring(11, 13);
    let second = inputString.substring(13, 15);

    let formattedDate; 

    if(bigValidator(year, month, day, hour, min, second)) { 
      formattedDate = datePrinter(year, month, day, hour, min, second)
    }

    return formattedDate; 
}

function datePrinter(year, month, day, hour, min, second) {
  let date = new Date(`${year}-${month}-${day}T${hour}:${min}:${second}`);

  let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
  formattedDate = date.toLocaleString('en-US', options);

  console.log(formattedDate)

  return formattedDate
}

function bigValidator(year, month, day, hour, min, second) {

  if(!yearIsValid(year)) {
    console.log("Year is not valid!");
    return false;
  }

  if (!monthIsValid(month)) {
    console.log("Month is not valid!")
    return false;
  }

  if (!dayIsValid(month, day, year)) {
    console.log("Day is not valid!")
    return false;
  }

  if (!hourIsValid(hour)) {
    console.log("Hour is not valid!")
    return false;
  }

  if (!minIsValid(min)) {
    console.log("Minute is not valid!")
    return false;
  }

  if (!secondIsValid(second)) {
    console.log("Second is not valid!")
    return false;
  }

  return true;

}

function containsOnlyNumbers(input) {
  return /^[0-9]+$/.test(input);
}


function yearIsValid(year) {
  if (year.length != 4) return false;
  if (!containsOnlyNumbers(year)) return false;

  const integer = interpretAsInteger(year);
  return (integer >= 1000 || integer < 10000);
}


function monthIsValid(month) {
  if (month.length != 2) return false;
  if (!containsOnlyNumbers(month)) return false;

  const integer = interpretAsInteger(month);
  return integer >= 1 && integer <= 12;
}

function dayIsValid(monthString, dayString, yearString) {
  if (dayString.length != 2) return false;

  const day = interpretAsInteger(dayString)
  const month = interpretAsInteger(monthString)
  const year = interpretAsInteger(yearString)

  const maxDays = [31, 28 + (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  const validCheck = day >= 1 && day <= maxDays[month - 1]
  return validCheck;
}

function hourIsValid(hour) {
  if (hour.length != 2) return false;
  if (!containsOnlyNumbers(hour)) return false;

  const integer = interpretAsInteger(hour);
  return integer >= 0 && integer <= 23;
}


function minIsValid(min) {
  if (min.length != 2) return false;
  if (!containsOnlyNumbers(min)) return false;

  const integer = interpretAsInteger(min);
  return integer >= 0 && integer <= 59;
}


function secondIsValid(second) {
  if (second.length != 2) return false;
  if (!containsOnlyNumbers(second)) return false;

  const integer = interpretAsInteger(second);
  return integer >= 0 && integer <= 59;
}


function interpretAsInteger(input) {
  return parseInt(input, 10);
}


module.exports = {
    dateCreator, 
    bigValidator, 
    yearIsValid, 
    monthIsValid, 
    dayIsValid, 
    hourIsValid, 
    minIsValid, 
    secondIsValid, 
    interpretAsInteger
  };