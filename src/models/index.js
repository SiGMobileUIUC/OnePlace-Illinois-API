const { Sequelize } = require('sequelize');
const pgconf = require('../config/config').postgres;

const Subjects = require('./Subjects.model');
const Courses = require('./Courses.model');
const Sections = require('./Sections.model');
const Users = require('./Users.model');
const Library = require('./Library.model');
const AuthJWT = require('./AuthJWT.model');

const models = {
  Subjects, Courses, Sections, Users, Library, AuthJWT,
};

const sequelize = new Sequelize(pgconf.dbname, pgconf.user, pgconf.password, {
  host: pgconf.host,
  dialect: pgconf.dialect,
  pool: pgconf.pool,
  port: pgconf.sequelize_port,
  // logging: false,
});

Object.keys(models).forEach((modelName) => {
  models[modelName] = sequelize.define(modelName, models[modelName]);
});

/*
    Define Table Relations
 */
// Foreign Key (FK) from Course.subject to Subjects.code
models.Courses.belongsTo(models.Subjects, { foreignKey: 'subject', targetKey: 'code' });
// FK from Sections.course to Course.full_code
models.Sections.belongsTo(models.Courses, { foreignKey: 'course', targetKey: 'full_code' });
// FK from Library.user_email to Users.email
models.Library.belongsTo(models.Users, { foreignKey: 'email', targetKey: 'email' });
// FK from Library.course to Course.full_code (Subject+Course)
models.Library.belongsTo(models.Courses, { foreignKey: 'course', targetKey: 'full_code' });
// FK from Library.section to Section.full_code (Subject+Course+_+CRN)
models.Library.belongsTo(models.Sections, { foreignKey: 'full_code', targetKey: 'full_code' });

module.exports = { ...models, sequelize };
