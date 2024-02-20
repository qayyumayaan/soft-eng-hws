const fs = require('fs');
const { FindAvailableDates, MakeReservation, LookupReservations, CancelReservation, readCalendar, initiateMasterSchedule, dateIsValid, methodIsValid, sortSchedule } = require('./processor.js');

describe("Calendar System Tests", () => {
    describe("Initialization", () => {
        it("should create a new file if it does not exist", () => {
            spyOn(fs, 'existsSync').and.returnValue(false);
            spyOn(fs, 'writeFileSync');
            initiateMasterSchedule();
            expect(fs.writeFileSync).toHaveBeenCalledWith('master_schedule.txt', '', 'utf-8');
        });
    });

    describe("Read Calendar", () => {
        it("should read from an existing file", () => {
            spyOn(fs, 'existsSync').and.returnValue(true);
            spyOn(fs, 'readFileSync').and.returnValue('Test data');
            const result = readCalendar();
            expect(result).toBe('Test data');
        });
    });

    describe("Sort Schedule", () => {
        it("should handle an empty calendar file", () => {
            const result = sortSchedule('');
            expect(result).toBe('');
        });
    });

    describe("Make Reservation", () => {
        it("should successfully make a reservation with valid data", () => {
            spyOn(fs, 'appendFileSync');
            const result = MakeReservation('John Doe', '20240220T123456', '20240219T123456', 'REQUEST', 'CONFIRMED');
            expect(result).toBeTrue();
            expect(fs.appendFileSync).toHaveBeenCalled();
        });
    });

    describe("Reservation with Invalid Date", () => {
        it("should reject reservation with invalid date format", () => {
            const result = MakeReservation('John Doe', '2024-02-20', '2024-02-19T12:34:56', 'REQUEST', 'CONFIRMED');
            expect(result).toBeFalse();
        });
    });

    describe("Reservation with Invalid Method", () => {
        it("should reject reservation with invalid method", () => {
            const result = MakeReservation('John Doe', '20240220T123456', '20240219T123456', 'INVALID_METHOD', 'CONFIRMED');
            expect(result).toBeFalse();
        });
    });

    describe("Lookup Reservations", () => {
        it("should find a reservation with a valid patient ID", () => {
            spyOn(fs, 'readFileSync').and.returnValue('123456,confirmationCode,John Doe,20240220,20240219T123456,REQUEST,CONFIRMED');
            const consoleSpy = spyOn(console, 'log');
            LookupReservations('123456');
            expect(consoleSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Reservation found/));
        });
    });

    describe("Lookup Invalid Reservation", () => {
        it("should not find a reservation with an invalid patient ID", () => {
            spyOn(fs, 'readFileSync').and.returnValue('');
            const consoleSpy = spyOn(console, 'log');
            LookupReservations('invalidID');
            expect(consoleSpy).toHaveBeenCalledWith('No reservation found with the provided confirmation code.');
        });
    });

    describe("Cancel Reservation", () => {
        it("should successfully cancel a reservation", () => {
            spyOn(fs, 'readFileSync').and.returnValue('confirmationCode,otherData');
            spyOn(fs, 'writeFileSync');
            CancelReservation('confirmationCode');
        });
    });

    describe("Cancel Invalid Reservation", () => { 
        it("should not cancel a reservation with an invalid confirmation code", () => {
            spyOn(fs, 'readFileSync').and.returnValue('');
            const consoleSpy = spyOn(console, 'log');
            CancelReservation('invalidCode');
            expect(consoleSpy).toHaveBeenCalledWith('No reservations found.');
        });
    });

    describe("Date Validation", () => {
        it("should validate a correct date format", () => {
            const isValid = dateIsValid('20240220T123456');
            expect(isValid).toBeTrue();
        });
    });

    describe("Find Available Dates", () => {
        it("should find a specified number of available dates", () => {
            const availableDates = FindAvailableDates(4);
            expect(availableDates).toEqual(['20240219', '20240220', '20240221', '20240222'])
        });
    });    

    describe("Method Validation", () => {
        it("should recognize a valid method", () => {
            const isValid = methodIsValid('REQUEST');
            expect(isValid).toBeTrue();
        });
    });

    describe("Standard Flow Without Errors", () => {
        it("should handle a standard flow of operations without any errors", () => {
            spyOn(fs, 'existsSync').and.returnValue(true);
            spyOn(fs, 'readFileSync').and.returnValue('');
            spyOn(fs, 'writeFileSync');
            spyOn(fs, 'appendFileSync');

            initiateMasterSchedule();
            const reservationResult = MakeReservation('Jane Doe', '20240220T123456', '20240220T123456', 'REQUEST', 'CONFIRMED');
            const lookupResult = LookupReservations('someValidID');
            CancelReservation('someValidConfirmationCode');

            expect(reservationResult).toBeTrue();
            expect(lookupResult).toBeUndefined();
        });
    });
});
