// utilities/AuthMiddleware.js

const jwt = require("jsonwebtoken");

const tokenBlacklist = new Set();

function authMiddleware(req, res, next) {
  // Get the token from the request headers
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  
  // If the token is not present or invalid, send a 401 Unauthorized response
  if (!token) {
    return res.status(401).json({ message: "Authentication failed: no token provided." });
  }

  // Check if token is blacklisted
  if (token && tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token has already been invalidated' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Authentication failed: invalid token." });
    }
    
    // Add the decoded user information to the request object
    req.user = decoded;
    next();
  });
}

module.exports = { authMiddleware,tokenBlacklist };
