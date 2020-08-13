const express = require('express');

const controller = require('../controller/auth.controller');

var router = express.Router();

router.get('/login', controller.login);

router.post('/login', controller.postLogin)
// 1.1 gọi router để kết nối controller với view
router.get('/signup', controller.signup)
// 3.1 gọi router để kết nối controller với view
router.post('/signup', controller.postSignup)

router.get('/forgetpw', controller.forgetPw);

router.post('/forgetpw', controller.postForgetPw)

router.get('/active', controller.active);

router.post('/active', controller.postActive);

