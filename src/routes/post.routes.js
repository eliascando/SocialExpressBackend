const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');

router.get('/prueba-post', postController.pruebaPost);

module.exports = router;