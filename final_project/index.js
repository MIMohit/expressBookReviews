const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
  // JWT is stored in session at req.session.authorization.accessToken
  const token = req.session?.authorization?.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Missing access token. Please login." });
  }

  jwt.verify(token, "access", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid/expired token. Please login again." });
    }
    // attach user payload for later routes
    req.user = user; // { username: "..." }
    next();
  });
});

const PORT = process.env.PORT || 5000;


app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
