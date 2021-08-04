const httpStatus = require('http-status');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const ServerJWT = require('../services/internal/serverJWT.service');

const jwtAuthenticate = async (req, res, next) => {
  // First, check that refresh token exists in signed cookie.
  // ** use signedCookies in production, just cookies otherwise.
  const refreshToken = config.env !== 'development' ? req.signedCookies.refresh_jwt : req.cookies.refresh_jwt;
  if (!refreshToken) return res.json({ error: 'Missing the refresh token, please login again' });

  try {
    // 'jwt' implements 'jwtStrategy', which returns {err, email, key_id}
    passport.authenticate('jwt', { session: false }, async (err, _userEmail, keyIdentifier) => {
      let userEmail = _userEmail;
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          // Expired access token.
          // Check for refresh token in the signed cookie and issue a new access token
          // if the refresh token is valid.

          const isVerified = await ServerJWT._verify(refreshToken, 'refresh');
          if (!isVerified) res.json({ error: 'Invalid refresh token, please login again' });

          try {
            userEmail = jwt.decode(refreshToken).email; // decode returns only the payload
          } catch (e) {
            return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e.message));
          }

          // Issue new access token & proceed normally

          // TODO: rotate refreshing token on issuing new access token
          // Rotating enhances security (expires old token) AND extends the validity of the refresh token
          const accessJWT = await ServerJWT.issueAccessToken(userEmail, keyIdentifier);
          req.headers.authorization = `Bearer ${accessJWT}`; // express http converts all headers to lower case.
          req.headers.auth_renewed = true;
        } else {
          // Undesired error! Pass it on to client (show).
          return next(err);
        }
      }

      if (!userEmail) return next(new ApiError(httpStatus.BAD_REQUEST, 'Invalid user token authentication'));

      // Everything good.
      // Pass user's email in req headers since we need it in the requested actions
      // to link which user needs the action done (retrieved from JWT)
      req.headers.JWT_USER_EMAIL = userEmail;
      next(); // jumps to the next middleware with (req, res, next) <-- req modified
    })(req, res, next);
  } catch (e) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e));
  }
};

module.exports = jwtAuthenticate;
