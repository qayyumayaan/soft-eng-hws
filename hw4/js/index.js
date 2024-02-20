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
    // console.log(`Reservation with confirmation code ${confirmationCode} cancelled successfully.`);
    askQuestion(rl);
  });
}

function findAvailableDates(rl) {
  // Find available dates logic here

  console.log('Next few available dates:');
  // Display available dates
  askQuestion(rl);
}



function testRuntime() {
  
  // const files = [
  //   './tests/duplicate_key.txt', 
  //   './tests/empty_file.txt',
  //   './tests/invalid_color.txt',
  //   './tests/invalid_extension.jpg',
  //   './tests/invalid_key.txt',
  //   './tests/invalid_line_format.txt',
  //   './tests/invalid_time.txt',
  //   './tests/invalid_weight.txt',
  //   './tests/missing_end_record.txt',
  //   './tests/unsorted_records.txt',
  //   './tests/valid_file.txt'
  // ]

  
  // const filePath =     './calendar.ical'
  const filePath =     './tests/optional_tests.ical'


  const output = main(filePath);
  console.log(output)

}

// testRuntime()
runtime()
