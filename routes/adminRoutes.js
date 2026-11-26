const router = require('express').Router();
const { stats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), stats);

module.exports = router;
