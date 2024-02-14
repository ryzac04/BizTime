// Routes for companies

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({companies: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;

        const cResults = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        const iResults = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code]);

        if (cResults.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404)
        }

        const company = cResults.rows[0];
        const invoices = iResults.rows;
        company.invoices = invoices.map(inv => inv.id);

        return res.send({ "company": company });
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
})

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404)
        }
        return res.status(200).json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const results = await db.query(`DELETE FROM companies WHERE code=$1 RETURNIN code`, [req.params.code]);
        if (results.rows.length == 0) {
            throw new ExpressError(`Can't find company with code of ${req.params.code}`, 404)
        }
        return res.json({status: `Deleted ${req.params.code}!`})
    } catch (e) {
        return next(e);
    }
})

module.exports = router;