const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', default: null },
  description: { type: String, required: [true, 'Please describe the problem'], trim: true, minlength: [5, 'Description is too short'] },
  area: { type: String, required: [true, 'Area is required'], trim: true },
  address: { type: String, trim: true },
  scheduledAt: { type: Date, required: [true, 'Please choose a time'] }, // always start of an hour
  urgency: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  urgencyRank: { type: Number, default: 2 },        // 3 = High, 2 = Medium, 1 = Low (used for sorting)
  urgencyReason: { type: String },
  status: { type: String, enum: ['requested', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled'], default: 'requested' },
  declinedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }],
  offerExpiresAt: { type: Date, default: null },    // for High jobs: 15-minute accept window (used in Week 3)
  source: { type: String, enum: ['web', 'whatsapp'], default: 'web' },
  statusHistory: [{
    status: String,
    note: String,
    at: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

jobSchema.index({ provider: 1, scheduledAt: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);
