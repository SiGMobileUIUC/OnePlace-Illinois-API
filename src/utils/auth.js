const httpStatus = require('http-status');

const ApiError = require('./ApiError');

/**
 * Extract Bearer token from req.header
 * @param req
 */
// ** express makes everything lowercase (authorization, but NOT Bearer)
const getBearerTokenFromHeaders = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader.startsWith('Bearer ')) throw new ApiError(httpStatus.BAD_REQUEST, 'Missing bearer token');

  const jwtToken = authHeader.substring(7, authHeader.length);
  if (jwtToken.trim() === '') throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid bearer token');

  return jwtToken;
};

module.exports = { getBearerTokenFromHeaders };
