const httpStatus = require('http-status');

const config = require('../config/config');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

// creates user if doesn't exist (as we already trust Firebase Auth)
const loginUser = catchAsync(async (req, res, next) => {
  const options = pick(req.body, ['email', 'token']);
  const loginRes = await userService.loginUser(options);

  if (!loginRes || !loginRes.accessToken || !loginRes.refreshToken) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User could not be logged in!');
  }

  const { id, email, accessToken, refreshToken } = loginRes;

  // store `refresh` JWT as secure HTTP-only, signed cookie
  res.cookie('refresh_jwt', refreshToken, {
    httpOnly: true, // Flags the cookie to be accessible only by the web server.
    maxAge: 30 * 24 * 60 * 60 * 1000, // expires in 30 days (in ms)
    secure: config.env !== 'development', // Marks the cookie to be used with HTTPS only.
    signed: config.env !== 'development', // Indicates if the cookie should be signed.
  });

  res.locals = { id, email, accessToken };
  next();
});

const deleteUser = catchAsync(async (req, res, next) => {
  const options = pick(req.body, ['email', 'token']);
  const deleted = await userService.deleteUser(options);

  if (!deleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist or could not be deleted');
  }

  res.locals = {};
  next();
});

module.exports = {
  login: loginUser,
  delete: deleteUser,
};
