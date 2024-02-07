const fs = require('fs');
const readline = require('readline');
const { dateCreator } = require('./dateFunctions'); 

const VALID_FILE_EXTENSION = '.txt';
const VALID_KEYS = ['weight', 'color', 'time', 'identifier', 'units'];
const VALID_COLORS = ["black", "white", "red", "orange", "yellow", "green", "blue", "indigo", "violet", "gray", "pink"];


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
            await writeSortedRecordsToFile(sortedRecords, 'records-new.txt');
        }
    } catch (err) {
        console.error("Error processing file:", err.message);
    }
}

async function fileIsValid(inputString) {
    if (!inputString.toLowerCase().endsWith(VALID_FILE_EXTENSION)) {
        console.error("Invalid file extension!");
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
        if (line.includes('BEGIN:RECORD')) {
            handleBeginRecord();
        } else if (line.includes('END:RECORD')) {
            handleEndRecord();
        } else if (recordStarted) {
            processLine(line);
        }
    }

    if (recordStarted) {
        errors.push('Last record not properly ended with END:RECORD');
    }

    if (errors.length > 0) {
        console.error('Errors! ' + errors);
    }

    return records;

    function handleBeginRecord() {
        if (recordStarted) {
            errors.push('Previous record not properly ended before new BEGIN:RECORD');
        }
        currentRecord = {};
        keysSet.clear();
        recordStarted = true;
    }

    function handleEndRecord() {
        if (!recordStarted) {
            errors.push('END:RECORD found without a corresponding BEGIN:RECORD');
        } else {
            console.log(`Processed Record: ${JSON.stringify(currentRecord, null, 2)}`);
            records.push({ ...currentRecord }); // Shallow copy to preserve record state
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
            if (keysSet.has(lowerKey)) {
                errors.push(`Duplicate key found in record: ${key}`);
                return;
            }
            if (!validateKeyValue(lowerKey, value)) {
                errors.push(`Invalid format for ${lowerKey}: ${value}`);
                if (lowerKey === 'time') {
                    currentRecord[lowerKey] = false;
                }
                return;
            }
    
            currentRecord[lowerKey] = (lowerKey === 'time') ? dateCreator(value) : value;
            keysSet.add(lowerKey);
        } else {
            errors.push(`Invalid key: ${key}`);
        }
    }
}

function validateKeyValue(key, value) {
    switch (key) {
        case 'color':
            return colorIsValid(value);
        case 'weight':
            return weightIsValid(value);
        case 'time':
            return dateCreator(value) !== false;  
        default:
            return true;
    }
}

function colorIsValid(value) {
    return VALID_COLORS.includes(value.toLowerCase());
}

function weightIsValid(value) {
    const number = parseInt(value, 10);
    return Number.isInteger(number) && number > 0;
}

function dateIsValid(value) {
    return dateCreator(value) !== null;
}

function sortRecords(records) {
    return records.filter(record => record.time) 
        .sort((a, b) => new Date(a.time) - new Date(b.time));
}

async function writeSortedRecordsToFile(sortedRecords, fileName) {
    const fileContent = JSON.stringify(sortedRecords, null, 2); 
    await fs.promises.writeFile(fileName, fileContent, 'utf-8');
}

module.exports = {
    textProcessor
};
