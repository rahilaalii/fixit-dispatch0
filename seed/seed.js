// Fills the database with demo data. Run with: npm run seed
// WARNING: this deletes the old data in these collections first.
// Change the AREAS list below to areas of your own city if you like.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Provider = require('../models/Provider');
const Job = require('../models/Job');
const Rating = require('../models/Rating');
const { scoreUrgency } = require('../utils/urgency');

const AREAS = ['DHA', 'Gulberg', 'Model Town', 'Satellite Town', 'Cantt', 'Bahria Town'];

const CATEGORIES = [
  ['Plumber', 'Leaks, taps, pipes, water tank, drainage'],
  ['Electrician', 'Wiring, switches, fans, short circuit, lights'],
  ['AC Technician', 'AC repair, gas filling, service, installation'],
  ['Appliance Repair', 'Washing machine, fridge, oven, geyser, microwave'],
  ['Carpenter', 'Doors, cupboards, furniture repair'],
  ['Painter', 'Wall painting, polish, water damage touch-ups'],
];

// [name, categories (by index), areas (by index), start hour, end hour, rating, rating count]
const PROVIDERS = [
  ['Usman Tariq', [0], [0, 1, 2], 9, 18, 4.8, 24],
  ['Bilal Ahmed', [0], [2, 3, 4], 10, 19, 4.4, 15],
  ['Hamza Raza', [1], [0, 1, 5], 9, 18, 4.7, 31],
  ['Kashif Mehmood', [1], [2, 3, 4], 8, 17, 4.2, 12],
  ['Adnan Siddiqui', [2], [0, 1, 2], 10, 20, 4.6, 19],
  ['Faisal Iqbal', [2, 3], [3, 4, 5], 9, 18, 4.5, 22],
  ['Naveed Akhtar', [3], [0, 2, 4], 9, 18, 4.3, 10],
  ['Imran Shah', [4], [1, 2, 3], 9, 17, 4.9, 17],
  ['Shahid Butt', [5], [0, 3, 5], 9, 18, 4.1, 8],
  ['Zubair Khan', [0, 1], [1, 4, 5], 11, 21, 4.0, 6],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing old data...');
  await Promise.all([User.deleteMany(), Category.deleteMany(), Provider.deleteMany(), Job.deleteMany(), Rating.deleteMany()]);

  await User.create({ name: 'Admin', email: 'admin@fixit.com', password: 'Admin@123', role: 'admin' });
  const customers = [];
  for (const [name, email, area] of [['Ali Raza', 'ali@fixit.com', 'DHA'], ['Sara Khan', 'sara@fixit.com', 'Gulberg'], ['Ayesha Malik', 'ayesha@fixit.com', 'Model Town']]) {
    customers.push(await User.create({ name, email, password: 'Customer@123', role: 'customer', phone: '0300-1234567', area }));
  }

  const cats = await Category.insertMany(CATEGORIES.map(([name, description]) => ({ name, description })));

  const providers = [];
  for (let i = 0; i < PROVIDERS.length; i++) {
    const [name, catIdx, areaIdx, start, end, ratingAvg, ratingCount] = PROVIDERS[i];
    const user = await User.create({
      name, email: `provider${i + 1}@fixit.com`, password: 'Provider@123', role: 'provider', phone: `0311-00000${String(i).padStart(2, '0')}`,
    });
    providers.push(await Provider.create({
      user: user._id,
      categories: catIdx.map((c) => cats[c]._id),
      areas: areaIdx.map((a) => AREAS[a]),
      skills: `${name} works as ${catIdx.map((c) => CATEGORIES[c][0]).join(' and ')}`,
      workingHours: { start, end }, ratingAvg, ratingCount,
    }));
  }

  // A few demo jobs (tomorrow, at different hours)
  const day = new Date(); day.setDate(day.getDate() + 1);
  const demo = [
    [0, 0, 'Pipe burst in kitchen, water everywhere', 'DHA', 10, 0, 0],
    [1, 1, 'Fan is making noise sometimes', 'Gulberg', 11, 2, 0],
    [2, 2, 'AC is not cooling, needs gas', 'Model Town', 12, 4, 2],
    [0, 3, 'Washing machine is not draining water', 'Cantt', 14, 6, 4],
  ];
  for (const [cu, ca, description, area, hour, pv, pa] of demo) {
    const slot = new Date(day); slot.setHours(hour, 0, 0, 0);
    const u = scoreUrgency(description);
    await Job.create({
      customer: customers[cu]._id, category: cats[ca]._id, provider: providers[pv]._id, description, area,
      scheduledAt: slot, urgency: u.urgency, urgencyRank: u.rank, urgencyReason: u.reason, status: 'assigned',
      statusHistory: [{ status: 'requested' }, { status: 'assigned' }],
    });
  }

  console.log('Done! Logins:');
  console.log('  Admin:    admin@fixit.com    / Admin@123');
  console.log('  Customer: ali@fixit.com      / Customer@123');
  console.log('  Provider: provider1@fixit.com / Provider@123  (provider1 to provider10)');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
