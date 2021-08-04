const express = require('express');

const jwtAuthenticate = require('../../middlewares/auth');
const { feedController } = require('../../controllers');

const router = express.Router();

router.get('/list', jwtAuthenticate, feedController.get);

module.exports = router;
