const Job = require('../models/Job');
const Provider = require('../models/Provider');
const Category = require('../models/Category');
const Rating = require('../models/Rating');
const asyncHandler = require('../utils/asyncHandler');
const { scoreUrgency, RANK } = require('../utils/urgency');

const ACTIVE = ['assigned', 'accepted', 'in_progress'];

// ---------- helper functions ----------
// Every booking uses a one-hour slot, so we round the time down to the start of the hour.
const normalizeSlot = (d) => { const s = new Date(d); s.setMinutes(0, 0, 0); return s; };

// Is the provider free in this slot? (this is our double-booking check)
async function providerIsFree(providerId, slot) {
  return !(await Job.exists({ provider: providerId, scheduledAt: slot, status: { $in: ACTIVE } }));
}

const withinWorkingHours = (provider, slot) =>
  slot.getHours() >= provider.workingHours.start && slot.getHours() < provider.workingHours.end;

// Auto-matching: same category, serves the area, available, free in that slot. Best rating first.
async function findBestProvider({ categoryId, area, slot, excludeIds = [] }) {
  const candidates = await Provider.find({
    categories: categoryId, isAvailable: true, _id: { $nin: excludeIds },
  }).sort({ ratingAvg: -1, ratingCount: -1 });
  for (const p of candidates) {
    const servesArea = p.areas.some((a) => a.toLowerCase() === area.toLowerCase());
    if (servesArea && withinWorkingHours(p, slot) && (await providerIsFree(p._id, slot))) return p;
  }
  return null;
}

// Gives the job to a provider. High urgency jobs get a 15 minute accept window.
function assignTo(job, provider) {
  job.provider = provider._id;
  job.status = 'assigned';
  job.offerExpiresAt = job.urgency === 'High' ? new Date(Date.now() + 15 * 60 * 1000) : null;
  job.statusHistory.push({ status: 'assigned', note: 'Assigned to a provider' });
}

const populateJob = (q) => q
  .populate('category', 'name')
  .populate('customer', 'name phone')
  .populate({ path: 'provider', populate: { path: 'user', select: 'name phone' } });

async function myProviderProfile(user) {
  return user.role === 'provider' ? Provider.findOne({ user: user._id }) : null;
}

function canView(job, user, providerProfile) {
  if (user.role === 'admin') return true;
  if (user.role === 'customer') return job.customer._id ? job.customer._id.equals(user._id) : job.customer.equals(user._id);
  if (user.role === 'provider' && providerProfile && job.provider) {
    const pid = job.provider._id || job.provider;
    return pid.equals(providerProfile._id);
  }
  return false;
}

// ---------- controllers ----------
// POST /api/jobs  (customer creates a job)
exports.createJob = asyncHandler(async (req, res) => {
  const { category, description, area, address, scheduledAt, providerId } = req.body;
  if (!category || !description || !area || !scheduledAt) {
    return res.status(400).json({ success: false, message: 'category, description, area and scheduledAt are required' });
  }
  const slot = normalizeSlot(scheduledAt);
  if (isNaN(slot.getTime()) || slot <= new Date()) {
    return res.status(400).json({ success: false, message: 'Please choose a valid time in the future' });
  }
  if (!(await Category.findById(category))) return res.status(404).json({ success: false, message: 'Category not found' });

  const u = scoreUrgency(description);
  const job = new Job({
    customer: req.user._id, category, description, area, address, scheduledAt: slot,
    urgency: u.urgency, urgencyRank: u.rank, urgencyReason: u.reason,
    source: req.body.source === 'whatsapp' ? 'whatsapp' : 'web',
    statusHistory: [{ status: 'requested', note: 'Job created' }],
  });

  let provider = null;
  if (providerId) { // customer picked a provider
    provider = await Provider.findById(providerId);
    if (!provider || !provider.categories.some((c) => c.equals(category))) {
      return res.status(400).json({ success: false, message: 'This provider does not offer that service' });
    }
    if (!provider.isAvailable || !withinWorkingHours(provider, slot)) {
      return res.status(400).json({ success: false, message: 'Provider is not working at that time' });
    }
    if (!(await providerIsFree(provider._id, slot))) {
      return res.status(409).json({ success: false, message: 'That time slot is already booked' });
    }
  } else {            // otherwise the system finds one automatically
    provider = await findBestProvider({ categoryId: category, area, slot });
  }
  if (provider) assignTo(job, provider);

  await job.save();
  const saved = await populateJob(Job.findById(job._id));
  res.status(201).json({
    success: true,
    message: provider ? 'Job created and assigned' : 'Job created. No provider free yet, admin will assign one',
    job: saved,
  });
});

// GET /api/jobs?status=assigned&urgency=High  (each role sees only its own jobs)
exports.listJobs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'customer') filter.customer = req.user._id;
  if (req.user.role === 'provider') {
    const p = await myProviderProfile(req.user);
    if (!p) return res.json({ success: true, count: 0, jobs: [] });
    filter.provider = p._id;
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.urgency) filter.urgency = req.query.urgency;
  // Most urgent first, then the earliest time
  const jobs = await populateJob(Job.find(filter).sort({ urgencyRank: -1, scheduledAt: 1 }));
  res.json({ success: true, count: jobs.length, jobs });
});

// GET /api/jobs/:id
exports.getJob = asyncHandler(async (req, res) => {
  const job = await populateJob(Job.findById(req.params.id));
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  if (!canView(job, req.user, await myProviderProfile(req.user))) {
    return res.status(403).json({ success: false, message: 'This is not your job' });
  }
  res.json({ success: true, job });
});

// PATCH /api/jobs/:id/status
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  if (req.user.role === 'provider') {
    const p = await myProviderProfile(req.user);
    if (!p || !job.provider || !job.provider.equals(p._id)) return res.status(403).json({ success: false, message: 'This is not your job' });
    const next = { assigned: ['accepted'], accepted: ['in_progress', 'completed'], in_progress: ['completed'] };
    if (!(next[job.status] || []).includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot change from ${job.status} to ${status}` });
    }
  } else if (req.user.role === 'customer') {
    if (!job.customer.equals(req.user._id)) return res.status(403).json({ success: false, message: 'This is not your job' });
    if (status !== 'cancelled' || !['requested', 'assigned', 'accepted'].includes(job.status)) {
      return res.status(400).json({ success: false, message: 'You can only cancel a job that has not started' });
    }
  } else if (!Job.schema.path('status').enumValues.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  job.status = status;
  if (status === 'accepted') job.offerExpiresAt = null; // accepted in time, so no auto-reassign
  job.statusHistory.push({ status, note: `Changed by ${req.user.role}` });
  await job.save();
  res.json({ success: true, job: await populateJob(Job.findById(job._id)) });
});

// POST /api/jobs/:id/decline  (provider says no, system tries the next best provider)
exports.decline = asyncHandler(async (req, res) => {
  const p = await myProviderProfile(req.user);
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  if (!p || !job.provider || !job.provider.equals(p._id) || job.status !== 'assigned') {
    return res.status(400).json({ success: false, message: 'You can only decline a job that is assigned to you' });
  }
  job.declinedBy.push(p._id);
  job.provider = null;
  job.status = 'requested';
  job.statusHistory.push({ status: 'requested', note: 'Declined by provider' });
  const next = await findBestProvider({ categoryId: job.category, area: job.area, slot: job.scheduledAt, excludeIds: job.declinedBy });
  if (next) assignTo(job, next);
  await job.save();
  res.json({ success: true, message: next ? 'Job passed to the next provider' : 'No other provider free, admin will assign', job });
});

// PATCH /api/jobs/:id/assign  (admin picks a provider manually)
exports.assign = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  const provider = await Provider.findById(req.body.providerId);
  if (!job || !provider) return res.status(404).json({ success: false, message: 'Job or provider not found' });
  if (!(await providerIsFree(provider._id, job.scheduledAt))) {
    return res.status(409).json({ success: false, message: 'Provider is already booked at that time' });
  }
  assignTo(job, provider);
  await job.save();
  res.json({ success: true, job: await populateJob(Job.findById(job._id)) });
});

// PATCH /api/jobs/:id/urgency  (admin now, the AI automation in Week 3)
exports.setUrgency = asyncHandler(async (req, res) => {
  const { urgency, reason } = req.body;
  if (!RANK[urgency]) return res.status(400).json({ success: false, message: 'urgency must be High, Medium or Low' });
  const job = await Job.findByIdAndUpdate(req.params.id,
    { urgency, urgencyRank: RANK[urgency], urgencyReason: reason || 'Set manually' }, { new: true });
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, job });
});

// POST /api/jobs/:id/rating  (customer rates a completed job)
exports.rateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job || !job.customer.equals(req.user._id)) return res.status(404).json({ success: false, message: 'Job not found' });
  if (job.status !== 'completed' || !job.provider) {
    return res.status(400).json({ success: false, message: 'You can rate only a completed job' });
  }
  const rating = await Rating.create({ job: job._id, customer: req.user._id, provider: job.provider, stars: req.body.stars, comment: req.body.comment });
  const [agg] = await Rating.aggregate([
    { $match: { provider: job.provider } },
    { $group: { _id: null, avg: { $avg: '$stars' }, n: { $sum: 1 } } },
  ]);
  await Provider.findByIdAndUpdate(job.provider, { ratingAvg: Math.round(agg.avg * 10) / 10, ratingCount: agg.n });
  res.status(201).json({ success: true, rating });
});

// Exported so Week 3 automation can reuse the same matching logic
exports.findBestProvider = findBestProvider;
