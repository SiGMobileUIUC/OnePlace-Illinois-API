const express = require('express');

const validate = require('../../middlewares/validate');
// const jwtAuthenticate = require('../../middlewares/auth');
const { userValidation } = require('../../validations');
const { userController } = require('../../controllers');

const router = express.Router();

router.post('/login', validate(userValidation.login), userController.login);
// router.delete('/delete', validate(userValidation.delete), jwtAuthenticate, userController.delete);

module.exports = router;
