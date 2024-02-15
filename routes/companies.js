// Routes for companies

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT code, name 
            FROM companies
            ORDER BY name`
        );
        return res.json({ "companies": results.rows })
    } catch (e) {
        return next(e);
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;

        const results = await db.query(
            `SELECT c.code, c.name, c.description, i.id, i.comp_Code, i.amt, i.paid, i.paid_date
            FROM companies AS c
            LEFT JOIN invoices AS i
            ON c.code = i.comp_code
            WHERE c.code = $1`,
            [code]
        );

        const data = results.rows[0];

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404)
        }

        const company = {
            code: data.code,
            name: data.name,
            description: data.description,
            invoices: results.rows.map(row => ({
                id: row.id,
                comp_Code: row.comp_Code,
                amt: row.amt,
                paid: row.paid,
                paid_date: row.paid_date
            }))
        }

        return res.send({ "company": company });

    } catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(
            `INSERT INTO companies (code, name, description) 
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]
        );
        return res.status(201).json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(
            `UPDATE companies 
            SET name=$1, description=$2
            WHERE code=$3
            RETURNING code, name, description`,
            [name, description, code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404)
        }
        return res.status(200).json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        const results = await db.query(
            `DELETE FROM companies 
            WHERE code=$1
            RETURNING code`,
            [req.params.code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${req.params.code}`, 404)
        }
        return res.json({ status: `Deleted ${req.params.code}!` })
    } catch (e) {
        return next(e);
    }
});

module.exports = router;