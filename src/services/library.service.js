const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const { Library, Courses, Sections } = require('../models');
const { FeedActionType } = require('../types/feed');
const FeedService = require('./feed.service');
const itemAttributes = require('./internal/itemAttributes');
const SectionService = require('./section.service')

async function checkCourseAndSection(course, section) {
  const prelimError = new ApiError(httpStatus.BAD_REQUEST, '');
  prelimError.name = 'invalid_course_or_section';

  // Check that course exists
  const courseExists = await Courses.findOne({ where: { fullCode: course } }); // e.g. CS124
  if (!courseExists) {
    prelimError.message = 'Course requested not found';
    throw prelimError;
  }

  // Check that section exists
  const sectionExists = await Sections.findOne({ where: { fullCode: `${course}_${section}` } }); // e.g. CS124_74477
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
    // TODO: Add pagination options since Library list can get long
    const {
      email, course, section, only_active: onlyActive, shallow_search: shallowSearch,
    } = options;

    const dbOptions = {
      attributes: itemAttributes.library,
      where: { email },
    };

    if (course) dbOptions.where.course = course;
    if (section) dbOptions.where.section = section;
    if (!shallowSearch) {
      // also grab section data related to each library item
      dbOptions.include = [{
        model: Sections,
        as: 'sectionData',
        required: true,
        attributes: itemAttributes.section,
      }];
    }

    // if: onlyActive is true, then: find records with is_active === true
    // else: get all active & inactive sections
    if (onlyActive) dbOptions.where.isActive = onlyActive;

    return await Library.findAll(dbOptions);
  } catch (e) {
    console.log(e);
    if (e instanceof ApiError) throw e;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

/**
 * Add a section to user's library
 * @param {object} options { email, course, section }, email is parsed from JWT
 * @returns {Promise<*>}
 */
const add = async (options) => {
  try {
    const { email, course, section } = options;

    await checkCourseAndSection(course, section);

    const fullCode = `${course}_${section}`;
    const condition = {
      email, course, section, fullCode, isActive: true,
    };

    const record = await Library.findOne({ where: condition });
    if (record) return { msg: 'already-exists' };

    const inserted = await Library.create(condition);

    await FeedService.create({
      email,
      course,
      section,
      action: FeedActionType.created.sectionSubscriber,
    });

    // TODO: cleanup unnecessary part of the data returned
    return inserted;
  } catch (e) {
    console.log(e);
    if (e.name === 'invalid_course_or_section') throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid course or section');
    if (e instanceof ApiError) throw e;
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

    // X: allow user to drop the whole course (and all of its sections) if only course is provided
    // For now, user must provide both course & section
    const dbOptions = { where: { email, course, section } };

    const dropCount = await Library.destroy(dbOptions);

    if (dropCount > 0) {
      /*
          At least one course-section was successfully deleted,
          so create 'deleted' Feed
       */
      //

      // const feedQuery = {
      //   email,
      //   sectionFullCode: `${course}_${section}`,
      //   type: FeedItemType.Section,
      //   action: FeedActionType.deleted.sectionSubscriber,
      // };
      //
      // await Feed.destroy({ where: feedQuery });

      return { count: dropCount };
    }

    return { count: dropCount, msg: 'no-match' };
  } catch (e) {
    console.log(e);
    if (e.name === 'invalid_course_or_section') throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid course or section');
    if (e instanceof ApiError) throw e;
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

    const conditions = {
      email, course, section, fullCode: `${course}_${section}`,
    };

    const record = await Library.findOne({ where: conditions });
    if (!record) throw new ApiError(httpStatus.BAD_REQUEST, 'No course-section available for user');

    await record.update({ isActive: shouldActivate });

    return { status: 'success', error: null, payload: {} };
  } catch (e) {
    console.log(e);
    if (e.name === 'invalid_course_or_section') throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid course or section');
    if (e instanceof ApiError) throw e;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

const activate = async (options) => activationSwitch(options, true);
const deactivate = async (options) => activationSwitch(options, false);

module.exports = {
  search, add, drop, activate, deactivate,
};
