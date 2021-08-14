const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const { Sections } = require('../models');
const { isArray } = require('../utils/helpers');
const itemAttributes = require('./internal/itemAttributes');

const searchOne = async (options, internal = {}) => {
  try {
    const { CRN } = options;
    let { attributes } = internal;

    if (!isArray(attributes) || !attributes.length) attributes = itemAttributes.section;

    const dbCondition = { CRN };

    const dbOptions = {
      attributes,
      where: dbCondition,
      order: [['year', 'desc'], ['term', 'desc']], // term 'fall' should come before 'spring'
    };

    return await Sections.findOne(dbOptions);
  } catch (e) {
    console.log(e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

/**
 * Search sections on local Postgres
 * @param {object} options
 * @param {object} internal Used to deliver more options for internal calls (from other functions)
 * @returns {Promise<*|*>}
 */
const searchSections = async (options, internal = {}) => {
  try {
    const { course, section } = options;
    let { attributes } = internal;

    if (!isArray(attributes) || !attributes.length) attributes = itemAttributes.section;

    const dbCondition = {};

    // Allow User to supply one or both (none will be invalidated by Joi beforehand)
    // Course = ALL sections of that course
    // Section OR (Course + Section) = ONE section
    if (course) dbCondition.course = course;
    if (section) dbCondition.CRN = section;

    const dbOptions = {
      attributes,
      where: dbCondition,
      order: [['year', 'desc']],
    };

    return await Sections.findAll(dbOptions);
  } catch (e) {
    console.log(e);
    if (e instanceof ApiError) throw e;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

module.exports = {
  searchOne,
  searchSections,
};
