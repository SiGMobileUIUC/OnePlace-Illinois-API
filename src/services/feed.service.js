const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const { Feed } = require('../models');
const { FeedItemType, FeedActionType } = require('../models/feed.model');


const list = async (options) => {
  try {
    const { email } = options;
    const records = await Feed.findAll({ where: { email } });
    
    if (!records) return { status: 'error', error: 'none-match', payload: null };

    return { status: 'success', error: null, payload: records };
  } catch (e) {
    console.log(e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};


function getFeedDataFromOptions(options) {
  const { email, course, section, action, attachmentUrl } = options;
  const fullCode = `${course}_${section}`;
  let type, body, itmeId;

  if (action === FeedActionType.created.newSubscriber) {
    type = FeedItemType.Section;
    body = `You subscribed to the section ${fullCode}`;
    itemId = fullCode;
  }

  return {
    email, section_full_code: fullCode, itemId,
    type, body, action, attachment_url,
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
