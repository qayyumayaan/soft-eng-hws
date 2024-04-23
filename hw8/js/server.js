const http = require('http');

const {
  handleMakeReservation,
  handleLookupReservation,
  handleCancelReservation,
  handleFindAvailableDates,
} = require('./index');

// Function to process each incoming request
const processRequest = (handlers) => (req, res) => {
  const { method, url } = req;
  const handler = handlers.find((h) => h.method === method && h.url === url);

  if (!handler) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
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
      const response = handler.action(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request - Malformed JSON Body');
    }
  });
};

// Handlers for different endpoints
const handlers = [
  {
    method: 'POST',
    url: '/makeReservation',
    action: handleMakeReservation,
  },
  {
    method: 'POST',
    url: '/lookupReservation',
    action: (data) => handleLookupReservation(data.patientID),
  },
  {
    method: 'POST',
    url: '/cancelReservation',
    action: (data) => handleCancelReservation(data.confirmationCode),
  },
  {
    method: 'POST',
    url: '/findAvailableDates',
    action: handleFindAvailableDates,
  },
];

// Create HTTP server
const createServer = () => {
  return http.createServer(processRequest(handlers));
};

// Start the server only when this file is run directly
if (require.main === module) {
  const server = createServer();
  const PORT = 3008;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the createServer function for use in tests or other modules
module.exports = { createServer };
