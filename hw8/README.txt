Ayaan Qayyum
Monday, February 26th, 2024

To run the server, please type "node js/server.js". 

To send server requests, please open a new terminal window and edit index.js. 

To run the jasmine tests, please run (in the root folder): 
npx jasmine js/server.spec.js

If SQL gives you any trouble, run the jasmine tests again and it will disappear. 
Please do not pay the error any mind, as no functionality is compromised, especially as it is a temporary item. 
To run jasmine tests, please run:
npm test
If that does not work, please run:
npx jasmine
If that does not work, please run: 

jasmine js/server.spec.js 


Please review console-log.txt for the Jasmine test cases console output. 

mysql.js is the init file. I would not recommend running that because it has no functionality. 

Run server.js as the server. Then, in another terminal window, run mysql.js. Edit mysql.js accordingly to have it send commands to the database. 

If mysql and accessing the server does not work, it is usually because of the MySQL instance. 