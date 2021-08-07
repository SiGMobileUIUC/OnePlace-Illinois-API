const httpStatus = require('http-status');
const CustomStrategy = require('passport-custom').Strategy;
const jwt = require('jsonwebtoken');

const config = require('./config');
const ApiError = require('../utils/ApiError');
const { getBearerTokenFromHeaders } = require('../utils/auth');
const { Users } = require('../models');
const ServerJWT = require('../services/internal/serverJwt');

// TODO: check the performance of fetching signing key from DB for every request (use Redis if possible)
async function getJwtSigningKey(token) {
  try {
    const decoded = jwt.decode(token, { complete: true });
    const keyIdentifier = decoded.header.kid;
    return await ServerJWT._verifySigningKey(keyIdentifier); // returns signing key
  } catch (e) {
    console.log(e);
    throw e;
  }
}

const jwtVerifyOpts = {
  issuer: config.jwt.issuer,
  audience: 'access',
  complete: true, // return all data {header, payload, signature}
};

const jwtStrategyFunction = async (req, done) => {
  try {
    const jwtToken = getBearerTokenFromHeaders(req);

    /*
        Get signing key and verify JWT integrity
     */
    const signingKey = await getJwtSigningKey(jwtToken);
    if (!signingKey) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid key identifier provided for signing key');

    const decoded = jwt.verify(jwtToken, signingKey, jwtVerifyOpts);

    /*
        Validate JWT against expected data value (ie. token's email is in DB)
        and retrieve needed info
     */
    const { header, payload } = decoded;
    const userID = payload.sub;
    const userRecord = await Users.findOne({ where: { _id: userID }, attributes: ['email'] });
    if (!userRecord || !userRecord.email) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email in token');

    done(null, userRecord.email, header.kid);
  } catch (e) {
    // console.log(e);
    if (
      e instanceof ApiError || e instanceof jwt.JsonWebTokenError
      || e instanceof jwt.NotBeforeError || e instanceof jwt.TokenExpiredError) {
      done(e, null, null);
    } else {
      console.log(e);
      done(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'), null, null);
    }
  }
};

const jwtStrategy = new CustomStrategy(jwtStrategyFunction);

module.exports = { jwtStrategy };
