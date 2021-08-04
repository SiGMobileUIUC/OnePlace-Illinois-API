const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const { Feed, Sections } = require('../models');
const { FeedItemType, FeedActionType } = require('../models/feed.model');


const list = async (options) => {
  try {
    const { email } = options;
    const records = await Feed.findAll({ where: { email }, include: Sections },);

    if (!records) return { status: 'error', error: 'none-match', payload: null };

    return { status: 'success', error: null, payload: records };
  } catch (e) {
    console.log(e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};


function getFeedDataFromOptions(options) {
  const { email, course, section, action, postDate, attachmentUrl } = options;
  const fullCode = `${course}_${section}`;
  let type, body, itemId;

  if (action === FeedActionType.created.newSubscriber) {
    type = FeedItemType.Section;
    body = `You subscribed to the section ${fullCode}`;
    itemId = fullCode;
  }

  return {
    email,
    section_full_code: fullCode,
    item_id: itemId,
    post_date: postDate,
    type,
    body,
    action,
    attachment_url: attachmentUrl,
  };
}


const create = async (options) => {
  try {
    const feedData = getFeedDataFromOptions(options);
    return await Feed.create(feedData);
  } catch (e) {
    console.log(e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};


module.exports = {
  list, create,
};
