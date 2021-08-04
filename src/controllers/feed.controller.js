const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { feedService } = require('../services');

const get = catchAsync(async (req, res, next) => {
  const options = { email: req.headers.JWT_USER_EMAIL };
  const resJSON = await feedService.list(options);

  // TODO: change response on no resJSON
  if (!resJSON) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No feed found for user');
  }

  res.locals = resJSON;
  next();
});

module.exports = {
  get,
};
