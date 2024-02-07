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
        // Store the original console functions
        originalConsoleLog = console.log;
        originalConsoleError = console.error;

        // Mock the console functions
        console.log = mockConsole(consoleOutput);
        console.error = mockConsole(consoleErrorOutput);
    });

    afterEach(() => {
        // Restore the original console functions
        console.log = originalConsoleLog;
        console.error = originalConsoleError;

        // Reset the output arrays
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
        const filePath = './tests/duplicate_key.txt';
      
        // Update the expectedLogs and expectedErrors
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
        const filePath = './tests/empty_file.txt';
        const expectedLogs = [];
        const expectedErrors = [];
    
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
    });

 
    it('should report an invalid color error', async () => {
        const filePath = './tests/invalid_color.txt';
        const expectedLogs = [
          'Processed Record: {\n' +
          '  "weight": "10",\n' +
          '  "time": "January 29, 2022 at 12:34 PM",\n' +
          '  "identifier": "ID123",\n' +
          '  "units": "kg"\n' +
          '}'
        ];
        const expectedErrors = ['Errors! Invalid format for color: orangatan']; 
        
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
    });
    
    it('should report an invalid extension error', async () => {
        const filePath = './tests/invalid_extension.jpg';
        const expectedLogs = [];
        const expectedErrors = [
            'Invalid file extension!', 'File validation failed!'
        ];
    
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
    });
    
    
    it('should report an invalid key error', async () => {
        const filePath = './tests/invalid_key.txt';
        const expectedLogs = ['Processed Record: {\n  "color": "red",\n  "time": "January 29, 2022 at 12:34 PM",\n  "identifier": "ID123",\n  "units": "kg"\n}'];
        const expectedErrors = [ 'Errors! Invalid key: height,Invalid key: size']; // Assuming 'height' and 'size' are not valid keys

        await testFileProcessing(filePath, expectedLogs, expectedErrors);
    });


    it('should report an invalid line format error', async () => {
        const filePath = './tests/invalid_line_format.txt';
        const expectedLogs = [
            'Processed Record: {\n' +
            '  "color": "red",\n' +
            '  "time": "January 29, 2022 at 12:34 PM",\n' +
            '  "identifier": "ID123",\n' +
            '  "units": "kg"\n' +
            '}'
        ];
        const expectedErrors = ['Errors! Invalid line format: weight-10']; // Assuming the line format is incorrect
    
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
    });

    it('should report an invalid time format error', async () => {
        const filePath = './tests/invalid_time.txt';
        const expectedLogs = [
            'Processed Record: {\n' +
            '  "weight": "10",\n' +
            '  "color": "red",\n' +
            '  "time": false,\n' +
            '  "identifier": "ID123",\n' +
            '  "units": "kg"\n' +
            '}'
        ];
        const expectedErrors = ['Errors! Invalid format for time: 29-01-2022']; // Assuming the time format is incorrect
    
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
    });

    it('should report an invalid weight format error', async () => {
        const filePath = './tests/invalid_weight.txt';
        const expectedLogs = [
            'Processed Record: {\n' +
            '  "color": "red",\n' +
            '  "time": "January 29, 2022 at 12:34 PM",\n' +
            '  "identifier": "ID123",\n' +
            '  "units": "kg"\n' +
            '}'
        ];
        const expectedErrors = [ 'Errors! Invalid format for weight: -10']; // Assuming the weight is negative
    
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
    });

    it('should report a missing END:RECORD error', async () => {
        const filePath = './tests/missing_end_record.txt';
        const expectedLogs = [];
        const expectedErrors = ['Errors! Last record not properly ended with END:RECORD'];
    
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
    });

    it('should handle unsorted records and sort them', async () => {
        const filePath = './tests/unsorted_records.txt';
        const expectedLogs = [
            'Processed Record: {\n' +
            '  "weight": "15",\n' +
            '  "color": "blue",\n' +
            '  "time": "January 29, 2022 at 12:34 PM",\n' +
            '  "identifier": "ID124",\n' +
            '  "units": "kg"\n' +
            '}',
          'Processed Record: {\n' +
            '  "weight": "10",\n' +
            '  "color": "red",\n' +
            '  "time": "January 29, 2022 at 12:34 PM",\n' +
            '  "identifier": "ID123",\n' +
            '  "units": "kg"\n' +
            '}'
        ];
        const expectedErrors = [];
    
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
    });

    it('should process a valid file correctly', async () => {
        const filePath = './tests/valid_file.txt';
        const expectedLogs = [
            'Processed Record: {\n' +
            '  "weight": "10",\n' +
            '  "color": "red",\n' +
            '  "time": "January 29, 2022 at 12:30 PM",\n' +
            '  "identifier": "ID123",\n' +
            '  "units": "kg"\n' +
            '}',
          'Processed Record: {\n' +
            '  "weight": "15",\n' +
            '  "color": "blue",\n' +
            '  "time": "January 29, 2022 at 12:00 PM",\n' +
            '  "identifier": "ID124",\n' +
            '  "units": "kg"\n' +
            '}'
        ];
        const expectedErrors = [];
    
        await testFileProcessing(filePath, expectedLogs, expectedErrors);
    });
});
