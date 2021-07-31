const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

// creates user if doesn't exist (as we already trust Firebase Auth)
const loginUser = catchAsync(async (req, res) => {
  const options = pick(req.body, ['email', 'token']);
  const loginRes = await userService.loginUser(options);

  if (!loginRes || !loginRes.accessToken || !loginRes.refreshToken) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User could not be logged in!');
  }

  res.send({ status: 'success', error: null, payload: loginRes });
});

const deleteUser = catchAsync(async (req, res) => {
  const options = pick(req.body, ['email', 'token']);
  const deleted = await userService.deleteUser(options);

  if (!deleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist or could not be deleted');
  }

  res.send({ status: deleted });
});

module.exports = {
  login: loginUser,
  delete: deleteUser,
};
