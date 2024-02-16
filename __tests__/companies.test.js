/** Tests for companies routes. */

process.env.NODE_ENV = 'test';
const request = require('supertest');

const app = require('../app');
const { createData } = require("../_test_helper")
const db = require('../db');
const Test = require('supertest/lib/test');

// before each test, cleans data and populates tables in test db
beforeEach(createData);

afterAll(async () => {
    await db.end()
});

describe("GET /", () => {
    test("Get a list of companies", async () => {
        const res = await request(app).get('/companies')
        expect(res.statusCode).toBe(200);
        expect(res.body.companies).toContainEqual({ code: 'apple', name: 'Apple'});
        expect(res.body.companies).toContainEqual({ code: 'ibm', name: 'IBM'});
    })
});

describe("GET /ibm", () => {
    test("Get ibm company info", async () => {
        const res = await request(app).get('/companies/ibm')
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
            {
                company: {
                    code: 'ibm',
                    description: 'Big blue.',
                    invoices: [{
                        amt: 300, 
                        id: 3,
                        paid: false,
                        paid_date: null
                    }],
                    name: 'IBM'
                }
            })
    })
    test("Return 404 if company code not found", async () => {
        const res = await request(app).get('/companies/not_found')
        expect(res.statusCode).toBe(404);
    })
    
})  

describe("POST /", () => {
    test("Post new company info", async () => {
        const res = await request(app).post('/companies').send({name: 'Facebook', description: 'Part of Meta.' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(
            {
                company: {
                    code: 'facebook',
                    name: 'Facebook',
                    description: 'Part of Meta.'
                }
            })
    })
    test("Return 500 if post unsuccessful", async () => {
        const res = await request(app).post('/companies').send({ name: 'Apple', description: 'Not part of Meta.' });
        expect(res.statusCode).toBe(500);
    })
    })

describe("PUT /", () => {
    test("Update company info", async () => {
        const res = await request(app).put('/companies/apple').send({ name: "Updated Name", description: "Updated Description" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
            {
                "company": {
                    code: "apple",
                    name: "Updated Name",
                    description: "Updated Description"
                }

            }
        )
    })
    test("Return 404 if company code not found", async () => {
        const res = await request(app).put('/companies/not_found')
        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /", () => {
    test("Delete selected company from table", async () => {
        const res = await request(app).delete('/companies/apple')
        expect(res.body).toEqual({ status: 'Deleted apple!' });
    })
    test("Return 404 if company code not found", async () => {
        const res = await request(app).delete('/companies/not_found')
        expect(res.statusCode).toBe(404);
    })
})