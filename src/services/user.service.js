const httpStatus = require('http-status');
const { literal } = require('sequelize');
const { addDays } = require('date-fns');
const jwt = require('jsonwebtoken');

const ApiError = require('../utils/ApiError');
const { Users } = require('../models');
const { verifyUserWithIDToken } = require('./internal/userAuth');
const ServerJWT = require('./internal/serverJwt');

const loginUser = async (options) => {
  try {
    const { email, token } = options;
    const lastLogin = literal('CURRENT_TIMESTAMP');
    const loginExpiration = addDays(new Date(), 30);
    const decodedIDToken = await verifyUserWithIDToken(email, token);
    const { user_id: uid } = decodedIDToken; // id of the user to whom the ID token belongs (`uid` is same as `sub`)

    const res = await Users.upsert({
      email, uid, last_login: lastLogin, login_expiration: loginExpiration,
    });
    const userRecord = res[0].dataValues;

    if (!userRecord._id) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');

    const accessToken = await ServerJWT.issueAccessToken(email);
    const refreshToken = await ServerJWT.issueRefreshToken(email);

    return { id: userRecord._id, email: userRecord.email, accessToken, refreshToken };
  } catch (e) {
    console.log(e);
    if (e instanceof ApiError) throw e;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

const deleteUser = async (options) => {
  try {
    const { email, token } = options;

    // TODO: verify user access with token before deleting

    const decodedIDToken = verifyUserWithIDToken(email, token);

    return await Users.destroy({ where: { email } });
  } catch (e) {
    console.log(e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

module.exports = {
  loginUser, deleteUser,
};
