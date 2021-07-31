const { DataTypes } = require('sequelize');

module.exports = {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  // name: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  // },
  // from Firebase Authentication JWT token
  uid: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  last_login: {
    type: 'TIMESTAMP',
    // defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false,
  },
  // should be the same as Server token's expiration time
  login_expiration: {
    type: 'TIMESTAMP',
    allowNull: false,
  },
};
