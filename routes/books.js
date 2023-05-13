
const express = require("express");
const Book = require("../models/book");

const router = new express.Router();
const jsonschema = require('jsonschema');
const bookSchema = require('../schemas/bookSchema.json');
const ExpressError = require("../expressError");


// GET / => {books : [book, ...]}
router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    console.log('***Inside .get /books')
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});


// GET /[isbn] => {book : book}
router.get("/:isbn", async function (req, res, next) {
  try {
    const isbn = req.params.isbn;
    const book = await Book.findOne(isbn);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});


// POST / bookData => {book : newBook}
// {
//   "isbn": "0691161518",
//   "amazon_url": "http://a.co/eobPtX2",
//   "author": "Matthew Lane",
//   "language": "english",
//   "pages": 264,
//   "publisher": "Princeton University Press",
//   "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
//   "year": 2017
// }
router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookSchema);
    const data = req.body;

    if (!result.valid) {
      console.log('**************That is NOT a valid book!')
      console.log(result);
      const allErrorsArrary = result.errors.map(e => e.stack);
      const errors = new ExpressError(allErrorsArrary, 400);
      return next(errors);
      
    } else {
      console.log('**************That is a valid book!');
      const book = await Book.create(data);
      return res.status(201).json({book});
      
    }
    // const book = await Book.create(req.body);
    // return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});


// PUT /[isbn] bookData => {book : updatedBook}
router.put("/:isbn", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookSchema);

    if (!result.valid) {
      console.log('**************That is NOT a valid book!')
      const allErrorsArrary = result.errors.map(e => e.stack);
      const errors = new ExpressError(allErrorsArrary, 400);
      return next(errors);
    } else {
      const book = await Book.update(req.params.isbn, req.body);
      console.log('**************BOOK UPDATED!')
      return res.json({ book });
    }
  } catch (err) {
    return next(err);
  }
});


// DELETE /[isbn] => {message: "Book deleted"}
router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.status(202).json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
