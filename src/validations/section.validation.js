const Joi = require('joi');

const search = {
  // search is GET, so use query
  query: {
    code: Joi.string().required(), // e.g. CS124
    CRN: Joi.number().optional(), // e.g. 74477
    // term: Joi.string().allow('fall', 'spring', 'summer').default('fall'),
    // year: Joi.number().integer().min(2000).max(new Date().getFullYear()).empty(['', null]).default(new Date().getFullYear()),
  },
};

module.exports = {
  search,
};
