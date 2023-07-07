const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatar');
    },
    filename: (req, file, cb) => {
        const filename = `avatar-${Date.now()}-${file.originalname.toLowerCase().split(' ').join('-')}`;
        cb(null, filename);
    }
});

const upload = multer({storage});

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile/:id', auth, userController.profile);
router.get('/list/:page?', auth, userController.list);
router.put('/update', auth, userController.update);
router.post('/upload-avatar',[auth, upload.single("avatar")], userController.uploadAvatar);
router.get('/get-avatar/:filename', auth, userController.getAvatar);

module.exports = router;