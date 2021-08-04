const catchAsync = require('../utils/catchAsync');
const { getBearerTokenFromHeaders } = require('../utils/auth');

/**
 * Final middleware before sending response to user
 */
const finalResponder = catchAsync(async (req, res) => {
  // READ: http://expressjs.com/en/api.html#res.locals
  const resJSON = res.locals;

  // Check if access token was renewed silently. If so,
  // return it to the client.
  if (req.headers.auth_renewed) {
    if (!resJSON.payload) resJSON.payload = {};
    resJSON.payload.accessToken = getBearerTokenFromHeaders(req);
  }

  res.send(resJSON);
});

module.exports = finalResponder;
