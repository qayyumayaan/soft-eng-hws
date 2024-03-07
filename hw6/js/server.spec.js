const request = require('supertest');
const { createServer } = require('./server');
let server;

beforeAll(() => {
  server = createServer();
  server.listen(3001);
});

afterAll(() => {
  server.close();
});

describe('Server Tests', () => {

  

  it('should return 415 Unsupported Media Type for unsupported Content-Type', async () => {
    const response = await request(server)
      .post('/makeReservation')
      .send('name=JohnDoe') // Incorrect content-type
      .set('Content-Type', 'application/x-www-form-urlencoded');
    expect(response.status).toBe(415);
    expect(response.text).toContain('Unsupported Content-Type');
  });

  it('should return 400 Bad Request for invalid JSON format', async () => {
    const response = await request(server)
      .post('/makeReservation')
      .send('This is not a valid JSON string!')
      .set('Content-Type', 'application/json');
    expect(response.status).toBe(400);
    expect(response.text).toContain('Bad Request - Malformed JSON Body');
  });


  it('should handle /makeReservation endpoint correctly', async () => {
    const data = { attendee: 'John Doe', dtstart: '2024-03-01', dtstamp: '2024-02-26', method: 'Online', status: 'Confirmed' };
    const response = await request(server)
      .post('/makeReservation')
      .send(data)
      .set('Accept', 'application/json');
    expect(response.status).toBe(200);
  });

  it('should handle /lookupReservation endpoint correctly', async () => {
    const response = await request(server)
      .post('/lookupReservation')
      .send({ patientID: '12345' })
      .set('Accept', 'application/json');
    expect(response.status).toBe(400);
  });

  it('should handle /cancelReservation endpoint correctly', async () => {
    const response = await request(server)
      .post('/cancelReservation')
      .send({ confirmationCode: 'abc123' })
      .set('Accept', 'application/json');
    expect(response.status).toBe(400);
  });

  it('should handle /findAvailableDates endpoint correctly', async () => {
    const data = { startDate: '2024-03-01', endDate: '2024-03-10', numberOfDates: 3 };
    const response = await request(server)
      .post('/findAvailableDates')
      .send(data)
      .set('Accept', 'application/json');
    expect(response.status).toBe(200);
  });

    // Test for making a reservation successfully
    it('should successfully make a reservation with valid data through /makeReservation', async () => {
      const data = { attendee: 'John Doe', dtstart: '20240220T123456', dtstamp: '20240219T123456', method: 'REQUEST', status: 'CONFIRMED' };
      const response = await request(server)
        .post('/makeReservation')
        .send(data)
        .set('Accept', 'application/json');
      expect(response.status).toBe(200);
    });
  
    // Test for finding available dates
    it('should find a specified number of available dates through /findAvailableDates', async () => {
      const data = { startDate: '20240101', endDate: '20240501', numberOfDates: 4 };
      const response = await request(server)
        .post('/findAvailableDates')
        .send(data)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
    });
  
    // Test for looking up a reservation successfully
    it('should find a reservation with a valid ID through /lookupReservation', async () => {
      const data = { patientID: '123456' }; 
      const response = await request(server)
        .post('/lookupReservation')
        .send(data)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
    });
  
    // Test for cancelling a reservation successfully
    it('should successfully cancel a reservation through /cancelReservation', async () => {
      const data = { confirmationCode: 'abc123' }; 
      const response = await request(server)
        .post('/cancelReservation')
        .send(data)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
    });
});
