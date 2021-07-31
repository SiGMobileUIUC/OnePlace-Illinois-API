const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const { Sections } = require('../models');
const { isArray } = require('../utils');

const sectionAttributes = ['year', 'term', 'CRN', 'full_code', 'course', 'code', 'part_of_term', 'section_title', 'section_status', 'section_credit_hours', 'enrollment_status', 'type', 'type_code', 'start_time', 'end_time', 'days_of_week', 'room', 'building', 'instructors'];

const searchOne = async (options, internal = {}) => {
  try {
    const { code, CRN } = options;
    let { attributes } = internal;

    if (!isArray(attributes) || !attributes.length) attributes = sectionAttributes;

    // const codeLetters = code.replace(/[0-9]/g, '');
    // const codeDigits = code.replace(/[a-zA-Z]/g, '');
    // const courseCode = `${codeLetters}${codeDigits}`;

    const dbCondition = { course: code };
    if (typeof CRN === 'number') dbCondition.CRN = CRN;

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
    const { code, CRN } = options;
    let { attributes, justOne } = internal;

    if (!isArray(attributes) || !attributes.length) attributes = sectionAttributes;
    if (typeof justOne !== 'boolean') justOne = false;

    // const codeLetters = code.replace(/[0-9]/g, '');
    // const codeDigits = code.replace(/[a-zA-Z]/g, '');
    // const courseCode = `${codeLetters}_${codeDigits}`;

    const dbCondition = { course: code };
    if (typeof CRN === 'number') dbCondition.CRN = CRN;

    const dbOptions = {
      attributes,
      where: dbCondition,
      order: [['year', 'desc']],
    };

    return justOne ? Sections.findOne(dbOptions) : Sections.findAll(dbOptions);
  } catch (e) {
    console.log(e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

module.exports = {
  searchOne,
  searchSections,
};
