const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// returns boolean
const isValid = (username) => {
  // valid if username is non-empty and not already taken
  if (!username) return false;
  return !users.some(u => u.username === username);
};

// returns boolean
const authenticatedUser = (username, password) => {
  if (!username || !password) return false;
  return users.some(u => u.username === username && u.password === password);
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login. Check username/password." });
  }

  // create JWT and store in session
  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "Customer successfully logged in" });
});

// Add/Modify a book review (only by logged-in user)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  const username = req.user?.username || req.session?.authorization?.username;

  if (!review) {
    return res.status(400).json({ message: "Review query param required. Example: ?review=Nice" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews) books[isbn].reviews = {};

  // store review under the logged-in username (add or update)
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
