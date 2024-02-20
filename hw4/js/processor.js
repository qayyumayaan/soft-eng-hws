const fs = require('fs');
const { dateCreator } = require('./dateFunctions'); 
const { crc32 } = require('crc');




// const nodeIcal = require('node-ical');

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
        // Check if the file exists
        if (fs.existsSync(CALENDAR_FILE)) {
            // Read and parse the existing schedule
            // const schedule = fs.readFileSync(CALENDAR_FILE, 'utf-8');
            // console.log('Existing schedule:', schedule);
        } else {
            // If the file doesn't exist, create an empty one
            fs.writeFileSync(CALENDAR_FILE, '', 'utf-8');
            console.log('Master schedule initiated.');
        }
    } catch (error) {
        console.error('Error reading calendar:', error);
    }
}

function FindAvailableDates(startDate, endDate, numberOfDates) {
    // Find available dates
}

function MakeReservation(attendee, dtstart, dtstamp, method, status) {
    initiateMasterSchedule();

    let errorMessages = [];
    if (!methodIsValid(String(method))) errorMessages.push(`${method} is not a valid method!`);
    if (!dateIsValid(String(dtstamp))) errorMessages.push(`${dtstamp} is not a valid date!`);
    if (!dateIsValid(String(dtstart))) errorMessages.push(`${dtstart} is not a valid date!`);
    if (!statusIsValid(String(status))) errorMessages.push(`${status} is not a valid status!`);

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
        const [hash, data] = reservation.split(',');
        if (hash === patientID) {
            console.log(`Reservation found: ${data}`);

            

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


module.exports = {
    FindAvailableDates, MakeReservation, LookupReservations, CancelReservation, readCalendar
};
