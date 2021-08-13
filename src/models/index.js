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

// FK from Sections.course to Course.full_code
models.Sections.belongsTo(models.Courses, { as: 'courseData', foreignKey: 'course', targetKey: 'full_code' });
models.Courses.hasMany(models.Sections, { foreignKey: 'course', targetKey: Sequelize.col('Courses.full_code') });

// FK from Library.user_email to Users.email
models.Library.belongsTo(models.Users, { as: 'userData', foreignKey: 'email', targetKey: 'email' });
// FK from Library.course to Course.full_code (Subject+Course)
models.Library.belongsTo(models.Courses, { as: 'courseData', foreignKey: 'course', targetKey: 'full_code' });
// FK from Library.section to Section.full_code (`Subject`+`Course`+`_`+`CRN`)
models.Library.belongsTo(models.Sections, { as: 'sectionData', foreignKey: 'full_code', targetKey: 'full_code' });

// FK from Feed.email to Users.email
models.Feed.belongsTo(models.Users, { as: 'userData', foreignKey: 'email', targetKey: 'email' });
// FK from Feed.section_full_code to Sections.full_code
models.Feed.belongsTo(models.Sections, { as: 'sectionData', foreignKey: 'section_full_code', targetKey: 'full_code' });

module.exports = { ...models, sequelize };
