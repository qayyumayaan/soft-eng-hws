const data = '{ malformed }'; // Replace with your data
const contentType = 'application/json'; // Replace with desired content type

fetch('http://localhost:3000', {
  method: 'POST',
  headers: {
    'Content-Type': contentType
  },
  body: data
})
.then(response => response.text())
.then(result => {
  console.log('Response from server:', result);
})
.catch(error => {
  console.error('Error:', error);
});
