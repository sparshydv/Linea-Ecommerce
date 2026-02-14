const express = require('express');
const { register, login, googleLogin, getCurrentUser } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', auth, getCurrentUser);

module.exports = router;
