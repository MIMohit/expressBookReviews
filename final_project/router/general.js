const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists or invalid" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();

  const results = Object.keys(books)
    .filter(isbn => books[isbn].author.toLowerCase() === author)
    .map(isbn => ({ isbn, ...books[isbn] }));

  if (results.length === 0) return res.status(404).json({ message: "No books found for this author" });
  return res.status(200).json(results);
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  const results = Object.keys(books)
    .filter(isbn => books[isbn].title.toLowerCase() === title)
    .map(isbn => ({ isbn, ...books[isbn] }));

  if (results.length === 0) return res.status(404).json({ message: "No books found for this title" });
  return res.status(200).json(results);
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  const reviews = book.reviews || {};
  if (Object.keys(reviews).length === 0) {
    return res.status(200).json({ message: "No reviews found for this book." });
  }

  return res.status(200).json(reviews);
});

module.exports.general = public_users;
