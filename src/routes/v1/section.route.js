const express = require('express');
const validate = require('../../middlewares/validate');
const { sectionValidation } = require('../../validations');
const { sectionController } = require('../../controllers');

const router = express.Router();

router.get('/search', validate(sectionValidation.search), sectionController.search);

module.exports = router;
