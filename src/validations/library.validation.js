const Joi = require('joi');

const search = {
  query: {
    course: Joi.string().optional(),
    section: Joi.number().optional(), // CRN
    only_active: Joi.boolean().optional().default(false), // get only active sections for user
  },
};

const add = {
  // POST use body
  body: {
    course: Joi.string().required(),
    section: Joi.number().required(), // CRN
  },
};

const drop = {
  body: {
    course: Joi.string().required(),
    // if section is not provided,
    // the given course & all its sections are dropped
    section: Joi.number().optional(), // CRN
  },
};

const activationSwitch = {
  body: {
    course: Joi.string().required(),
    section: Joi.number().required(), // CRN
  },
};

module.exports = {
  search, add, drop, activationSwitch,
};
