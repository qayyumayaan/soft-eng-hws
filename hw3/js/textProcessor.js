const fs = require('fs');
const readline = require('readline');
const { dateCreator } = require('./dateFunctions'); 

const VALID_FILE_EXTENSION = ['.ical', '.ics', '.icalendar', '.ifb'];
const VALID_KEYS = ['status', 'dtstart', 'dtstamp', 'identifier', 'method', 'attendee', 'prodid', 'version', 'summary', 'uid', 'created', 'dtend', 'duration', 'last-modified', 'name', 'organizer'];
const VALID_STATUSES = ['TENTATIVE', 'CONFIRMED', 'CANCELLED'];

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const PHONE_REGEX = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;



async function textProcessor(inputString) {
    if (!await fileIsValid(inputString)) {
        console.error("File validation failed!");
        return false;
    }

    try {
        const text = await fs.promises.readFile(inputString, 'utf-8');
        const records = await processTextFile(inputString);
        if (records.length > 0) {
            const sortedRecords = sortRecords(records);
            await writeSortedRecordsToFile(sortedRecords, 'calendar-new.ical');
        }
    } catch (err) {
        console.error("Error processing file:", err.message);
        return false;
    }
}

async function fileIsValid(inputString) {
    if (!VALID_FILE_EXTENSION.some(ext => inputString.toLowerCase().endsWith(ext))) {
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
    let eventStarted = false; 
    let errors = [];
    let keysSet = new Set();
    let records = []; 

    for await (const line of rl) {
        if (line.includes('BEGIN:VCALENDAR')) {
            handleBeginRecord();
        } else if (line.includes('END:VCALENDAR')) {
            handleEndRecord();
        } else if (line.includes('BEGIN:VEVENT')) {
            if (eventStarted) {
                errors.push('Nested BEGIN:VEVENT found');
            }
            eventStarted = true;
        } else if (line.includes('END:VEVENT')) {
            if (!eventStarted) {
                errors.push('END:VEVENT found without a corresponding BEGIN:VEVENT');
            } else {
                eventStarted = false;
            }
        } else if (recordStarted) {
            processLine(line);
        }
    }

    if (recordStarted) {
        errors.push('Last record not properly ended with END:VCALENDAR');
    }

    if (eventStarted) {
        errors.push('Last event not properly ended with END:VEVENT');
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
        let [key, ...valueParts] = line.split(':');
        key = key.trim();
        let value = valueParts.join(':').trim();
    
        if (key.includes(';')) {
            [key] = key.split(';'); 
        }
    
        if (!key || value === undefined) {
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
            } else if (lowerKey === 'dtstart' || lowerKey === 'dtstamp' || lowerKey === 'last-modified') {
                currentRecord[lowerKey] = dateCreator(value);
            } else if (lowerKey === 'attendee') {
                if (!currentRecord['attendees']) {
                    currentRecord['attendees'] = [];
                }
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
            case 'dtstart':
                if (!value || dateCreator(value.replace('Z', '')) === false) {
                    errors.push(`Invalid or missing dtstart value: ${value}`);
                }
                return true;
            case 'status':
                return statusIsValid(value);
            case 'attendee':
                return attendeeIsValid(value.split(':')[1]);
            case 'dtend':
            case 'dtstamp':
            case 'last-modified': 
                return dateCreator(value.replace('Z', '')) !== false; 
            default:
                return true;
        }
    }
    

    
}


function statusIsValid(value) {
    return VALID_STATUSES.includes(value.toUpperCase());
}

function attendeeIsValid(value) {
    return EMAIL_REGEX.test(value) || PHONE_REGEX.test(value);
}


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
