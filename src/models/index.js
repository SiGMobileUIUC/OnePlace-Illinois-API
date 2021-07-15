const { Sequelize } = require('sequelize');
const pgconf = require('../config/config').postgres;

const Subjects = require('./Subjects.model');
const Courses = require('./Courses.model');

const models = { Subjects, Courses };

const sequelize = new Sequelize(pgconf.dbname, pgconf.user, pgconf.password, {
  host: pgconf.host,
  dialect: pgconf.dialect,
  pool: pgconf.pool,
});

Object.keys(models).forEach((modelName) => {
  models[modelName] = sequelize.define(modelName, models[modelName]);
});

module.exports = { ...models, sequelize };
