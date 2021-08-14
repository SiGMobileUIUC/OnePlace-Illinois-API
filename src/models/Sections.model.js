const { DataTypes } = require('sequelize');

module.exports = {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  term: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  CRN: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fullCode: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  course: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // optionals
  code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  partOfTerm: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sectionTitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sectionStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sectionCreditHours: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  enrollmentStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  typeCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  startTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  endTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  daysOfWeek: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  room: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  building: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  instructors: {
    type: DataTypes.STRING,
    allowNull: true,
  },
};
