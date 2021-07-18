const Joi = require('joi');

const search = {
  // search is GET, so use query
  query: {
    keyword: Joi.string().required(),
    // page starts at 1
    page: Joi.number().integer().min(1).optional().default(1),
    per_page: Joi.number().integer().min(10).max(30).optional().default(15),
    only_courses: Joi.boolean().optional().default(false),
    // term: Joi.string().allow('fall', 'spring', 'summer').default('fall'),
    // year: Joi.number().integer().min(2000).max(new Date().getFullYear()).empty(['', null]).default(new Date().getFullYear()),
  },
};

module.exports = {
  search,
};
