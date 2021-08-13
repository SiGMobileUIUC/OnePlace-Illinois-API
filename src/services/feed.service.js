const httpStatus = require('http-status');
const { Op } = require('sequelize');

const { Feed, Sections } = require('../models');
const { FeedItemType, FeedActionType } = require('../types/feed');
const ApiError = require('../utils/ApiError');
const { spaceOutCourseCode } = require('../utils/helpers');

const itemAttributes = require('./internal/itemAttributes');
const SectionService = require('./section.service');

async function getFeedDataFromOptions(options) {
  const {
    email, course, section, action, attachmentUrl,
  } = options;
  const fullCode = `${course}_${section}`;
  const courseCodeExpanded = spaceOutCourseCode(course);
  let type;
  let body;
  let itemId;
  let sectionCode = section;

  // Get relevant section data
  const sectionData = await SectionService.searchOne({ CRN: section }, { attributes: ['code'] });
  if (sectionData) {
    sectionCode = sectionData.code; // e.g. ABA, EL5, etc.
  }

  if (action === FeedActionType.created.sectionSubscriber) {
    type = FeedItemType.Section;
    body = `You subscribed to the section ${sectionCode} of ${courseCodeExpanded}`;
    itemId = fullCode;
  }

  return {
    email,
    sectionFullCode: fullCode,
    itemId,
    type,
    body,
    action,
    attachmentUrl,
    inTrash: false,
  };
}

const list = async (options) => {
  try {
    const {
      email, course, section, page, per_page: perPage, only_feeds: onlyFeeds,
    } = options;

    const queryConds = { email };

    /*
        QS: Course & Section (narrow down feed list search)
     */
    // if: qs `course` is provided
    // else if: qs `section` is provided AND NOT qs `course`
    if (course) {
      // if: qs `section` is also provided
      // else: only qs `course` is provided, use STARTS_WITH sql (equivalent in Sequelize)
      if (section) {
        // TODO: Check if escaping here is redundant
        // NOTE: No need for escaping input since Sequelize v4+ auto escapes
        queryConds.sectionFullCode = `${course}_${section}`;
      } else {
        queryConds.sectionFullCode = { [Op.iLike]: `${course}%` }; // 'xyz%' is prefix xyz
      }
    } else if (section) {
      // use ENDS_WITH sql
      queryConds.sectionFullCode = { [Op.iLike]: `%${section}` }; // '%xyz' is suffix xyz
    }

    /*
        Get detailed section data for each feed in the feed list
     */
    const dbOptions = {
      where: queryConds,
      attributes: itemAttributes.feed,
      limit: Math.max(10, perPage), // min perPage is 10
      offset: Math.max(0, perPage * (page - 1)), // page starts at 1
      order: [['createdAt', 'desc']],
    };

    if (!onlyFeeds) {
      // join on Feeds.sectionFullCode == Sections.fullCode
      dbOptions.include = [{
        model: Sections,
        as: 'sectionData',
        required: true,
        attributes: itemAttributes.section,
      }];
    }

    return (await Feed.findAll(dbOptions)).map((x) => x.get({ plain: true }));
  } catch (e) {
    console.log(e);
    if (e instanceof ApiError) throw e;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

const create = async (options) => {
  try {
    const feedData = await getFeedDataFromOptions(options);
    return await Feed.create(feedData);
  } catch (e) {
    console.log(e);
    if (e instanceof ApiError) throw e;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

const trash = async (options) => {
  try {
    const { id } = options;

    const record = await Feed.findOne({ where: { id } });
    if (!record) {
      return {
        status: 'success',
        error: null,
        msg: 'Specified feed record not found for the user',
        payload: {},
      };
    }

    await record.update({ inTrash: true });

    return { status: 'success', error: null, payload: {} };
  } catch (e) {
    console.log(e);
    if (e instanceof ApiError) throw e;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

module.exports = {
  list, create, trash,
};
