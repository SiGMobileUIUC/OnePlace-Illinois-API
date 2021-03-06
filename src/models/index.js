const { Sequelize } = require('sequelize');
const pgconf = require('../config/config').postgres;

const AuthJWT = require('./AuthJwt.model');
const Courses = require('./Courses.model');
const Feed = require('./Feed.model');
const Library = require('./Library.model');
const Sections = require('./Sections.model');
const Subjects = require('./Subjects.model');
const Users = require('./Users.model');

const models = {
  AuthJWT, Courses, Feed, Library, Sections, Subjects, Users,
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
    ** do both 'belongsTo' and 'hasMany' to strongly define the relationship
    ** use Sequelize.col('Table.Column') for hasMany to avoid ambiguous relations (ie. tables have same-name cols)
 */
// Foreign Key (FK) from Course.subject to Subjects.code
models.Courses.belongsTo(models.Subjects, { as: 'subjectData', foreignKey: 'subject', targetKey: 'code' });
models.Subjects.hasMany(models.Courses, { foreignKey: 'subject', targetKey: Sequelize.col('Subjects.code') });

// FK from Sections.course to Course.fullCode
models.Sections.belongsTo(models.Courses, { as: 'courseData', foreignKey: 'course', targetKey: 'fullCode' });
models.Courses.hasMany(models.Sections, { foreignKey: 'course', targetKey: Sequelize.col('Courses.fullCode') });

// FK from Library.user_email to Users.email
models.Library.belongsTo(models.Users, { as: 'userData', foreignKey: 'email', targetKey: 'email' });
// FK from Library.course to Course.fullCode (Subject+Course)
models.Library.belongsTo(models.Courses, { as: 'courseData', foreignKey: 'course', targetKey: 'fullCode' });
// FK from Library.fullCode to Section.fullCode (`Subject`+`Course`+`_`+`CRN`)
models.Library.belongsTo(models.Sections, { as: 'sectionData', foreignKey: 'fullCode', targetKey: 'fullCode' });

// FK from Feed.email to Users.email
models.Feed.belongsTo(models.Users, { as: 'userData', foreignKey: 'email', targetKey: 'email' });
// FK from Feed.sectionFullCode to Sections.fullCode
models.Feed.belongsTo(models.Sections, { as: 'sectionData', foreignKey: 'sectionFullCode', targetKey: 'fullCode' });

module.exports = { ...models, sequelize };
