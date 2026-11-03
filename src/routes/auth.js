// src/routes/auth.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const config = require('../config');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  tenantName: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

/** Register a new tenant + admin user */
router.post('/register', async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const { email, password, tenantName } = value;
  try {
    // Create tenant
    const tenant = await Tenant.create({ name: tenantName });
    // Create user (admin role)
    const user = new User({ email, tenantId: tenant._id, role: 'admin' });
    await user.setPassword(password);
    await user.save();
    const token = jwt.sign({ userId: user._id, tenantId: tenant._id, role: user.role }, config.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, tenantId: tenant._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/** Login */
router.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const { email, password } = value;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await user.validatePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, tenantId: user.tenantId, role: user.role }, config.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, tenantId: user.tenantId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
