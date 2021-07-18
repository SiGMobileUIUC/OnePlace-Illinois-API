const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { courseService } = require('../services');

const search = catchAsync(async (req, res) => {
  const options = pick(req.query, ['keyword', 'page', 'per_page', 'only_courses']);
  const courses = await courseService.searchCourses(options);

  if (!courses) {
    // throw new ApiError(httpStatus.NOT_FOUND, e.message);
    throw new ApiError(httpStatus.NOT_FOUND, 'No matching course found');
  }

  res.send({ courses });
});

module.exports = {
  search,
};
