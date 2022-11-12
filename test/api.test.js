/* eslint-disable no-undef */
import { app, server } from '../src/index.js';
import { default as request } from 'supertest';

describe('Server', () => {
    beforeAll(async () => {
    });
    afterAll(() => {
        server.close();
    });
    test("It should response the GET /api/hello method", done => {
        request(app)
            .get("/api/contract_address")
            .then(response => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});