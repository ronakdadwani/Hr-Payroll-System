// src/services/AnomalyDetector.js
/**
 * Simple rule‑based anomaly detection for attendance logs.
 * This module is deliberately lightweight and AI‑ready – you can replace the
 * `detectAnomalies` function with an LLM call later.
 */
const Attendance = require('../models/Attendance');
const config = require('../config');

/**
 * Detects missing punches and overlapping shifts for a given employee within a tenant.
 * Returns a list of "cleaned" attendance records (including estimated outs).
 *
 * @param {string} tenantId - MongoDB ObjectId of the tenant (from JWT).
 * @param {string} employeeId - Employee identifier.
 */
async function cleanAttendance(tenantId, employeeId) {
  // Fetch all records for the employee & tenant, sorted by timestamp
  const records = await Attendance.find({ tenantId, employeeId })
    .sort('timestamp')
    .lean();
  const cleaned = [];
  let lastIn = null;

  for (const rec of records) {
    if (rec.type === 'in') {
      // If there is a previous unmatched 'in', treat it as missed punch (auto‑out)
      if (lastIn) {
        const estimatedOut = new Date(new Date(lastIn.timestamp).getTime() + config.DEFAULT_SHIFT_HOURS * 60 * 60 * 1000);
        cleaned.push({
          employeeId,
          tenantId,
          deviceId: lastIn.deviceId,
          timestamp: estimatedOut,
          type: 'out',
          estimated: true,
        });
      }
      lastIn = rec;
    } else if (rec.type === 'out') {
      if (lastIn) {
        // Normal pair – add both
        cleaned.push({ ...lastIn, estimated: false, tenantId });
        cleaned.push({ ...rec, estimated: false, tenantId });
        lastIn = null;
      } else {
        // Out without preceding in – ignore for now
      }
    }
  }

  // If there is a dangling 'in' at the end, estimate out
  if (lastIn) {
    const estimatedOut = new Date(new Date(lastIn.timestamp).getTime() + config.DEFAULT_SHIFT_HOURS * 60 * 60 * 1000);
    cleaned.push({
      employeeId,
      tenantId,
      deviceId: lastIn.deviceId,
      timestamp: estimatedOut,
      type: 'out',
      estimated: true,
    });
    cleaned.push({ ...lastIn, estimated: false, tenantId });
  }

  // Overlap handling placeholder – can be expanded later
  return cleaned;
}

module.exports = { cleanAttendance };

  for (const rec of records) {
    if (rec.type === 'in') {
      // If there is a previous unmatched 'in', treat it as missed punch (auto‑out)
      if (lastIn) {
        const estimatedOut = new Date(new Date(lastIn.timestamp).getTime() + config.DEFAULT_SHIFT_HOURS * 60 * 60 * 1000);
        cleaned.push({
          employeeId,
          deviceId: lastIn.deviceId,
          timestamp: estimatedOut,
          type: 'out',
          estimated: true,
        });
      }
      lastIn = rec;
    } else if (rec.type === 'out') {
      if (lastIn) {
        // Normal pair – add both
        cleaned.push({ ...lastIn, estimated: false });
        cleaned.push({ ...rec, estimated: false });
        lastIn = null;
      } else {
        // Out without preceding in – treat as stray, ignore or flag
        // For now we ignore it
      }
    }
  }

  // If there is a dangling 'in' at the end, estimate out
  if (lastIn) {
    const estimatedOut = new Date(new Date(lastIn.timestamp).getTime() + config.DEFAULT_SHIFT_HOURS * 60 * 60 * 1000);
    cleaned.push({
      employeeId,
      deviceId: lastIn.deviceId,
      timestamp: estimatedOut,
      type: 'out',
      estimated: true,
    });
    cleaned.push({ ...lastIn, estimated: false });
  }

  // Resolve overlapping intervals (naïve split based on chronological order)
  // For simplicity we just keep the chronological pairs; advanced logic can be added later.
  return cleaned;
}

module.exports = { cleanAttendance };
