// server.spec.js
const request = require('supertest');
const server = require('./server');

describe('Server Tests', () => {
  afterAll(() => {
    server.close();
  });

  it('should handle POST request with supported Content-Type (application/json)', async () => {
    const data = { message: 'Test data' };
    const response = await request(server)
      .post('/')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(data));
    expect(response.status).toBe(200);
    expect(response.body).toEqual(data);
    expect(response.headers['content-type']).toMatch('application/json');
  });

  it('should handle POST request with unsupported Content-Type', async () => {
    const response = await request(server)
      .post('/')
      .set('Content-Type', 'text/csv')
      .send('Test data');
    expect(response.status).toBe(415);
    expect(response.text).toBe('Unsupported Content-Type');
    expect(response.headers['content-type']).toMatch('text/plain');
  });

  it('should handle POST request with supported Content-Type (application/json) and malformed body', async () => {
    const response = await request(server)
      .post('/')
      .set('Content-Type', 'application/json')
      .send('{ malformed }');
    expect(response.status).toBe(400);
    expect(response.text).toBe('Bad Request - Malformed Body');
    expect(response.headers['content-type']).toMatch('text/plain');
  });

  it('should handle non-POST request', async () => {
    const response = await request(server).get('/');
    expect(response.status).toBe(405);
    expect(response.text).toBe('Method Not Allowed');
    expect(response.headers['content-type']).toMatch('text/plain');
  });

  it('should handle POST request with supported Content-Type (text/plain)', async () => {
    const data = 'Test data';
    const response = await request(server)
      .post('/')
      .set('Content-Type', 'text/plain')
      .send(data);
    expect(response.status).toBe(200);
    expect(response.text).toBe(data);
    expect(response.headers['content-type']).toMatch('text/plain');
  });

  it('should handle POST request with supported Content-Type (application/xml)', async () => {
    const data = '<message>Test data</message>';
    const response = await request(server)
      .post('/')
      .set('Content-Type', 'application/xml')
      .send(data);
    expect(response.status).toBe(200);
    expect(response.text).toBe(data);
    expect(response.headers['content-type']).toMatch('application/xml');
  });
  
  it('should handle GET request to a specific endpoint', async () => {
    const response = await request(server).get('/test');
    expect(response.status).toBe(405); 
    expect(response.text).toBe('Method Not Allowed'); 
    expect(response.headers['content-type']).toMatch('text/plain');
  });
  
});
