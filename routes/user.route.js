const express = require('express');

const controller = require('../controller/user.controller');

const authMiddleware = require('../middlewares/auth.middleware');

var router = express.Router();




router.get('/', controller.index); // authMiddleware.requireAuth
router.get('/signout', controller.signout);

module.exports = router;