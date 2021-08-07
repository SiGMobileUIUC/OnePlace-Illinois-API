const httpStatus = require('http-status');
const { Op } = require('sequelize');

const ApiError = require('../utils/ApiError');
const { Feed, Sections } = require('../models');
const { FeedItemType, FeedActionType } = require('../models/Feed.model');
const itemAttributes = require('./internal/itemAttributes');

function getFeedDataFromOptions(options) {
  const {
    email, course, section, action, attachmentUrl,
  } = options;
  const fullCode = `${course}_${section}`;
  let type;
  let body;
  let itemId;

  if (action === FeedActionType.created.newSubscriber) {
    type = FeedItemType.Section;
    body = `You subscribed to the section ${fullCode}`;
    itemId = fullCode;
  }

  return {
    email,
    section_full_code: fullCode,
    item_id: itemId,
    type,
    body,
    action,
    attachment_url: attachmentUrl,
  };
}

const list = async (options) => {
  try {
    const {
      email, course, section, page, per_page: perPage, only_feeds: onlyFeeds,
    } = options;

    const queryConds = { email };
    const includeTables = [];

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
        queryConds.section_full_code = `${course}_${section}`;
      } else {
        queryConds.section_full_code = { [Op.iLike]: `${course}%` }; // 'xyz%' is prefix xyz
      }
    } else if (section) {
      // use ENDS_WITH sql
      queryConds.section_full_code = { [Op.iLike]: `%${section}` }; // '%xyz' is suffix xyz
    }

    /*
        Get detailed section data for each feed in the feed list
     */
    if (!onlyFeeds) {
      // join on Feeds.section_full_code == Sections.full_code
      includeTables.push({
        model: Sections,
        required: true,
        attributes: itemAttributes.section,
      });
    }

    const dbOptions = {
      where: queryConds,
      attributes: itemAttributes.feed,
      include: includeTables,
      limit: Math.max(10, perPage), // min perPage is 10
      offset: Math.max(0, perPage * (page - 1)), // page starts at 1
      order: [['createdAt', 'desc']],
    };

    const feedItems = await Feed.findAll(dbOptions);

    // modify the key 'Section' (from JOIN) to 'sectionDetail'
    feedItems.forEach((feedItem) => {
      delete Object.assign(feedItem.dataValues, { ['sectionDetail']: feedItem.dataValues.Section }).Section;
    });

    return feedItems;
  } catch (e) {
    console.log(e);
    if (e instanceof ApiError) throw e;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

const create = async (options) => {
  try {
    const feedData = getFeedDataFromOptions(options);
    return await Feed.create(feedData);
  } catch (e) {
    console.log(e);
    if (e instanceof ApiError) throw e;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

module.exports = {
  list, create,
};
