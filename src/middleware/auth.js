// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Verify JWT and attach user info to request.
 * Expected token in `Authorization: Bearer <token>` header.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid Authorization format' });
  }
  const token = parts[1];
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.user = payload; // { userId, tenantId, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
