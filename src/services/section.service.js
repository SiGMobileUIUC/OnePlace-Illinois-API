const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const { Sections } = require('../models');
const { isArray } = require('../utils');

/**
 * Search sections on local Postgres
 * @param {object} options
 * @param {object} internal Used to deliver more options for internal calls (from other functions)
 * @returns {Promise<*|*>}
 */
const searchSections = async (options, internal = {}) => {
  try {
    const { code } = options;
    let { attributes } = internal;

    if (!isArray(attributes) || !attributes.length) {
      attributes = ['year', 'term', 'CRN', 'full_code', 'course', 'code', 'title', 'info', 'part_of_term', 'credit_hours', 'section_status', 'enrollment_status', 'type', 'type_code', 'start_time', 'end_time', 'days_of_week', 'room', 'building', 'instructors'];
    }

    const codeLetters = code.replace(/[0-9]/g, '');
    const codeDigits = code.replace(/[a-zA-Z]/g, '');
    const courseCode = `${codeLetters}_${codeDigits}`;

    const dbOptions = {
      attributes,
      where: { course: courseCode },
      order: [
        ['year', 'desc'],
      ],
    };

    return await Sections.findAll(dbOptions);
  } catch (e) {
    console.log(e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

module.exports = {
  searchSections,
};
