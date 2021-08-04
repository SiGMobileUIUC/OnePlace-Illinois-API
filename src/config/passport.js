const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');

const config = require('./config');
const { Users } = require('../models');
const ServerJWT = require('../services/internal/serverJWT.service');

// TODO: check the performance of fetching signing key from DB for every request
function getJwtSigningKey(req, rawJwtToken, done) {
  try {
    const decoded = jwt.decode(rawJwtToken, { complete: true });
    const keyIdentifier = decoded.header.kid;
    ServerJWT._verifySigningKey(keyIdentifier).then((signingKey) => done(null, signingKey));
  } catch (e) {
    console.log(e);
    done(e, null);
  }
}

/**
 * Verifies that decoded JWT's email is in record
 * @param decoded Decoded complete JWT
 * @param done
 * @returns {Promise<error, email, key_identifier>}
 */
async function jwtVerify(decoded, done) {
  /*
    decoded_example = {
      header: { alg: 'HS256', typ: 'JWT', kid: 'this_key_is_rad' },
      payload: {
        email: 'example@example.com',
          iat: 1627661616,
          exp: 1630253616,
          aud: 'refresh',
          iss: 'http://example.com',
          sub: 'just_random_uid'
      },
      signature: 'inMlcU8EJM0FfypVzvElUF2G9ZyiZo8rQ4-Lswlv46U',
    }
   */
  const { header, payload } = decoded;
  try {
    const userID = payload.sub;
    const userRecord = await Users.findOne({ where: { _id: userID }, attributes: ['email'] });
    if (!userRecord || !userRecord.email) throw new Error('No user record found for token');

    done(null, userRecord.email, header.kid);
  } catch (e) {
    console.log(e);
    done(e, null, null);
  }
}

const jwtOptions = {
  secretOrKeyProvider: getJwtSigningKey,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // READ: https://github.com/mikenicholson/passport-jwt/blob/96a6e5565ba5a6f3301d91959a0f646e54446388/lib/strategy.js#L59
  jsonWebTokenOptions: {
    issuer: config.jwt.issuer,
    audience: 'access',
    complete: true, // return all data {header, payload, signature}
  },
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = { jwtStrategy };
