const User = require('../models/User');
const Provider = require('../models/Provider');
const Job = require('../models/Job');
const asyncHandler = require('../utils/asyncHandler');

const populateProvider = (q) => q.populate('user', 'name phone email').populate('categories', 'name');

// GET /api/providers?category=ID&area=DHA   (list providers, with optional filters)
exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.categories = req.query.category;
  if (req.query.area) filter.areas = new RegExp(`^${req.query.area}$`, 'i');
  if (req.user.role !== 'admin') filter.isAvailable = true;
  const providers = await populateProvider(Provider.find(filter).sort({ ratingAvg: -1 }));
  res.json({ success: true, count: providers.length, providers });
});

// POST /api/providers  (admin creates a provider account + profile)
exports.create = asyncHandler(async (req, res) => {
  const { name, email, password, phone, categories, areas, skills, workingHours } = req.body;
  const user = await User.create({ name, email, password, phone, role: 'provider' });
  try {
    const provider = await Provider.create({ user: user._id, categories, areas, skills, workingHours });
    res.status(201).json({ success: true, provider });
  } catch (err) {
    await User.findByIdAndDelete(user._id); // undo the user if the profile failed
    throw err;
  }
});

// GET /api/providers/me  (provider sees own profile)
exports.getMe = asyncHandler(async (req, res) => {
  const provider = await populateProvider(Provider.findOne({ user: req.user._id }));
  if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found' });
  res.json({ success: true, provider });
});

// PATCH /api/providers/me  (provider updates availability, areas, hours)
exports.updateMe = asyncHandler(async (req, res) => {
  const allowed = {};
  ['isAvailable', 'areas', 'workingHours', 'skills'].forEach((k) => {
    if (req.body[k] !== undefined) allowed[k] = req.body[k];
  });
  const provider = await Provider.findOneAndUpdate({ user: req.user._id }, allowed, { new: true, runValidators: true });
  if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found' });
  res.json({ success: true, provider });
});

// GET /api/providers/:id/slots?date=2026-12-01  (which hours are already booked that day)
exports.slots = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
  const day = req.query.date ? new Date(req.query.date) : new Date();
  const start = new Date(day); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  const jobs = await Job.find({
    provider: provider._id,
    scheduledAt: { $gte: start, $lt: end },
    status: { $in: ['assigned', 'accepted', 'in_progress'] },
  });
  const bookedHours = jobs.map((j) => j.scheduledAt.getHours());
  const freeHours = [];
  for (let h = provider.workingHours.start; h < provider.workingHours.end; h++) {
    if (!bookedHours.includes(h)) freeHours.push(h);
  }
  res.json({ success: true, bookedHours, freeHours });
});
