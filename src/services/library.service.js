const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const { Library, Courses, Sections, Feed } = require('../models');
const { FeedItemType, FeedActionType } = require('../models/Feed.model');
const FeedService = require('./feed.service');


async function checkCourseAndSection(course, section) {
  const prelimError = new ApiError(httpStatus.BAD_REQUEST, '');
  prelimError.name = 'invalid_course_or_section';

  // Check that course exists
  const courseExists = await Courses.findOne({ where: { full_code: course } }); // e.g. CS124
  if (!courseExists) {
    prelimError.message = 'Course requested not found';
    throw prelimError;
  }

  // Check that section exists
  const sectionExists = await Sections.findOne({ where: { full_code: `${course}_${section}` } }); // e.g. CS124_77401
  if (!sectionExists) {
    prelimError.message = 'Section requested not found';
    throw prelimError;
  }

  return true;
}

/*

    Note that access is already checked with Passport JWT middleware
    So no need to check any access here (email is retrieved from the valid JWT token)

 */

/**
 * Search User's Library. Can be filtered in with course and section.
 * @param {object} options { email, course?, section? }, email is parsed from JWT
 * @returns {Promise<{payload: {count: *}, error: null, status: string}|{payload: {}, error: null, status: string}>}
 */
const search = async (options) => {
  try {
    const { email, course, section, only_active: onlyActive } = options;

    const dbOptions = { attributes: ['course', 'section', 'createdAt'], where: { email } };

    if (course) dbOptions.where.course = course;
    if (section) dbOptions.where.section = section;

    if (onlyActive) { // if onlyActive == true
      dbOptions.where.is_active = onlyActive;
    } else {
      dbOptions.attributes.push('is_active');
    }

    return await Library.findAll(dbOptions);
  } catch (e) {
    console.log(e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

/**
 * Add a section to user's library
 * @param {object} options { email, course, section }, email is parsed from JWT
 * @returns {Promise<{payload: {count: *}, error: null, status: string}|{payload: {}, error: null, status: string}>}
 */
const add = async (options) => {
  try {
    const { email, course, section } = options;

    await checkCourseAndSection(course, section);

    const full_code = `${course}_${section}`;
    const condition = { email, course, section, full_code, is_active: true };

    const record = await Library.findOne({ where: condition });
    if (record) return { status: 'already-exists', error: null, payload: {} };

    const inserted = await Library.create(condition);

    await FeedService.create({
      email, course, section,
      postDate: new Date(),
      action: FeedActionType.created.newSubscriber,
    });

    // TODO: cleanup unnecessary part of the data returned
    return { status: 'success', error: null, payload: inserted };
  } catch (e) {
    console.log(e);
    if (e.name === 'invalid_course_or_section') throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid course or section');
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

/**
 * Drop a section from user's library
 * @param {object} options { email, course, section? }, email is parsed from JWT
 * @returns {Promise<{payload: {count: *}, error: null, status: string}|{payload: {}, error: null, status: string}>}
 */
const drop = async (options) => {
  try {
    const { email, course, section } = options;

    await checkCourseAndSection(course, section);

    // allow user to drop the whole course (and all of its sections) if only course is provided
    const dbOptions = { where: { email, course } };
    if (section) dbOptions.where.section = section;

    const dropCount = await Library.destroy(dbOptions);

    if (dropCount > 0) {
      // at least one course-section was successfully deleted

      const feedQuery = {
        email,
        section_full_code: `${course}_${section}`,
        type: FeedItemType.Section,
        action: FeedActionType.created.newSubscriber,
      };

      await Feed.destroy({ where: feedQuery });

      return { status: 'success', error: null, payload: { count: dropCount } };
    }

    return { status: 'no-match', error: null, payload: {} };
  } catch (e) {
    console.log(e);
    if (e.name === 'invalid_course_or_section') throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid course or section');
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

/**
 * De/Activate a section in user's library
 * @param {object} options { email, course, section }, email is parsed from JWT
 * @param {bool} shouldActivate
 * @returns {Promise<{payload: {}, error: null, status: string}>}
 */
const activationSwitch = async (options, shouldActivate) => {
  try {
    const { email, course, section } = options;

    await checkCourseAndSection(course, section);

    const condition = { email, course, section, full_code: `${course}_${section}` };

    const record = await Library.findOne({ where: condition });
    if (!record) throw new ApiError(httpStatus.BAD_REQUEST, 'No course-section available for user');

    const switchRes = await record.update({ is_active: shouldActivate });

    return { status: 'success', error: null, payload: {} };
  } catch (e) {
    console.log(e);
    if (e.name === 'invalid_course_or_section') throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid course or section');
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

const activate = async (options) => activationSwitch(options, true);
const deactivate = async (options) => activationSwitch(options, false);

module.exports = {
  search, add, drop, activate, deactivate,
};
