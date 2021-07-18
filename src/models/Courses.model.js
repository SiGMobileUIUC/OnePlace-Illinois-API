const { DataTypes } = require('sequelize');

module.exports = {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  subject: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  code: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  full_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // optional
  description: {
    type: DataTypes.TEXT, // Postgres doesn't support text with option (e.g. tinytext)
    allowNull: true,
  },
  credit_hours: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  degree_attributes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  schedule_info: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  section_info: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
};