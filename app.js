
// Express app for Bookstore

const express = require("express");
const app = express();

app.use(express.json());

const ExpressError = require("./expressError");
const bookRoutes = require("./routes/books");

app.use("/books", bookRoutes);


// 404 Handler
app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});


// General Error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
