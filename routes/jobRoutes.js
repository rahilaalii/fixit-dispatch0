const router = require('express').Router();
const j = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', authorize('customer'), j.createJob);
router.get('/', j.listJobs);
router.get('/:id', j.getJob);
router.patch('/:id/status', j.updateStatus);
router.post('/:id/decline', authorize('provider'), j.decline);
router.patch('/:id/assign', authorize('admin'), j.assign);
router.patch('/:id/urgency', authorize('admin'), j.setUrgency);
router.post('/:id/rating', authorize('customer'), j.rateJob);

module.exports = router;
