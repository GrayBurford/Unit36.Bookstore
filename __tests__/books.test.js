
// INTEGRATION TESTS FOR BOOKS ROUTE

process.env.NODE_ENV = "test";

const db = require('../db');
const app = require('../app');
const request = require('supertest');
const { ValidatorResult } = require('jsonschema');

let book_isbn;

// Set up database with 1 test entry
beforeEach(async () => {
    const result = await db.query(`
        INSERT INTO
            books (isbn, amazon_url, author, language, pages, publisher, title, year)
            VALUES (
                '239457862394',
                'https://www.amazon.com',
                'Christopher Hitchens',
                'English',
                999,
                'Sam Harris',
                'God Is Not Great',
                2010
            )
            RETURNING isbn
        `);
    
    book_isbn = result.rows[0].isbn;
})

// Clean database after each test
afterEach(async function () {
    await db.query('DELETE FROM BOOKS');
})

// Shut down server after all tests have run
afterAll(async function () {
    await db.end();
})


describe("**TEST** GET /books", function () {
    test("Gets a list of all books (in test case, just 1 book)", async function () {
        const response = await request(app).get('/books');
        const books = response.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty('isbn');
        expect(books[0]).toHaveProperty('author');
    })
})


describe("**TEST** GET /books/:isbn", function () {
    test("Should get a single book by ISBN", async function () {
        const response = await request(app).get(`/books/${book_isbn}`);
        const book = response.body.book;
        expect(book).toHaveProperty('publisher');
        expect(book.isbn).toBe(book_isbn);
    });

    test("Should response with 404 if book is not found", async function () {
        const response = await request(app).get(`/books/83457638`);
        expect(response.statusCode).toBe(404);
    })
})


describe("**TEST** POST /books", function () {
    test("Should successfully add new book with correct status", async function () {
        const response = await request(app).post('/books').send({
            isbn: "0691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
          });
        expect(response.statusCode).toBe(201);
    });

    test("Should not allow book creation if missing title", async function () {
        const response = await request(app).post('/books').send({
            isbn: "0691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title : null,
            year: 2017
          });
        expect(response.statusCode).toBe(400);
    })
})

describe("**TEST** PUT /books/:isbn", function () {
    test("Should update one book's info", async function () {
        const response = await request(app).put(`/books/${book_isbn}`).send({
            isbn: "99990691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "UPDATED Matthew Lane",
            language: "UPDATED english",
            pages: 264,
            publisher: "UPDATED Princeton University Press",
            title: "UPDATED Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
          });
        const data = response.body.book;
        expect(data).toHaveProperty("isbn");
        expect(data.author).toBe("UPDATED Matthew Lane");
    });

    test("Should not allow a book with wrong fields to be updated", async function () {
        const response = await request(app).put(`/books/${book_isbn}`).send({
            isbn: "99990691161518",
            BAD_amazon_url: "http://a.co/eobPtX2",
            BAD_author: "UPDATED Matthew Lane",
            BAD_language: "UPDATED english",
            pages: 264,
            publisher: "UPDATED Princeton University Press",
            title: "UPDATED Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
        });
        expect(response.statusCode).toBe(400);
    });

    test("Should respond with 404 if can't find book to update", async function () {
        // Delete book first, then check if it can be found
        await request(app).delete(`/books/${book_isbn}`);
        const response = await request(app).delete(`/books/${book_isbn}`);
        expect(response.statusCode).toBe(404);
    })
})

describe("**TEST** DELETE /books/:isbn", function () {
    test("Should delete book with given isbn", async function () {
        const response = await request(app).delete(`/books/${book_isbn}`);
        expect(response.statusCode).toBe(202);
        expect(response.body).toEqual({ message: "Book deleted" });
    })
})