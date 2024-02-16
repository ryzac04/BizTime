/** BizTime express application. */

const express = require("express");

const ExpressError = require("./expressError");
const cRoutes = require("./routes/companies");
const iRoutes = require("./routes/invoices");

const app = express();

app.use(express.json());
app.use("/companies", cRoutes);
app.use("/invoices", iRoutes);


/** 404 handler */

app.use((req, res, next) => {
  const err = new ExpressError("Page Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  // the default status is 500 Internal Server Error
  let status = err.status || 500;
  let message = err.msg;

  // set the status and alert the user
  return res.status(status).json({
    error: { message, status }
  })
});

module.exports = app;
