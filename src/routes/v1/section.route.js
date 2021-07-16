const express = require('express');
const validate = require('../../middlewares/validate');
const sectionValidation = require('../../validations/section.validation');
const sectionController = require('../../controllers/section.controller');

const router = express.Router();

router.get('/search', validate(sectionValidation.search), sectionController.search);

module.exports = router;
