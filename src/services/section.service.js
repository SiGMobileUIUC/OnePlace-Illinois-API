const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const { Sections } = require('../models');

/**
 * Search sections on local Postgres
 * @param options
 * @returns {Promise<*|*>}
 */
const searchSections = async (options) => {
  try {
    const { code } = options;

    const codeLetters = code.replace(/[0-9]/g, '');
    const codeDigits = code.replace(/[a-zA-Z]/g, '');
    const courseCode = `${codeLetters}_${codeDigits}`;

    const dbOptions = {
      attributes: ['year', 'term', 'CRN', 'full_code', 'course', 'code', 'title', 'info', 'part_of_term', 'credit_hours', 'section_status', 'enrollment_status', 'type', 'type_code', 'start_time', 'end_time', 'days_of_week', 'room', 'building', 'instructors'],
      where: { course: courseCode },
      order: [
        ['year', 'desc'],
      ],
    };

    /*
        Search and refine matched courses
     */

    let sections = await Sections.findAll(dbOptions);
    // courses = courses.map((course) => ({
    //   subjectId: course.subject,
    //   subjectNumber: course.code,
    //   name: course.name,
    // }));

    return sections;
  } catch (e) {
    console.log(e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

module.exports = {
  searchSections,
};
