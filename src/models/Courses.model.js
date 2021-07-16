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
  description: {
    type: DataTypes.TEXT('tiny'),
    allowNull: false,
  },
};
