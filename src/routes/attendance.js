// src/routes/attendance.js
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { cleanAttendance } = require('../services/AnomalyDetector');
const { calculatePayroll } = require('../services/PayrollCalculator');
const Joi = require('joi');

// Validation schema for punch record
const punchSchema = Joi.object({
  employeeId: Joi.string().required(),
  deviceId: Joi.string().required(),
  timestamp: Joi.string().isoDate().required(),
  type: Joi.string().valid('in', 'out').required(),
});

/**
 * POST /api/attendance
 * Store a punch record (requires auth – tenantId comes from JWT).
 */
router.post('/attendance', async (req, res) => {
  const { error, value } = punchSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { employeeId, deviceId, timestamp, type } = value;
  const tenantId = req.user.tenantId; // set by auth middleware

  try {
    const record = new Attendance({ employeeId, tenantId, deviceId, timestamp, type });
    await record.save();
    res.status(201).json({ message: 'Record stored', id: record._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET /api/attendance/clean/:employeeId
 * Returns cleaned attendance records scoped to the tenant.
 */
router.get('/attendance/clean/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  const tenantId = req.user.tenantId;
  try {
    const cleaned = await cleanAttendance(tenantId, employeeId);
    res.json({ employeeId, cleaned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Processing error' });
  }
});

/**
 * GET /api/payroll/:employeeId?start=YYYY-MM-DD&end=YYYY-MM-DD
 * Calculates payroll for the employee within the tenant.
 */
router.get('/payroll/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  const tenantId = req.user.tenantId;
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'start and end query params required (ISO date)' });
  try {
    const payroll = await calculatePayroll(tenantId, employeeId, new Date(start), new Date(end));
    res.json({ employeeId, period: { start, end }, payroll });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payroll calculation error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { cleanAttendance } = require('../services/AnomalyDetector');
const { calculatePayroll } = require('../services/PayrollCalculator');

/**
 * POST /api/attendance
 * Accepts a single punch record from biometric hardware.
 * Expected JSON shape:
 *   { employeeId, deviceId, timestamp (ISO string), type: "in"|"out" }
 */
const Joi = require('joi');

// Validation schema for punch record
const punchSchema = Joi.object({
  employeeId: Joi.string().required(),
  deviceId: Joi.string().required(),
  timestamp: Joi.string().isoDate().required(),
  type: Joi.string().valid('in', 'out').required(),
});

router.post('/attendance', async (req, res) => {
  const { error, value } = punchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { employeeId, deviceId, timestamp, type } = value;
  try {
    const record = new Attendance({ employeeId, deviceId, timestamp, type });
    await record.save();
    res.status(201).json({ message: 'Record stored', id: record._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
  const { employeeId, deviceId, timestamp, type } = req.body;
  if (!employeeId || !deviceId || !timestamp || !['in', 'out'].includes(type)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  try {
    const record = new Attendance({ employeeId, deviceId, timestamp, type });
    await record.save();
    res.status(201).json({ message: 'Record stored', id: record._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET /api/attendance/clean/:employeeId
 * Returns cleaned attendance records for the employee (with estimated outs).
 */
router.get('/attendance/clean/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  try {
    const cleaned = await cleanAttendance(employeeId);
    res.json({ employeeId, cleaned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Processing error' });
  }
});

/**
 * GET /api/payroll/:employeeId?start=YYYY-MM-DD&end=YYYY-MM-DD
 * Returns payroll calculation (total hours, overtime, etc.) for the period.
 */
router.get('/payroll/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'start and end query params required (ISO date)' });
  }
  try {
    const payroll = await calculatePayroll(employeeId, new Date(start), new Date(end));
    res.json({ employeeId, period: { start, end }, payroll });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payroll calculation error' });
  }
});

module.exports = router;
