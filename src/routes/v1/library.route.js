const express = require('express');

const { jwtAuthenticate } = require('../../config/passport');
const validate = require('../../middlewares/validate');
const { libraryValidation } = require('../../validations');
const { libraryController } = require('../../controllers');

const router = express.Router();

router.get('/search', validate(libraryValidation.search), jwtAuthenticate, libraryController.search);
router.post('/add', validate(libraryValidation.add), jwtAuthenticate, libraryController.add);
router.delete('/drop', validate(libraryValidation.drop), jwtAuthenticate, libraryController.drop);
router.post('/activate', validate(libraryValidation.activationSwitch), jwtAuthenticate, libraryController.activate);
router.post('/deactivate', validate(libraryValidation.activationSwitch), jwtAuthenticate, libraryController.deactivate);

module.exports = router;
