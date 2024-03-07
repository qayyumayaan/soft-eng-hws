const prompt = require("prompt-sync")();
const { MakeReservation, LookupReservations, CancelReservation, FindAvailableDates } = require('./processor');
const readline = require('readline');

function runtime() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  askQuestion(rl);
}

function askQuestion(rl) {
  rl.question('What would you like to do?\n1. Make a reservation\n2. Lookup a reservation (patientID)\n3. Cancel a reservation (confirmationCode)\n4. Find the next few available dates\nEnter option number or QUIT to exit: \n', (option) => {
    if (option === '1') {
      makeReservation(rl);
    } else if (option === '2') {
      lookupReservation(rl);
    } else if (option === '3') {
      cancelReservation(rl);
    } else if (option === '4') {
      findAvailableDates(rl);
    } else if (option.toUpperCase() === 'QUIT') {
      rl.close();
    } else {
      console.log('Invalid option. Please select a valid option.');
      askQuestion(rl);
    }
  });
}

function makeReservation(rl) {
  rl.question('ATTENDEE: ', (attendee) => {
    rl.question('DTSTART: ', (dtstart) => {
      rl.question('DTSTAMP: ', (dtstamp) => {
        rl.question('METHOD: ', (method) => {
          rl.question('STATUS: ', (status) => {
            MakeReservation(attendee, dtstart, dtstamp, method, status);
            askQuestion(rl);
          });
        });
      });
    });
  });
}

function lookupReservation(rl) {
  rl.question('Please provide your patientID: ', (patientID) => {
    LookupReservations(patientID)
    askQuestion(rl);
  });
}

function cancelReservation(rl) {
  rl.question('Please provide your confirmation code: ', (confirmationCode) => {
    CancelReservation(confirmationCode)
    askQuestion(rl);
  });
}

function findAvailableDates(rl) {
  rl.question('Start date (YYYYMMDD): ', (startDate) => {
    rl.question('End date (YYYYMMDD): ', (endDate) => {
      rl.question('How many available dates do you want to see? (1 <= N <= 4): ', (numberOfDates) => {
        FindAvailableDates(startDate, endDate, numberOfDates)
        askQuestion(rl);
      });
    });
  });
}


runtime()
