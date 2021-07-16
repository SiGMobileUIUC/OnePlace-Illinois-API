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
  full_code: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  course: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  // optionals
  code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  info: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  part_of_term: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  credit_hours: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  section_status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  enrollment_status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  start_time: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  end_time: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  days_of_week: {
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
