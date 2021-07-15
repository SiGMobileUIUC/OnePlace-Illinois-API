const express = require('express');
const validate = require('../../middlewares/validate');
const courseValidation = require('../../validations/course.validation');
const courseController = require('../../controllers/course.controller');

const router = express.Router();

router.get('/search', validate(courseValidation.search), courseController.search);

module.exports = router;
