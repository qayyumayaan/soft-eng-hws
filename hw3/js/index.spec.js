const fs = require('fs');
const { textProcessor } = require('./textProcessor');

describe('textProcessor Tests', () => {
    let originalConsoleError, originalConsoleLog;
    let consoleOutput = [];
    let consoleErrorOutput = [];

    const mockConsole = (outputArray) => (message) => {
        console.debug("Captured:", message); // Debugging statement
        outputArray.push(message);
    };

    beforeEach(() => {
        originalConsoleLog = console.log;
        originalConsoleError = console.error;

        console.log = mockConsole(consoleOutput);
        console.error = mockConsole(consoleErrorOutput);
    });

    afterEach(() => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;

        consoleOutput = [];
        consoleErrorOutput = [];
    });

    async function testFileProcessing(filePath, expectedLogs, expectedErrors) {
        await textProcessor(filePath);

        // Debugging output
        console.debug("Console Output:", consoleOutput);
        console.debug("Console Error Output:", consoleErrorOutput);

        expect(consoleOutput).toEqual(expectedLogs);
        expect(consoleErrorOutput).toEqual(expectedErrors);
    }
 
    it('should report a duplicate key error', async () => {
        const filePath = './tests/duplicate_key.ical';
      
        const expectedLogs = [
          'Processed Record: {\n' +
          '  "weight": "10",\n' +
          '  "color": "red",\n' +
          '  "time": "January 29, 2022 at 12:34 PM",\n' +
          '  "identifier": "ID123",\n' +
          '  "units": "kg"\n' +
          '}'
        ];
      
        const expectedErrors = [
            'Errors! Duplicate key found in record: weight'
        ];
      
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
      });
      
      

    it('should handle an empty file correctly', async () => {
        const filePath = './tests/empty_file.ical';
        const expectedLogs = [];
        const expectedErrors = [];
    
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
    });

 
    it('should report an invalid status error', async () => {
        const filePath = './tests/invalid_status.ical';
        const expectedLogs = [
            'Processed Record: {\n' +
            '  "version": "2.0",\n' +
            '  "isSchedulingRequest": true,\n' + 
            '  "uid": "test-event-1234@example.com",\n' +
            '  "dtstamp": "February 10, 2024 at 5:46 PM",\n' +
            '  "dtstart": "February 9, 2024 at 5:46 PM",\n' +
            '  "status": "CONFIRMED",\n' +
            '  "summary": "Test Event",\n' +
            '  "attendees": [\n' + 
            '    "mailto:test@example.com"\n' +
            '  ]\n' +
            '}'
        ];
      
        const expectedErrors = [
            'Errors! Duplicate key found in record: DTSTAMP'
        ];
      
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
      });
      
      

    // it('should report an invalid weight format error', async () => {
    //     const filePath = './tests/invalid_weight.txt';
    //     const expectedLogs = [
    //         'Processed Record: {\n' +
    //         '  "color": "red",\n' +
    //         '  "time": "January 29, 2022 at 12:34 PM",\n' +
    //         '  "identifier": "ID123",\n' +
    //         '  "units": "kg"\n' +
    //         '}'
    //     ];
    //     const expectedErrors = [ 'Errors! Invalid format for weight: -10']; 
    
    //     await testFileProcessing(filePath, expectedLogs, expectedErrors);
    // });

    it('should report a missing END:RECORD error', async () => {
        const filePath = './tests/missing_end_vcalendar.ical';
        const expectedLogs = [];
        const expectedErrors = ['Errors! Last record not properly ended with END:RECORD'];
    
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
    });

    // it('should handle unsorted records and sort them', async () => {
    //     const filePath = './tests/unsorted_records.txt';
    //     const expectedLogs = [
    //         'Processed Record: {\n' +
    //         '  "weight": "15",\n' +
    //         '  "color": "blue",\n' +
    //         '  "time": "January 29, 2022 at 12:34 PM",\n' +
    //         '  "identifier": "ID124",\n' +
    //         '  "units": "kg"\n' +
    //         '}',
    //       'Processed Record: {\n' +
    //         '  "weight": "10",\n' +
    //         '  "color": "red",\n' +
    //         '  "time": "January 29, 2022 at 12:34 PM",\n' +
    //         '  "identifier": "ID123",\n' +
    //         '  "units": "kg"\n' +
    //         '}'
    //     ];
    //     const expectedErrors = [];
    
    //     await testFileProcessing(filePath, expectedLogs, expectedErrors);
    // });

    it('should process a valid file correctly', async () => {
        const filePath = './tests/valid_file.ical';
        const expectedLogs = [
            'Processed Record: {\n' +
            '  "version": "2.0",\n' +
            '  "isSchedulingRequest": true,\n' + 
            '  "uid": "test-event-1234@example.com",\n' +
            '  "dtstamp": "February 10, 2024 at 5:46 PM",\n' +
            '  "dtstart": "February 9, 2024 at 5:46 PM",\n' +
            '  "status": "CONFIRMED",\n' +
            '  "summary": "Test Event",\n' +
            '  "attendees": [\n' + 
            '    "mailto:test@example.com"\n' +
            '  ]\n' +
            '}'
        ];
        const expectedErrors = [];
        
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
    });
});
