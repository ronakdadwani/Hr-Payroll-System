// src/models/Tenant.js
const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // additional fields like plan, limits can be added later
}, { timestamps: true });

module.exports = mongoose.model('Tenant', TenantSchema);
