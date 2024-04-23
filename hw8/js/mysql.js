const mysql = require('mysql2/promise'); // Use promise version of mysql2

// Modify existing functions to use async/await or then/catch consistently.

// Script to create and use the database
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
`;

async function run() {
    const dataBase = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        database: "exampleDB",
        multipleStatements: true
    });

    try {
        // Execute the initialization script
        await dataBase.query(initScript);
        console.log("Database and table initialized");

        const newRecord = {
            ATTENDEE: "Billy Bob",
            DTSTART: "20260108",
            METHOD: "REQUEST",
            STATUS: "CONFIRMED"
        };

        await dataBase.query('INSERT INTO Users SET ?', newRecord);
        console.log("New record inserted");

        const [rows] = await dataBase.query('SELECT * FROM Users');
        console.log("Fetched records:", rows);
    } catch (error) {
        console.error("Failed to perform database operations:", error);
    } finally {
        // Close the connection when all queries are done
        await dataBase.end();
    }
}

run();
