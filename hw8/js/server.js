const http = require('http');

const {
  handleMakeReservation,
  handleLookupReservation,
  handleCancelReservation,
  handleFindAvailableDates,
} = require('./index');

// Encapsulate server creation within createServer function
function createServer() {
  const server = http.createServer((req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const contentType = req.headers['content-type'];
      if (!['application/json', 'text/plain', 'application/xml'].includes(contentType)) {
        res.writeHead(415, { 'Content-Type': 'text/plain' });
        res.end('Unsupported Content-Type');
        return;
      }

      if (contentType !== 'application/json') {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(body);
        return;
      }

      try {
        const data = JSON.parse(body);
        processRequest(req, res, data);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request - Malformed JSON Body');
      }
    });
  });

  return server; // Return the created server
}

function processRequest(req, res, data) {
  let response;
  switch (req.url) {
    case '/makeReservation':
      response = handleMakeReservation(data);
      break;
    case '/lookupReservation':
      response = handleLookupReservation(data.patientID);
      break;
    case '/cancelReservation':
      response = handleCancelReservation(data.confirmationCode);
      break;
    case '/findAvailableDates':
      response = handleFindAvailableDates(data);
      break;
    default:
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response));
}

// Modify the main module check to start the server only when this file is run directly
if (require.main === module) {
  const server = createServer(); // Use the createServer function to create the server
  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the createServer function for use in tests or other modules
module.exports = { createServer };
