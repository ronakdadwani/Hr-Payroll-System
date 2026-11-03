// src/models/Attendance.js
const mongoose = require('mongoose');

const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  deviceId: { type: String, required: true },
  // ISO string in UTC
  timestamp: { type: Date, required: true },
  // 'in' or 'out'
  type: { type: String, enum: ['in', 'out'], required: true },
  // Marks records that were auto‑estimated (e.g., missed punch)
  estimated: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);

  employeeId: { type: String, required: true },
  deviceId: { type: String, required: true },
  // ISO string in UTC
  timestamp: { type: Date, required: true },
  // 'in' or 'out'
  type: { type: String, enum: ['in', 'out'], required: true },
  // Marks records that were auto‑estimated (e.g., missed punch)
  estimated: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
