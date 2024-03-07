const mysql = require("mysql2");
const http = require("http")

const dataBase = mysql.createConnection({
    host: "localhost",
    user: "root",
    database:"exampleDB",
    password: "password",
    multipleStatements: true
});


const initScript = `
  CREATE DATABASE IF NOT EXISTS exampleDB;
  USE exampleDB;

  DROP TABLE IF EXISTS Users;

  CREATE TABLE IF NOT EXISTS Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    ATTENDEE VARCHAR(255) NOT NULL,
    DTSTART VARCHAR(255) UNIQUE NOT NULL,
    METHOD VARCHAR(255) NOT NULL,
    STATUS VARCHAR(255) NOT NULL,
    RegistrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  INSERT INTO Users (ATTENDEE, DTSTART, METHOD, STATUS) VALUES
    ('Ayaan Qayyum', '20240707', 'REQUEST', 'TENTATIVE'),
    ('John Doe', '20240909', 'REQUEST', 'CONFIRMED'),
    ('Jane Doe', '20250101', 'REQUEST', 'TENTATIVE'),
    ('Josh Doe', '20260809', 'REQUEST', 'CONFIRMED');

  SELECT * FROM Users;
`;



const server = http.createServer((req, res) => {

    if (req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            // Check if Content-Type is supported
            if (req.headers['content-type'] === 'application/json') {
                // If JSON, attempt to parse it
                try{
                    const parsedBody = JSON.parse(body);

                    console.log(parsedBody);

                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(parsedBody));
                }
                catch (error){
                    res.statusCode = 400; // Bad Request
                    res.end('Invalid JSON Format');
                }
            }
            else {
                res.statusCode = 415; // Unsupported Media Type
                res.end('Supported Content-Types: application/json');
            }
        });
    }
    else {
        res.statusCode = 405; // Method Not Allowed
        res.end('Supported Methods: POST');
    }

});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
dataBase.query(initScript, function(error, results){
    if(error){throw error}
    //console.log(results[results.length - 1]);
});

const newRecord ={
    ATTENDEE: "Billy Bob",
    DTSTART: "20260108",
    METHOD: "REQUEST",
    STATUS: "CONFIRMED"
}

dataBase.query('insert into Users set ?', newRecord, function(error, results){
    if(error){throw error}
});

dataBase.query('select * from Users', function(error, results){
    if(error){throw error}
    //console.log(results);
});

// At the end of mysql.js
module.exports = { dataBase };
