const Joi = require('joi');

const search = {
  // search is GET, so use query
  query: {
    keyword: Joi.string().required(),
    term: Joi.string().allow('fall', 'spring', 'summer').default('fall'),
    year: Joi.number().integer().min(2000).max(new Date().getFullYear()).empty(['', null]).default(new Date().getFullYear()),
  },
};

module.exports = {
  search,
};
