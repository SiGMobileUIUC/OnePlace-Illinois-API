const express = require('express');
const validate = require('../../middlewares/validate');
const { courseValidation } = require('../../validations');
const { courseController } = require('../../controllers');

const router = express.Router();

router.get('/search', validate(courseValidation.search), courseController.search);

module.exports = router;
