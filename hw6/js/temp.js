const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
//   database: 'your_database_name'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

// Perform database operations here

connection.end((err) => {
  if (err) {
    console.error('Error ending connection to MySQL: ' + err.stack);
    return;
  }
  console.log('Connection to MySQL ended');
});
