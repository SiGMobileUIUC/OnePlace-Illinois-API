const httpStatus = require('http-status');
const admin = require('firebase-admin');

const ApiError = require('../../utils/ApiError');
const { verifyServerAccessJWT, verifyServerRefreshJWT } = require('./serverJwt');

const serviceAccount = require('../../../serviceAccountKey.json');

const firebaseProjectID = 'oneplace---illinois'; // Don't Change This! (unless our project ID changes)
const firebaseJwtIssuer = `https://securetoken.google.com/${firebaseProjectID}`;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: 'https://<DATABASE_NAME>.firebaseio.com', // not needed
});

/**
 * Validate ID token from Firebase Authentication. Throws ApiError if invalid.
 * @param {JWT} decodedIDToken
 * @param {string} email
 * @returns {Boolean|ApiError}
 */
const validateIDToken = (decodedIDToken, email) => {
  // READ: decodedIDToken properties https://firebase.google.com/docs/reference/admin/node/admin.auth.DecodedIdToken
  // READ: verify the ID token https://firebase.google.com/docs/auth/admin/verify-id-tokens
  const now = Math.ceil(Date.now() / 1000); // decoded token time is in ms

  // information about the sign in event (.firebase) is missing
  if (!decodedIDToken.firebase) throw new ApiError(httpStatus.BAD_REQUEST, 'Token is missing information about sign in event');
  // Must be in the past. The time is measured in seconds since the UNIX epoch. (issued-at time is the valid start time of JWT)
  if (decodedIDToken.iat > now) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid token issued time!');
  // Must be in the past. The time when the user authenticated.
  if (decodedIDToken.auth_time > now) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid token authentication time!');
  // Must be your Firebase project ID, the unique identifier for your Firebase project, which can be found in the URL of that project's console.
  if (decodedIDToken.aud !== firebaseProjectID) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid audience!');
  // Must be "https://securetoken.google.com/<projectId>", where <projectId> is the same project ID used for aud above.
  if (decodedIDToken.iss !== firebaseJwtIssuer) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid issuer!');
  // Email signed in the token must match the requester's email.
  if (decodedIDToken.email !== email) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid token email!');

  return true;
};

/**
 * Verifies Firebase ID Token with email. Returns decoded token if all valid.
 * @param email
 * @param token ID Token (JWT access) from Firebase Login
 * @returns {Promise<auth.DecodedIdToken|Boolean>}
 */
const verifyUserWithIDToken = async (email, token) => {
  try {
    const decodedIDToken = await admin.auth().verifyIdToken((token));
    const isValid = validateIDToken(decodedIDToken, email);
    return isValid ? decodedIDToken : isValid;
  } catch (e) {
    console.log(e);
    if (e instanceof ApiError) throw e;
    if (e.codePrefix === 'auth') throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Firebase ID token');
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

module.exports = {
  verifyUserWithIDToken,
};
