const Job = require('../models/Job');
const Provider = require('../models/Provider');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/stats  (numbers for the admin dashboard)
exports.stats = asyncHandler(async (req, res) => {
  const count = (field) => Job.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  const [byStatus, byUrgency, byCategory] = await Promise.all([
    count('status'), count('urgency'),
    Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
      { $project: { name: { $arrayElemAt: ['$cat.name', 0] }, count: 1 } },
    ]),
  ]);
  res.json({
    success: true,
    totals: {
      jobs: await Job.countDocuments(),
      providers: await Provider.countDocuments(),
      customers: await User.countDocuments({ role: 'customer' }),
    },
    byStatus, byUrgency, byCategory,
  });
});
