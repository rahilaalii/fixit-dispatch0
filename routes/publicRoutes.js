const router = require('express').Router();
const p = require('../controllers/publicController');

// No login needed for any of these
router.get('/providers', p.listProviders);
router.get('/providers/:id', p.getProvider);
router.get('/areas', p.areas);
router.post('/match', p.match);
router.get('/stats', p.stats);

module.exports = router;
