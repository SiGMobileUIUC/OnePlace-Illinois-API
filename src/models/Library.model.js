const { DataTypes } = require('sequelize');

module.exports = {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  course: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  section: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fullCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defautValue: true,
  },
};
