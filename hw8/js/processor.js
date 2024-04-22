const fs = require('fs');
const { dateCreator } = require('./dateFunctions'); 
const { crc32 } = require('crc');
const { dataBase } = require('./mysql');


const HOLIDAYS = ['20240219', '20240321', '20240527', '20240704', '20240902', '20241128', '20241225'];

const CALENDAR_FILE = 'master_schedule.txt';

function readCalendar() {
    return new Promise((resolve, reject) => {
        dataBase.query('SELECT * FROM Users ORDER BY DTSTART ASC', (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}


function sortSchedule(schedule) {
    if (schedule == null) return false
    const reservations = schedule.split('\n').filter(Boolean);
    const sortedReservations = reservations.sort((a, b) => {
        const [, dateA] = a.split(',');
        const [, dateB] = b.split(',');
        return new Date(dateA) - new Date(dateB);
    });
    return sortedReservations.join('\n');
}

function addToDatabase(newRecord) {
    return new Promise((resolve, reject) => {
        dataBase.query('INSERT INTO Users SET ?', newRecord, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

function initiateMasterSchedule() {
    try {
        if (fs.existsSync(CALENDAR_FILE)) {
        } else {
            fs.writeFileSync(CALENDAR_FILE, '', 'utf-8');
            console.log('Master schedule initiated.');
        }
    } catch (error) {
        console.error('Error reading calendar:', error);
    }
}

function FindAvailableDates(startDate, endDate, numberOfDates) {
    const availableDates = [];
    let currentDate = startDate; 

    if (!isValidShortDate(startDate)) {
        console.error('Invalid start date format. Please use YYYYMMDD format.');
        return;
    }

    if (!isValidShortDate(endDate)) {
        console.error('Invalid end date format. Please use YYYYMMDD format.');
        return;
    }
    let foundDates = 0;

    while (foundDates < numberOfDates) {
        if (currentDate > endDate) {
            break;
        }

        const year = currentDate.substring(0, 4);
        const month = currentDate.substring(4, 6);
        const day = currentDate.substring(6, 8);

        const formattedDate = `${year}${month}${day}`;

        if (!invalidOrConflictingDates(formattedDate)) {
            availableDates.push(formattedDate);
            foundDates++;
        }

        currentDate = incrementDateByOne(currentDate);
    }

    console.log(`The next ${numberOfDates} available dates are: ${availableDates.join(', ')}`);
    return availableDates;
}

function isValidShortDate(dateString) {
    if (typeof dateString !== 'string' || dateString.length !== 8) {
        return false; // Date string must be in YYYYMMDD format
    }

    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1; // Month is zero-based
    const day = parseInt(dateString.substring(6, 8));

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return false; // Invalid components
    }

    const date = new Date(year, month, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
    );
}


function incrementDateByOne(dateString) {
    let year = parseInt(dateString.substring(0, 4));
    let month = parseInt(dateString.substring(4, 6));
    let day = parseInt(dateString.substring(6, 8));

    // Increment the day
    day += 1;

    // Handle month and year rollover
    if (day > getDaysInMonth(year, month)) {
        day = 1;
        month += 1;
        if (month > 12) {
            month = 1;
            year += 1;
        }
    }

    // Format the incremented date
    return `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
}
  
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}


async function MakeReservation(attendee, dtstart, dtstamp, method, status) {
    // First, validate the inputs
    let errorMessages = [];
    if (!methodIsValid(method)) errorMessages.push(`${method} is not a valid method!`);
    if (!dateIsValid(dtstamp)) errorMessages.push(`${dtstamp} is not a valid date!`);
    if (!dateIsValid(dtstart)) errorMessages.push(`${dtstart} is not a valid date!`);
    if (!statusIsValid(status)) errorMessages.push(`${status} is not a valid status!`);
    // Assume we have a function to check if the date is available or not
    const isDateAvailable = await checkDateAvailability(dtstart);
    if (!isDateAvailable) errorMessages.push(`${dtstart} is in conflict!`);

    if (errorMessages.length > 0) {
        console.error(errorMessages.join('\n'));
        return false; // Stop execution if there are errors
    }

    // If validation passes, prepare the data for insertion
    const newRecord = {
        ATTENDEE: attendee,
        DTSTART: dtstart,
        METHOD: method,
        STATUS: status,
        DTSTAMP: dtstamp // Assuming you have a column for this in your table
    };

    // Insert the data into the database
    try {
        await insertIntoDatabase(newRecord);
        console.log('Reservation made successfully');
        return true; // Indicate success
    } catch (error) {
        console.error('Database operation failed:', error);
        return false; // Indicate failure
    }
}

async function checkDateAvailability(dtstart) {
    const query = 'SELECT COUNT(*) AS count FROM Users WHERE DTSTART = ?';
    const [results] = await dataBase.promise().query(query, [dtstart]);
    return results[0].count === 0; // Returns true if date is available
}

// Helper function to insert a new record into the database
async function insertIntoDatabase(newRecord) {
    const query = 'INSERT INTO Users (ATTENDEE, DTSTART, METHOD, STATUS, DTSTAMP) VALUES (?, ?, ?, ?, ?)';
    await dataBase.promise().query(query, [newRecord.ATTENDEE, newRecord.DTSTART, newRecord.METHOD, newRecord.STATUS, newRecord.DTSTAMP]);
}



function hashReservation(reservationData) {
    return crc32(reservationData).toString(16);
}

function LookupReservations(patientID) {
    const schedule = readCalendar();
    const reservations = schedule.split('\n').filter(Boolean);
    
    let found = false;
    for (const reservation of reservations) {
        const [hash, confirmationCode, attendee, dtstart, dtstamp, method, status] = reservation.split(',');
        if (hash === patientID) {
            console.log(`Reservation found: \nAttendee: ${attendee} \nDateStart:${dtstart} \nDateStamp:${dtstamp} \nMethod:${method} \nStatus:${status}`);

            found = true;
            break;
        }
    }
    
    if (!found) {
        console.log('No reservation found with the provided confirmation code.');
    }
}

function CancelReservation(confirmationCodeNoString) {
    let confirmationCode = String(confirmationCodeNoString)

    const schedule = readCalendar();
    if (!schedule) {
        console.log('No reservations found.');
        return;
    }

    const reservations = schedule.split('\n');
    
    let found = false;
    const updatedSchedule = reservations.filter(reservation => {
        const [, actualConfirmationCode] = reservation.split(',');
        if (actualConfirmationCode === confirmationCode) {
            found = true;
            return false;
        }
        return true;
    }).join('\n');

    if (!found) {
        // Updated message to match the expected output in the test
        console.log('No reservation found with the provided confirmation code.');
        return;
    }

    fs.writeFileSync(CALENDAR_FILE, updatedSchedule, 'utf-8');
    console.log('Reservation cancelled successfully.');
}



// function main(attendee, dtstart, dtstamp, method, status) {
//     // Main program logic and command-line interface
// }

function dateIsValid(date) {
    return (dateCreator(date.replace('Z', '')) !== false)
}

function methodIsValid(method) {
    const validMethods = ['REQUEST', 'CANCEL', 'ADD', 'REPLY', 'PUBLISH', 'REFRESH', 'RESPOND'];
    return validMethods.includes(method.toUpperCase());
}

function statusIsValid(status) {
    const validStatuses = ['TENTATIVE', 'CONFIRMED', 'CANCELLED'];
    return validStatuses.includes(status.toUpperCase());
}




function isWeekendOrHoliday(date) {
    const year = date.slice(0, 4);
    const month = date.slice(4, 6) - 1; 
    const day = date.slice(6, 8);
    const formattedDate = new Date(year, month, day);
    
    const dayOfWeek = formattedDate.getDay(); 
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const formattedDateString = date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 8);
    const isHoliday = HOLIDAYS.includes(formattedDateString);

    return isWeekend || isHoliday;
}



function invalidOrConflictingDates(date) {
    const schedule = readCalendar();
    const existingDates = schedule.split('\n').map(entry => entry.split(',')[3]); 

    const requestedDate = new Date(date).setHours(0, 0, 0, 0);

    for (const entry of existingDates) {
        const entryDate = new Date(entry).setHours(0, 0, 0, 0);
        if (entryDate === requestedDate) {
            console.log('Date is already booked or conflicts with existing reservation.');
            return false;
        }
    }

    if (isWeekendOrHoliday(date)) {
        // console.log('Date is on a weekend or holiday.');
        return false;
    }

    return true;
}





module.exports = {
    FindAvailableDates, MakeReservation, LookupReservations, CancelReservation, readCalendar, initiateMasterSchedule, dateIsValid, methodIsValid, sortSchedule
};
