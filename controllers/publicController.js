// Public endpoints: anyone can call these without logging in.
// IMPORTANT: they never return phone numbers or emails, only safe profile information.
const Provider = require('../models/Provider');
const Category = require('../models/Category');
const Rating = require('../models/Rating');
const Job = require('../models/Job');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');
const matchCategory = require('../utils/matchCategory');
const { scoreUrgency } = require('../utils/urgency');

const withRefs = (q) => q.populate('user', 'name').populate('categories', 'name');

// Only the fields that are safe to show to visitors
const safe = (p) => ({
  _id: p._id,
  name: p.user?.name,
  categories: p.categories,
  areas: p.areas,
  skills: p.skills,
  workingHours: p.workingHours,
  ratingAvg: p.ratingAvg,
  ratingCount: p.ratingCount,
  isAvailable: p.isAvailable,
  memberSince: p.createdAt,
});

// GET /api/public/providers?category=ID&area=DHA&q=pipe&sort=rating|reviews
exports.listProviders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.categories = req.query.category;
  if (req.query.area) filter.areas = new RegExp(`^${escapeRegex(req.query.area)}$`, 'i');
  const sort = req.query.sort === 'reviews' ? { ratingCount: -1, ratingAvg: -1 } : { ratingAvg: -1, ratingCount: -1 };

  let providers = (await withRefs(Provider.find(filter).sort(sort))).map(safe);

  // Text search over name, skills and service names
  const q = (req.query.q || '').trim().toLowerCase();
  if (q) {
    providers = providers.filter((p) =>
      [p.name, p.skills, ...(p.categories || []).map((c) => c.name)].join(' ').toLowerCase().includes(q));
  }
  res.json({ success: true, count: providers.length, providers });
});

// GET /api/public/providers/:id  (profile + recent reviews)
exports.getProvider = asyncHandler(async (req, res) => {
  const p = await withRefs(Provider.findById(req.params.id));
  if (!p) return res.status(404).json({ success: false, message: 'Provider not found' });
  const ratings = await Rating.find({ provider: p._id }).populate('customer', 'name').sort('-createdAt').limit(10);
  const reviews = ratings.map((r) => ({
    _id: r._id,
    stars: r.stars,
    comment: r.comment,
    customer: (r.customer?.name || 'Customer').split(' ')[0], // first name only, for privacy
    createdAt: r.createdAt,
  }));
  res.json({ success: true, provider: safe(p), reviews });
});

// GET /api/public/areas  (list of areas we serve, for the filter dropdown)
exports.areas = asyncHandler(async (req, res) => {
  const providers = await Provider.find({}, 'areas');
  const areas = [...new Set(providers.flatMap((p) => p.areas))].sort();
  res.json({ success: true, areas });
});

// POST /api/public/match  { text }  -> which service is this, and how urgent
exports.match = asyncHandler(async (req, res) => {
  const text = (req.body.text || '').trim();
  if (text.length < 3) return res.status(400).json({ success: false, message: 'Please describe the problem' });
  const categories = await Category.find();
  const category = matchCategory(text, categories);
  const u = scoreUrgency(text);
  res.json({
    success: true,
    category: category ? { _id: category._id, name: category.name } : null,
    urgency: u.urgency,
    urgencyReason: u.reason,
  });
});

// GET /api/public/stats  (numbers for the homepage)
exports.stats = asyncHandler(async (req, res) => {
  const [providers, completed, avg] = await Promise.all([
    Provider.countDocuments(),
    Job.countDocuments({ status: 'completed' }),
    Provider.aggregate([{ $match: { ratingCount: { $gt: 0 } } }, { $group: { _id: null, avg: { $avg: '$ratingAvg' } } }]),
  ]);
  res.json({
    success: true,
    providers,
    completedJobs: completed,
    avgRating: avg[0] ? Math.round(avg[0].avg * 10) / 10 : 0,
  });
});
