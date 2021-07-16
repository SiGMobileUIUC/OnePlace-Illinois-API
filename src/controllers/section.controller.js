const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { sectionService } = require('../services');

const search = catchAsync(async (req, res) => {
  const options = pick(req.query, ['code']);
  const sections = await sectionService.searchSections(options);

  if (!sections) {
    // throw new ApiError(httpStatus.NOT_FOUND, e.message);
    throw new ApiError(httpStatus.NOT_FOUND, `No matching section for course ${options.code} found`);
  }

  res.send({ sections });
});

module.exports = {
  search,
};
