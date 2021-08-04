const express = require('express');
const { jwtAuthenticate } = require('../../config/passport');
const { feedController } = require('../../controllers');

const router = express.Router();

router.get('/list', (_, __, next) => next(), jwtAuthenticate, feedController.get);

module.exports = router;
