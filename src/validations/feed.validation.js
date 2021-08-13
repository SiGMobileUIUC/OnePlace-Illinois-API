const Joi = require('joi');

const list = {
  query: {
    course: Joi.string().optional(), // e.g. CS124
    section: Joi.number().optional(), // CRN, e.g. 74477
    page: Joi.number().integer().min(1).optional().default(1),
    per_page: Joi.number().integer().min(10).max(30).optional().default(15),
    // return details of the feed item, e.g. section data for section-related feed
    only_feeds: Joi.boolean().optional().default(true),
  },
};

module.exports = {
  list,
};
