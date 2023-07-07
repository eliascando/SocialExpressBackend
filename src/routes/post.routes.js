const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const auth = require('../middlewares/auth');
const multer = require('multer');

//Guardar imagen del post por multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/posts');
    },
    filename: (req, file, cb) => {
        const fileName = `post-${Date.now()}.${file.originalname.toLowerCase().split(' ').join('-')}`;
        cb(null, fileName);
    }
});

const upload = multer({storage});

router.post('/save', auth, postController.savePost);
router.get('/get/:id',auth, postController.getPost);
router.get('/feed/:page?',auth, postController.feed);
router.get('/user/:id/:page?',auth, postController.getPostsByUser);
router.delete('/delete/:id/', auth, postController.deletePost);
router.post('/upload-image/:id', [auth, upload.single('post')], postController.uploadFile);
router.get('/get-image/:filename', postController.getFile);

module.exports = router;