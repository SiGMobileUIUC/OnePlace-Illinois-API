const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { sectionService } = require('../services');

const search = catchAsync(async (req, res, next) => {
  const options = pick(req.query, ['course', 'section']);
  const sections = await sectionService.searchSections(options);

  // READ (res.locals): https://stackoverflow.com/a/38355597
  res.locals = { sections };
  if (sections.length === 0) res.locals.msg = 'No section found for given criteria';

  next();
});

module.exports = {
  search,
};
