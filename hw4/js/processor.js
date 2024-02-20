const fs = require('fs');
const { dateCreator } = require('./dateFunctions'); 
const { crc32 } = require('crc');



const HOLIDAYS = ['20240219', '20240321', '20240527', '20240704', '20240902', '20241128', '20241225'];

const CALENDAR_FILE = 'master_schedule.txt';

function readCalendar() {
    try {
        if (fs.existsSync(CALENDAR_FILE)) {
            const schedule = fs.readFileSync(CALENDAR_FILE, 'utf-8');
            const sortedSchedule = sortSchedule(schedule);
            return sortedSchedule;
        } else {
            fs.writeFileSync(CALENDAR_FILE, '', 'utf-8');
            console.log('Master schedule initiated.');
            return '';
        }
    } catch (error) {
        console.error('Error reading calendar:', error);
        return '';
    }
}

function sortSchedule(schedule) {
    const reservations = schedule.split('\n').filter(Boolean);
    const sortedReservations = reservations.sort((a, b) => {
        const [, dateA] = a.split(',');
        const [, dateB] = b.split(',');
        return new Date(dateA) - new Date(dateB);
    });
    return sortedReservations.join('\n');
}

function writeToMaster(data) {
    try {
        fs.appendFileSync(CALENDAR_FILE, data + '\n', 'utf-8');
        console.log('Reservation added to master schedule.');
    } catch (error) {
        console.error('Error writing to master schedule:', error);
    }
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

function FindAvailableDates(numberOfDates) {
    const availableDates = [];
    let currentDate = new Date(); 
    let foundDates = 0;

    while (foundDates < numberOfDates) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
        const day = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}${month}${day}`;

        if (invalidOrConflictingDates(formattedDate)) {
            availableDates.push(formattedDate);
            foundDates++;
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`The next ${numberOfDates} available dates are: ${availableDates}`);
}


function MakeReservation(attendee, dtstart, dtstamp, method, status) {
    initiateMasterSchedule();

    let errorMessages = [];
    if (!methodIsValid(String(method))) errorMessages.push(`${method} is not a valid method!`);
    if (!dateIsValid(String(dtstamp))) errorMessages.push(`${dtstamp} is not a valid date!`);
    if (!dateIsValid(String(dtstart))) errorMessages.push(`${dtstart} is not a valid date!`);
    if (!statusIsValid(String(status))) errorMessages.push(`${status} is not a valid status!`);
    if (!invalidOrConflictingDates(String(dtstart))) errorMessages.push(`${dtstart} is in conflict!`);


    if (errorMessages.length > 0) {
        console.log(errorMessages.join('\n'));
        return false;
    }

    const reservationData = `${attendee},${dtstart},${dtstamp},${method},${status}`;
    const patientID = hashReservation(reservationData); 
    const confirmationCode = hashReservation(`${reservationData},${new Date().getTime()}`); 

    const schedule = readCalendar();
    const existingEntries = schedule ? schedule.split('\n').map(entry => entry.split(',')[2]) : [];
    const newDate = dtstart.split('T')[0];

    // Check if there's an existing reservation on the same day
    const isDateTaken = existingEntries.some(entry => entry.split(',')[3])

    if (isDateTaken) {
        console.log('An event already exists on this day. Only one event per day is allowed.');
        return false;
    }

    const reservationEntry = `${patientID},${confirmationCode},${reservationData}`;
    console.log(`Your patientID is ${patientID}. Your confirmation code is ${confirmationCode}.`);
    writeToMaster(reservationEntry);

    return true;
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
        const [hash] = reservation.split(',');
        if (hash === confirmationCode) {
            found = true;
            return false; 
        }
        return true; 
    }).join('\n');

    if (!found) {
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
    const existingDates = schedule.split('\n').map(entry => entry.split(',')[3].slice(0, 8)); 

    // console.log(existingDates)

    if (existingDates.includes(date.slice(0, 8))) {
        return false;
    }

    if (isWeekendOrHoliday(date)) {
        console.log('Date is on a weekend or holiday.');
        return false;
    }

    return true;
}



module.exports = {
    FindAvailableDates, MakeReservation, LookupReservations, CancelReservation, readCalendar
};
