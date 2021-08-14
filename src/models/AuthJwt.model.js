const { DataTypes } = require('sequelize');

module.exports = {
  identifier: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  signing_key: {
    type: DataTypes.TEXT, // signing key is (base64 of 256 byte Buffer) > varchar(255)
    allowNull: false,
  },
};
