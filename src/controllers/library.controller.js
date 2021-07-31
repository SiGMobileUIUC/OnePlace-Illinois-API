const httpStatus = require('http-status');

const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { libraryService } = require('../services');

const search = catchAsync(async (req, res) => {
  const options = pick(req.query, ['course', 'section', 'only_active']);
  options.email = req.headers.JWT_USER_EMAIL;
  const library = await libraryService.search(options);

  if (!library) {
    // throw new ApiError(httpStatus.NOT_FOUND, e.message);
    throw new ApiError(httpStatus.NOT_FOUND, 'No matching library found for user');
  }

  res.send({ library });
});

const add = catchAsync(async (req, res) => {
  const options = pick(req.body, ['course', 'section']);
  options.email = req.headers.JWT_USER_EMAIL;
  const resJSON = await libraryService.add(options);

  // TODO: change response on no resJSON
  if (!resJSON) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No library found for user');
  }

  res.send(resJSON);
});

const drop = catchAsync(async (req, res) => {
  const options = pick(req.body, ['course', 'section']);
  options.email = req.headers.JWT_USER_EMAIL;
  const resJSON = await libraryService.drop(options);

  // TODO: change response on no resJSON
  if (!resJSON) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No matching library course-section found for user');
  }

  res.send(resJSON);
});

const activate = catchAsync(async (req, res) => {
  const options = pick(req.body, ['course', 'section']);
  options.email = req.headers.JWT_USER_EMAIL;
  const resJSON = await libraryService.activate(options);

  // TODO: change response on no resJSON
  if (!resJSON) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No matching library course-section found for user');
  }

  res.send(resJSON);
});

const deactivate = catchAsync(async (req, res) => {
  const options = pick(req.body, ['course', 'section']);
  options.email = req.headers.JWT_USER_EMAIL;
  const resJSON = await libraryService.deactivate(options);

  // TODO: change response on no resJSON
  if (!resJSON) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No matching library course-section found for user');
  }

  res.send(resJSON);
});

module.exports = {
  search, add, drop, activate, deactivate,
};
