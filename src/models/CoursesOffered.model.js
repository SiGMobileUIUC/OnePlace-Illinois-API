const { DataTypes } = require('sequelize');

module.exports = {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  course: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  term: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};
