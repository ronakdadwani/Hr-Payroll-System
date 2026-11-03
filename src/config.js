// src/config.js
require('dotenv').config();

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance',
  DEFAULT_SHIFT_HOURS: parseFloat(process.env.DEFAULT_SHIFT_HOURS) || 8,
  TIMEZONE: process.env.TIMEZONE || 'UTC',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey',
};

  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance',
  DEFAULT_SHIFT_HOURS: parseFloat(process.env.DEFAULT_SHIFT_HOURS) || 8,
  TIMEZONE: process.env.TIMEZONE || 'UTC',
};
