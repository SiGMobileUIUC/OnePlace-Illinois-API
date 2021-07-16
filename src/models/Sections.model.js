const { DataTypes } = require('sequelize');

module.exports = {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  CRN: {
    type: DataTypes.INT,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  course: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  part_of_term: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  credit_hours: {
    type: DataTypes.INTEGER,
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
