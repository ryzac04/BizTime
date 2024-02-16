/** Tests for invoices routes. */

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
    test("Get an array of invoices", async () => {
        const res = await request(app).get('/invoices')
        expect(res.statusCode).toBe(200);
        expect(res.body.invoices).toContainEqual({ id: 1, comp_code: 'apple'});
        expect(res.body.invoices).toContainEqual({ id: 3, comp_code: 'ibm'});
    })
});

describe("GET /3", () => {
    test("Get IBM invoice info", async () => {
        const res = await request(app).get('/invoices/3')
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
            {
                'invoice': {
                    id: 3,
                    amt: 300,
                    paid: false,
                    add_date: '2018-03-01T06:00:00.000Z',
                    paid_date: null,
                    company: {
                        code: 'ibm', 
                        name: 'IBM',
                        description: 'Big blue.'
                    }
                }
            })
    })
    test("Return 404 if invoice id not found", async () => {
        const res = await request(app).get('/invoices/999')
        expect(res.statusCode).toBe(404);
    })
})  

describe("POST /", () => {
    test("Post new invoice", async () => {
        const res = await request(app).post('/invoices').send({ amt: 400, comp_code: 'ibm'});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(
            {
                "invoice": {
                    id: 4,
                    comp_code: "ibm",
                    amt: 400,
                    add_date: expect.any(String),
                    paid: false,
                    paid_date: null,
                }
            })
    })
    test("Return 400 if post unsuccessful", async () => {
        const res = await request(app).post('/invoices').send({ amt: '', comp_code: 'Facebook'});
        expect(res.statusCode).toBe(500);
    })
    })

describe("PUT /", () => {
    test("Update invoice info", async () => {
        const res = await request(app).put('/invoices/1').send({ amt: 650, paid: false });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
            {
                "invoice": {
                    id: 1,
                    comp_code: "apple",
                    amt: 650,
                    add_date: expect.any(String),
                    paid: false,
                    paid_date: null,
                }
            }
        )
    })
    test("Return 404 if invoice not found", async () => {
        const res = await request(app).put('/invoices/999')
        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /", () => {
    test("Delete selected invoice from table", async () => {
        const res = await request(app).delete('/invoices/1')
        expect(res.body).toEqual({ status: 'Deleted invoice with id of 1!' });
    })
    test("Return 404 if invoice not found", async () => {
        const res = await request(app).delete('/invoices/999')
        expect(res.statusCode).toBe(404);
    })
})
