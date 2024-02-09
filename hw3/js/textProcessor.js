const fs = require('fs');
const readline = require('readline');
const { dateCreator } = require('./dateFunctions'); 

const VALID_FILE_EXTENSION = ['.ical', '.ics', '.icalendar', '.ifb'];
const VALID_KEYS = ['status', 'dtstart', 'dtstamp', 'identifier', 'method', 'attendee', 'prodid', 'version', 'summary', 'uid'];
const VALID_STATUSES = ['TENTATIVE', 'CONFIRMED', 'CANCELLED'];

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const PHONE_REGEX = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;


/*

need to include: 
ATTENDEE, (email or telephone) 
DTSTART, (replace time) (done)
DTSTAMP, (add another time object) (done)
METHOD, (there is only METHOD:REQUEST) (done) 
STATUS (replace color) (done)

*/

async function textProcessor(inputString) {
    if (!await fileIsValid(inputString)) {
        console.error("File validation failed!");
        return false;
    }

    try {
        const text = await fs.promises.readFile(inputString, 'utf-8');
        // console.log(text);
        const records = await processTextFile(inputString);
        if (records.length > 0) {
            const sortedRecords = sortRecords(records);
            await writeSortedRecordsToFile(sortedRecords, 'calendar-new.ical');
        }
    } catch (err) {
        console.error("Error processing file:", err.message);
    }
}

async function fileIsValid(inputString) {

    const lowerCaseInput = inputString.toLowerCase();

    let extensionIsValid = false
    
    for (let i = 0; i < VALID_FILE_EXTENSION.length; i++) {
        const extension = VALID_FILE_EXTENSION[i];
        if (lowerCaseInput.endsWith(extension.toLowerCase())) {
            return true;
        }
    }

    if (extensionIsValid == false) {
        console.error(`Invalid file extension!`);
        return false;
    }

    try {
        await fs.promises.access(inputString, fs.constants.F_OK);
        return true;
    } catch (err) {
        console.error(`${inputString} does not exist!`);
        return false;
    }
}

async function processTextFile(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let currentRecord = {};
    let recordStarted = false;
    let errors = [];
    let keysSet = new Set();
    let records = []; // Array to store all valid records

    for await (const line of rl) {
        if (line.includes('BEGIN:VCALENDAR')) {
            handleBeginRecord();
        } else if (line.includes('END:VCALENDAR')) {
            handleEndRecord();
        } else if (recordStarted) {
            processLine(line);
        }
    }

    if (recordStarted) {
        errors.push('Last record not properly ended with END:VCALENDAR');
    }

    if (errors.length > 0) {
        console.error('Errors! ' + errors);
    }

    return records;

    function handleBeginRecord() {
        if (recordStarted) {
            errors.push('Previous record not properly ended before new BEGIN:VCALENDAR');
        }
        currentRecord = {};
        keysSet.clear();
        recordStarted = true;
    }

    function handleEndRecord() {
        if (!recordStarted) {
            errors.push('END:VCALENDAR found without a corresponding BEGIN:VCALENDAR');
        } else {
            console.log(`Processed Record: ${JSON.stringify(currentRecord, null, 2)}`);
            records.push({ ...currentRecord }); 
        }
        recordStarted = false;
    }
    

    function processLine(line) {
        const [key, value] = line.split(':').map(part => part.trim());
        if (!key || !value) {
            errors.push(`Invalid line format: ${line}`);
            return;
        }
    
        const lowerKey = key.toLowerCase();
        if (VALID_KEYS.includes(lowerKey)) {
            if (lowerKey !== 'attendee' && keysSet.has(lowerKey)) {
                errors.push(`Duplicate key found in record: ${key}`);
                return;
            }
            if (!validateKeyValue(lowerKey, value)) {
                errors.push(`Invalid format for ${lowerKey}: ${value}`);
                return;
            }
    
            if (lowerKey === 'method' && value.toUpperCase() === 'REQUEST') {
                currentRecord['isSchedulingRequest'] = true;
            } else if (lowerKey === 'dtstart' || lowerKey === 'dtstamp') {
                currentRecord[lowerKey] = dateCreator(value);
            } else if (lowerKey === 'attendee') {
                // Initialize the attendees array if it doesn't exist
                if (!currentRecord['attendees']) {
                    currentRecord['attendees'] = [];
                }
                // Add the attendee to the array
                currentRecord['attendees'].push(value);
            } else {
                currentRecord[lowerKey] = value;
            }
    
            keysSet.add(lowerKey);
        } else {
            errors.push(`Invalid key: ${key}`);
        }
    }
    
    
    function validateKeyValue(key, value) {
        switch (key) {
            case 'status':
                return statusIsValid(value);
            case 'attendee':
                return attendeeIsValid(value.split(':')[1]); // Extract email or phone from the value
            case 'dtstart':
            case 'dtstamp':
                return dateCreator(value.replace('Z', '')) !== false; // Remove 'Z' if present for UTC time
            default:
                return true;
        }
    }
    
    function attendeeIsValid(attendeeValue) {
        return EMAIL_REGEX.test(attendeeValue) || PHONE_REGEX.test(attendeeValue);
    }
     
    
    
}

function validateKeyValue(key, value) {
    switch (key) {
        case 'status':
            return statusIsValid(value);
        case 'attendee':
            return attendeeIsValid(value);
        case 'dtstart':
            return dateCreator(value) !== false;  
        case 'dtstamp':
            return dateCreator(value) !== false;  
        default:
            return true;
    }
}

function statusIsValid(value) {
    return VALID_STATUSES.includes(value.toUpperCase());
}

function weightIsValid(value) {
    const number = parseInt(value, 10);
    return Number.isInteger(number) && number > 0;
}

function attendeeIsValid(value) {
    return EMAIL_REGEX.test(value) || PHONE_REGEX.test(value);
}

// function dateIsValid(value) {
//     return dateCreator(value) !== null;
// }

function sortRecords(records) {
    return records.filter(record => record.dtstart) 
        .sort((a, b) => new Date(a.dtstart) - new Date(b.dtstart));
}

async function writeSortedRecordsToFile(sortedRecords, fileName) {
    const fileContent = JSON.stringify(sortedRecords, null, 2); 
    await fs.promises.writeFile(fileName, fileContent, 'utf-8');
}

module.exports = {
    textProcessor
};
