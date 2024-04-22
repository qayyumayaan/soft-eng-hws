const http = require('http');

function makeRequest(path, data) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', chunk => {
      console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
      console.log('No more data in response.');
    });
  });

  req.on('error', e => {
    console.error(`problem with request: ${e.message}`);
  });

  req.write(JSON.stringify(data));
  req.end();
}

makeRequest('/makeReservation', { attendee: 'John Doe', dtstart: '2024-03-01', dtstamp: '2024-02-26', method: 'Online', status: 'Confirmed' });
makeRequest('/lookupReservation', { patientID: '12345' });
makeRequest('/cancelReservation', { confirmationCode: 'abc123' });
makeRequest('/findAvailableDates', { startDate: '2024-03-01', endDate: '2024-03-10', numberOfDates: 3 });

