const router = require('express').Router();
const p = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', p.list);
router.post('/', authorize('admin'), p.create);
router.get('/me', authorize('provider'), p.getMe);
router.patch('/me', authorize('provider'), p.updateMe);
router.get('/:id/slots', p.slots);

module.exports = router;
