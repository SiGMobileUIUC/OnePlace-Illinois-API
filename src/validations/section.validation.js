const Joi = require('joi');

const search = {
  // require one of two fields be non-empty
  query: Joi.object().keys({
    course: Joi.string(), // e.g. CS124
    section: Joi.number(), // CRN, e.g. 74477
  }).or('course', 'section'),
};

module.exports = {
  search,
};
