
const db = require("../db");


// Collection of methods for books
class Book {

  // Given a book ISBN, return data with that ISBN:
  // => {isbn, amazon_url, author, language, pages, publisher, title, year}
  static async findOne(isbn) {
    const bookRes = await db.query(
        `SELECT isbn,
                amazon_url,
                author,
                language,
                pages,
                publisher,
                title,
                year
            FROM books 
            WHERE isbn = $1`, [isbn]);

    if (bookRes.rows.length === 0) {
      throw { message: `There is no book with an isbn '${isbn}`, status: 404 }
    }

    return bookRes.rows[0];
  }


  // Return array of book data:
  // [ {isbn, amazon_url, author, language, pages, publisher, title, year}, ... ]
  static async findAll() {
    const booksRes = await db.query(
        `SELECT isbn,
                amazon_url,
                author,
                language,
                pages,
                publisher,
                title,
                year
            FROM books 
            ORDER BY title`);

    return booksRes.rows;
  }


  // CREATE new book in database from data; then return book data:
  // {isbn, amazon_url, author, language, pages, publisher, title, year}
  // => {isbn, amazon_url, author, language, pages, publisher, title, year}
  static async create(data) {
    const result = await db.query(
      `INSERT INTO books (
            isbn,
            amazon_url,
            author,
            language,
            pages,
            publisher,
            title,
            year) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING isbn,
                   amazon_url,
                   author,
                   language,
                   pages,
                   publisher,
                   title,
                   year`,
      [
        data.isbn,
        data.amazon_url,
        data.author,
        data.language,
        data.pages,
        data.publisher,
        data.title,
        data.year
      ]
    );

    return result.rows[0];
  }


  // UPDATE data with matching ISBN to data; return updated book
  // {isbn, amazon_url, author, language, pages, publisher, title, year}
  // => {isbn, amazon_url, author, language, pages, publisher, title, year}
  static async update(isbn, data) {
    const result = await db.query(
      `UPDATE books SET 
            amazon_url=($1),
            author=($2),
            language=($3),
            pages=($4),
            publisher=($5),
            title=($6),
            year=($7)
            WHERE isbn=$8
        RETURNING isbn,
                  amazon_url,
                  author,
                  language,
                  pages,
                  publisher,
                  title,
                  year`,
      [
        data.amazon_url,
        data.author,
        data.language,
        data.pages,
        data.publisher,
        data.title,
        data.year,
        isbn
      ]
    );

    if (result.rows.length === 0) {
      throw { message: `There is no book with an isbn '${isbn}`, status: 404 }
    }

    return result.rows[0];
  }

  // DELETE book with matching isbn. Return undefined
  static async remove(isbn) {
    const result = await db.query(
      `DELETE FROM books 
         WHERE isbn = $1 
         RETURNING isbn`,
        [isbn]);

    if (result.rows.length === 0) {
      throw { message: `There is no book with an isbn '${isbn}`, status: 404 }
    }
  }
}


module.exports = Book;
