const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const { Feed } = require('../models');


const list = async (options) => {
  try {
    const { email } = options;
    const records = await Feed.findAll({
      where: {
        user_email: email,
      },
    });
    
    if (!records) return { status: 'error', error: 'none-match', payload: null };

    return { status: 'success', error: null, payload: records };
  } catch (e) {
    console.log(e);
    if (e.name === 'invalid_course_or_section') throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid course or section');
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

module.exports = {
  list,
};
