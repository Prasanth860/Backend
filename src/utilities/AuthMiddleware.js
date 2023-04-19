// utilities/AuthMiddleware.js

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // Get the token from the request headers
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  
  // If the token is not present or invalid, send a 401 Unauthorized response
  if (!token) {
    return res.status(401).json({ message: "Authentication failed: no token provided." });
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

module.exports = { authMiddleware };
