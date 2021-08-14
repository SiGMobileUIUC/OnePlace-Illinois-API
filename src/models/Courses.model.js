const { DataTypes } = require('sequelize');

module.exports = {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fullCode: {
    type: DataTypes.STRING,
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
  creditHours: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  degreeAttributes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  scheduleInfo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sectionInfo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
};
