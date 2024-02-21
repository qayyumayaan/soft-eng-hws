const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const contentType = req.headers['content-type'];
      
      // Check if Content-Type is supported
      if (['application/json', 'text/plain', 'application/xml'].includes(contentType)) {
        if (contentType === 'application/json') {
          try {
            JSON.parse(body); 
            // Attempt to parse JSON
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(body); 
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'text/plain' }); 
            res.end('Bad Request - Malformed Body');
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(body);
        }
      } else {
        // Respond with a 415 Unsupported Media Type status code
        res.writeHead(415, { 'Content-Type': 'text/plain' });
        res.end('Unsupported Content-Type');
      }
    });
  } else {
    // Respond with a 405 Method Not Allowed status code
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;
