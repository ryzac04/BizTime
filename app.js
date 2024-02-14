/** BizTime express application. */

const express = require("express");
const app = express();
app.use(express.json());

const ExpressError = require("./expressError");
const cRoutes = require("./routes/companies");
// const cInvoices = require("./routes/invoices");

app.use("/companies", cRoutes);
// app.use("/invoices", cInvoices);


/** 404 handler */

app.use((req, res, next) => {
  const err = new ExpressError("Page Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});

module.exports = app;
