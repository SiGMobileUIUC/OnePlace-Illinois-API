const express = require('express');

const validate = require('../../middlewares/validate');
const jwtAuthenticate = require('../../middlewares/auth');
const { feedValidation } = require('../../validations');
const { feedController } = require('../../controllers');

const router = express.Router();

router.get('/list', validate(feedValidation.list), jwtAuthenticate, feedController.list);
router.delete('/trash', validate(feedValidation.trash), jwtAuthenticate, feedController.trash);

module.exports = router;
