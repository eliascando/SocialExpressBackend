const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.controller');
const auth = require('../middlewares/auth');

router.post('/save', auth, followController.saveFollow);
router.delete('/delete/:id', auth, followController.deleteFollow);
router.get('/following/:id?/:page?', auth, followController.following);
router.get('/followers/:id?/:page?', auth, followController.followers);

module.exports = router;