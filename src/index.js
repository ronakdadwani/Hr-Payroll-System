// src/index.js
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const config = require('./config');
const attendanceRoutes = require('./routes/attendance');

const app = express();

// Public routes (auth)
app.use('/api/auth', require('./routes/auth'));

// Protect subsequent routes
const { authenticate } = require('./middleware/auth');
app.use('/api', authenticate);
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api', attendanceRoutes);

app.get('/', (req, res) => {
  res.send('Biometric Attendance API is running');
});

app.listen(config.PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${config.PORT}`);
});
