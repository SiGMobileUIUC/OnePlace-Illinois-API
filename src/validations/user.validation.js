const Joi = require('joi');

const { jwtRegex } = require('./custom.validation');

const loginUser = {
  body: {
    email: Joi.string().required().email(),
    token: Joi.string().required().regex(jwtRegex), // idToken (JWT) from Firebase Auth
  },
};

const deleteUser = {
  // express http converts all headers to lower case.
  // headers: {
  //   Authorization: Joi.string().required().custom(bearerJWT()), // access JWT issued from our server
  // },
  body: {
    email: Joi.string().required().email(),
    token: Joi.string().required().regex(jwtRegex), // idToken (JWT) from Firebase Auth
  },
};

module.exports = {
  login: loginUser,
  delete: deleteUser,
};
