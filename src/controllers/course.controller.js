const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { courseService } = require('../services');

const search = catchAsync(async (req, res, next) => {
  const options = pick(req.query, ['keyword', 'page', 'per_page', 'only_courses']);
  const courses = await courseService.searchCourses(options);

  res.locals = { courses };
  if (courses.length === 0) res.locals.msg = 'No course found for given criteria';

  next();
});

module.exports = {
  search,
};
