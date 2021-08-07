const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { feedService } = require('../services');

const get = catchAsync(async (req, res, next) => {
  const options = pick(req.query, ['course', 'section', 'page', 'per_page', 'only_feeds']);
  options.email = req.headers.JWT_USER_EMAIL;
  const records = await feedService.list(options);

  res.locals = { feed: records || [] };
  if (records.length === 0) res.locals.msg = 'No feed records for the user';

  next();
});

module.exports = {
  get,
};
