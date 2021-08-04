const httpStatus = require('http-status');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const ServerJWT = require('../services/internal/serverJWT.service');

const jwtAuthenticate = async (req, res, next) => {
  // use signedCookies in production, just cookies otherwise.
  const refreshToken = config.env !== 'development' ? req.signedCookies.refresh_jwt : req.cookies.refresh_jwt;
  if (!refreshToken) return res.json({ error: 'Missing the refresh token, please login again' });

  let userEmailFromJWT;

  try {
    // 'jwt' implements 'jwtStrategy', which returns {err, email, key_id}
    passport.authenticate('jwt', { session: false }, async (err, userEmail, keyIdentifier) => {
      console.log(...args);
      if (err) {
        console.log(err);
        if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.NotBeforeError) {
          return res.json({ error: 'Invalid JWT token' });
        }

        if (err instanceof jwt.TokenExpiredError) {
          const verified = ServerJWT._verify(refreshToken, 'refresh');
          if (!verified) res.json({ error: 'Invalid refresh token, please login again' });

          try {
            userEmailFromJWT = jwt.decode().email; // decode returns only the payload
          } catch (e) {
            // next(e);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
          }

          // Issue new access token & proceed normally

          // TODO: rotate refreshing token on issuing new access token
          // Rotating enhances security (expires old token) AND extends the validity of the refresh token
          const accessJWT = await ServerJWT.issueAccessToken(userEmailFromJWT, keyIdentifier);
          req.headers.Authorization = `bearer ${accessJWT}`; // express http converts all headers to lower case.
        }
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
        // return next(err);
      }

      if (!userEmail && !userEmailFromJWT) return res.json({ error: 'Invalid user token authentication' });

      // everything good
      req.headers.JWT_USER_EMAIL = userEmail || userEmailFromJWT;
      next(); // jumps to the next middleware with (req, res, next) <-- req modified
    })(req, res, next);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
};

module.exports = jwtAuthenticate;
