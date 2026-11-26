const mongoose = require('mongoose');

// A provider profile linked to a User account with role "provider".
const providerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  areas: [{ type: String, trim: true }],            // areas this provider serves
  skills: { type: String, trim: true },             // short text about skills
  isAvailable: { type: Boolean, default: true },
  workingHours: {                                   // 24-hour format, e.g. 9 to 18
    start: { type: Number, default: 9, min: 0, max: 23 },
    end: { type: Number, default: 18, min: 1, max: 24 },
  },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);
