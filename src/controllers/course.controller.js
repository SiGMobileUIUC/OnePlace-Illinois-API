const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { courseService } = require('../services');

const search = catchAsync(async (req, res) => {
  console.log(req.query)
  const options = pick(req.query, ['keyword', 'year', 'term']);
  const courses = await courseService.searchCourses(options);

  if (!courses) {
    throw new ApiError(httpStatus.NOT_FOUND, e.message);
  }

  res.send({ courses });
});

module.exports = {
  search,
};
