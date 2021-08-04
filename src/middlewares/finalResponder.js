const catchAsync = require('../utils/catchAsync');
const { getBearerTokenFromHeaders } = require('../utils/auth');
const { deepExtend } = require('../utils/helpers');

/**
 * Final middleware before sending response to user
 */
const finalResponder = catchAsync(async (req, res) => {
  // READ: http://expressjs.com/en/api.html#res.locals
  const passOn = res.locals;

  // Unify response syntax
  const resJson = {
    error: null,
    status: 'success',
    msg: '',
    payload: {},
  };

  if (passOn.error) {
    resJson.error = passOn.error;
    resJson.status = 'error';
  }

  resJson.payload = deepExtend(resJson.payload, passOn);

  // Check if access token was renewed silently. If so,
  // return it to the client.
  if (req.headers.auth_renewed) {
    resJson.payload.accessToken = getBearerTokenFromHeaders(req);
  }

  if (resJson.error) res.statusCode(passOn.error.statusCode || 500).send(resJson);
  else res.statusCode(200).send(resJson);
});

module.exports = finalResponder;
