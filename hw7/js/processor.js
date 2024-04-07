const fs = require('fs');
const { dateCreator } = require('./dateFunctions'); 
const { crc32 } = require('crc');



const HOLIDAYS = ['20240219', '20240321', '20240527', '20240704', '20240902', '20241128', '20241225'];

const CALENDAR_FILE = 'master_schedule.txt';


class Publisher {
    #subscribers;
    
    constructor() {
        this.#subscribers = new Set();
    }

    subscribe(handlerFn) {
        this.#subscribers.add(handlerFn);
    }

    unsubscribe(handlerFn) {
        return this.#subscribers.delete(handlerFn);
    }

    publish(eventProperties) {
        this.#subscribers.forEach(handlerFn => {
            handlerFn(eventProperties);
        });
    }
}


class Bonder {
    #nextPublisher;

    constructor() {
        this.#nextPublisher = new Publisher();
    }


    bind(source, calculation) {
        const myPub = this.#nextPublisher;

        source.subscribe( function(eventProperties) {
            myPub.publish(calculation(eventProperties) );
        });
    }
}

class TerminalBonder {
    #value_ = 0;

    get value() {
        return this.#value_;
    }

    bind(source, calculation) {
        let self = this;

        source.subscribe( function(eventProperties)  {
            self.#value_ = calculation(eventProperties);
            console.log("value = " + self.#value_);
        });

        return source;
    }
}


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
    if (schedule == null) return false
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

    // Subscribe cancellationPublisher to handlers
    cancellationPublisher.subscribe(notifyDoctor);
    cancellationPublisher.subscribe(notifySecretary);
    cancellationPublisher.subscribe(logCancellationForAudit);

    console.log("Notification sent.")

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

const cancellationPublisher = new Publisher();
cancellationPublisher.subscribe(notifyDoctor);
cancellationPublisher.subscribe(notifySecretary);
cancellationPublisher.subscribe(logCancellationForAudit);


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
        const [hash, actualConfirmationCode, ...rest] = reservation.split(',');
        if (actualConfirmationCode === confirmationCode) {
            found = true;
            // Notify subscribers about the cancellation
            cancellationPublisher.publish({
                type: 'cancellation',
                details: `Reservation for ${rest.join(', ')} has been cancelled.`
            });
            // Notify doctor and secretary
            notifyDoctor();
            notifySecretary();
            logCancellationForAudit();
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



function notifyDoctor() {
    cancellationPublisher.subscribe(notifyDoctor);
    console.log(`Notified doctor.`);
}

function notifySecretary() {
    cancellationPublisher.subscribe(notifySecretary);
    console.log(`Notified secretary`);
}

function logCancellationForAudit() {
    cancellationPublisher.subscribe(logCancellationForAudit);
    console.log(`Logged cancellation for audit`);
}


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
    FindAvailableDates, Publisher, MakeReservation, LookupReservations, CancelReservation, readCalendar, initiateMasterSchedule, dateIsValid, methodIsValid, sortSchedule, notifyDoctor, notifySecretary, logCancellationForAudit, statusIsValid, cancellationPublisher
};
