// src/utils/authUtils.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

const generateAccessToken = (email) => {
  return jwt.sign({ email }, SECRET_KEY, { expiresIn: '15m' });
};

const generateRefreshToken = (email) => {
  return jwt.sign({ email }, SECRET_KEY, { expiresIn: '30d' });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  hashPassword,
  comparePassword
};