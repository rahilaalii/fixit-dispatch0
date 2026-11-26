const mongoose = require('mongoose');

module.exports = mongoose.model('Rating', new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, unique: true }, // one rating per job
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  stars: { type: Number, required: [true, 'Stars are required'], min: [1, 'Minimum 1 star'], max: [5, 'Maximum 5 stars'] },
  comment: { type: String, trim: true },
}, { timestamps: true }));
