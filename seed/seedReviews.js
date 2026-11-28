// Adds demo completed jobs and written reviews, WITHOUT deleting your existing data.
// Run once with: npm run seed:reviews
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Category = require('../models/Category'); // needed so Mongoose knows the Category model
const Job = require('../models/Job');
const Rating = require('../models/Rating');

const COMMENTS = [
  [5, 'Came on time and fixed the problem quickly. Very professional.'],
  [5, 'Bohat acha kaam kiya, price bhi theek tha.'],
  [4, 'Good work. Arrived a little late but solved everything.'],
  [5, 'Explained the problem clearly before starting. Recommended.'],
  [4, 'Neat work and polite behaviour.'],
  [3, 'Work was fine but it took longer than expected.'],
  [5, 'Mera masla ek ghante mein hal ho gaya. Shukriya.'],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  if (await Job.exists({ description: /^Demo:/ })) {
    console.log('Demo reviews are already added. Nothing to do.');
    return mongoose.disconnect();
  }
  const customers = await User.find({ role: 'customer' });
  const providers = await Provider.find().populate('categories');
  if (customers.length === 0 || providers.length === 0) {
    console.log('Run "npm run seed" first.');
    return mongoose.disconnect();
  }

  let n = 0;
  for (let i = 0; i < providers.length; i++) {
    const p = providers[i];
    const cat = p.categories[0];
    for (let k = 0; k < 2; k++) {
      const [stars, comment] = COMMENTS[(i + k * 3) % COMMENTS.length];
      const customer = customers[(i + k) % customers.length];
      const when = new Date(); when.setDate(when.getDate() - (5 + i + k * 4)); when.setHours(11, 0, 0, 0);
      const job = await Job.create({
        customer: customer._id, category: cat._id, provider: p._id,
        description: `Demo: ${cat.name} job completed`, area: p.areas[0],
        scheduledAt: when, status: 'completed', urgency: 'Medium', urgencyRank: 2,
        statusHistory: [{ status: 'requested' }, { status: 'assigned' }, { status: 'accepted' }, { status: 'completed' }],
      });
      await Rating.create({ job: job._id, customer: customer._id, provider: p._id, stars, comment });
      n++;
    }
  }
  console.log(`Done! Added ${n} demo reviews.`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });