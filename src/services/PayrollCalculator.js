// src/services/PayrollCalculator.js
/**
 * Payroll calculation based on cleaned attendance records.
 * Returns total hours, overtime hours, and a breakdown per day.
 */
const { cleanAttendance } = require('./AnomalyDetector');
const moment = require('moment'); // we'll keep moment for date handling

/**
 * Calculate payroll for a given tenant & employee.
 * @param {string} tenantId - MongoDB ObjectId of the tenant (from JWT)
 * @param {string} employeeId - Employee identifier
 * @param {Date} startDate - start of the period (inclusive)
 * @param {Date} endDate   - end of the period (inclusive)
 */
async function calculatePayroll(tenantId, employeeId, startDate, endDate) {
  // Get cleaned records for the employee within the tenant
  const cleaned = await cleanAttendance(tenantId, employeeId);

  // Filter records within the period, and sort
  const filtered = cleaned.filter(rec => {
    const ts = new Date(rec.timestamp);
    return ts >= startDate && ts <= endDate;
  }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Pair in/out and accumulate hours per day
  const daily = {};
  let pendingIn = null;
  for (const rec of filtered) {
    if (rec.type === 'in') {
      pendingIn = rec;
    } else if (rec.type === 'out' && pendingIn) {
      const inTime = new Date(pendingIn.timestamp);
      const outTime = new Date(rec.timestamp);
      const durationMs = outTime - inTime;
      const day = moment(inTime).format('YYYY-MM-DD');
      if (!daily[day]) daily[day] = { workMs: 0, estimated: false };
      daily[day].workMs += durationMs;
      if (pendingIn.estimated || rec.estimated) daily[day].estimated = true;
      pendingIn = null;
    } else {
      // stray out without a matching in – ignore
      pendingIn = null;
    }
  }

  // Summarize totals
  let totalMs = 0;
  let overtimeMs = 0;
  const breakdown = [];
  const standardMs = 8 * 60 * 60 * 1000; // 8 hours per day
  for (const [day, info] of Object.entries(daily)) {
    totalMs += info.workMs;
    const overtime = Math.max(0, info.workMs - standardMs);
    overtimeMs += overtime;
    breakdown.push({
      date: day,
      hours: (info.workMs / 3600000).toFixed(2),
      overtimeHours: (overtime / 3600000).toFixed(2),
      estimated: info.estimated,
    });
  }

  return {
    totalHours: (totalMs / 3600000).toFixed(2),
    overtimeHours: (overtimeMs / 3600000).toFixed(2),
    breakdown,
  };
}

module.exports = { calculatePayroll };

/**
 * Payroll calculation based on cleaned attendance records.
 * Returns total hours, overtime hours, and a breakdown per day.
 */
const { cleanAttendance } = require('./AnomalyDetector');
const moment = require('moment'); // We'll add moment as a dependency

async function calculatePayroll(employeeId, startDate, endDate) {
  // Get cleaned records for the employee
  const cleaned = await cleanAttendance(employeeId);

  // Filter records within the period, and sort
  const filtered = cleaned.filter(rec => {
    const ts = new Date(rec.timestamp);
    return ts >= startDate && ts <= endDate;
  }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Pair in/out and accumulate hours per day
  const daily = {};
  let pendingIn = null;
  for (const rec of filtered) {
    if (rec.type === 'in') {
      pendingIn = rec;
    } else if (rec.type === 'out' && pendingIn) {
      const inTime = new Date(pendingIn.timestamp);
      const outTime = new Date(rec.timestamp);
      const durationMs = outTime - inTime;
      const day = moment(inTime).format('YYYY-MM-DD');
      if (!daily[day]) daily[day] = { workMs: 0, estimated: false };
      daily[day].workMs += durationMs;
      // If either record is estimated, mark the day as having estimates
      if (pendingIn.estimated || rec.estimated) daily[day].estimated = true;
      pendingIn = null;
    } else {
      // stray out without in – ignore
      pendingIn = null;
    }
  }

  // Summarize totals
  let totalMs = 0;
  let overtimeMs = 0;
  const breakdown = [];
  const standardMs = 8 * 60 * 60 * 1000; // 8 hours per day
  for (const [day, info] of Object.entries(daily)) {
    totalMs += info.workMs;
    const overtime = Math.max(0, info.workMs - standardMs);
    overtimeMs += overtime;
    breakdown.push({
      date: day,
      hours: (info.workMs / 3600000).toFixed(2),
      overtimeHours: (overtime / 3600000).toFixed(2),
      estimated: info.estimated,
    });
  }

  return {
    totalHours: (totalMs / 3600000).toFixed(2),
    overtimeHours: (overtimeMs / 3600000).toFixed(2),
    breakdown,
  };
}

module.exports = { calculatePayroll };
