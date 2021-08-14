const jwt = require('jsonwebtoken');
const secureRandom = require('secure-random');
const { v4: uuidv4, validate: uuidValidate, version: uuidVersion } = require('uuid');

const config = require('../../config/config');
const { Users, AuthJWT } = require('../../models');

// FROM: https://www.npmjs.com/package/jsonwebtoken
const listOfJWTErrors = ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError', 'invalid_token'];

const uuidValidateV4 = (uuid) => uuidValidate(uuid) && uuidVersion(uuid) === 4;

/**
 * Stores the signing key (encoded base64) with its identifier
 * @param signingKey 256 byte random Buffer
 * @param keyIdentifier UUIDv4 to identify the signing key
 * @returns {Promise<void>}
 */
// TODO: cache in Redis instead for faster delivery
async function storeSigningKey(signingKey, keyIdentifier) {
  // Convert Buffer type `signing key` to base64 for db storage
  const base64SigningKey = signingKey.toString('base64'); // instanceof Buffer
  await AuthJWT.create({ identifier: keyIdentifier, signing_key: base64SigningKey });
}

async function destroySigningKey(keyIdentifier) {
  await AuthJWT.destroy({ where: { identifier: keyIdentifier } });
}

/**
 * Get the signing key with given key identifier
 * @param keyIdentifier
 * @returns {Promise<base64|Error>}
 */
async function getSigningKey(keyIdentifier) {
  try {
    const record = await AuthJWT.findOne({ where: { identifier: keyIdentifier }, attributes: ['signing_key'] });
    if (!record) {
      const invalidKey = new Error('No signing key found for the key identifier provided');
      invalidKey.name = 'no_key_match';
      throw invalidKey;
    }
    return record.dataValues.signing_key;
  } catch (e) {
    console.log(e);
    if (e.name === 'no_key_match') throw e;
    throw new Error('Error occurred while getting signing key');
  }
}

class ServerJWT {
  static invalidError(msg = '') {
    const invalidError = new Error(msg);
    invalidError.name = 'invalid_token';
    return invalidError;
  }

  /**
   * Creates JWT for internal use
   * @param {string} email
   * @param {string} type Type of JWT (included as audience, 'access' or 'refresh')
   * @param {string} expiresIn Valid duration of JWT (set '1hr' for access, '30d' for refresh)
   * @param {string} [prevKeyIdentifier] Delete previous signing key with key identifier
   * @returns {Promise<JWT>}
   */
  static async _create(email, type, expiresIn, prevKeyIdentifier = null) {
    try {
      // Destroy prev signing key if key identifier is given
      if (prevKeyIdentifier && uuidValidateV4(prevKeyIdentifier)) {
        await destroySigningKey(prevKeyIdentifier);
      }

      // Create a highly random byte array of 256 bytes (random for every JWT)
      const signingKey = secureRandom(256, { type: 'Buffer' });
      // Create a uuid identifier to store the signingKey
      const keyIdentifier = uuidv4();

      const userRecord = await Users.findOne({ where: { email }, attributes: ['_id'] });
      if (!userRecord) throw new Error(`No user record matched given email ${email}`);

      const payload = { email };
      const claims = {
        keyid: keyIdentifier, // for retrieving signing key (to verify token from user later)
        issuer: 'https://oneplaceillinois.com',
        subject: userRecord._id, // user's UID in our db (User._id)
        audience: type, // used to distinguish between access and refresh token
        expiresIn,
        // scope: 'self, participant',
      };

      const token = jwt.sign(payload, signingKey, claims);

      await storeSigningKey(signingKey, keyIdentifier);

      return token;
    } catch (e) {
      console.log(e);
      throw new Error('Error occurred while creating server JWT');
    }
  }

  static async _verifyEmail(email) {
    const user = await Users.findOne({ where: { email }, attributes: ['_id'] });
    if (!user) throw ServerJWT.invalidError('Invalid email');
    return user._id;
  }

  static async _verifySigningKey(keyIdentifier) {
    if (!keyIdentifier) throw ServerJWT.invalidError('Invalid token key id');

    const signingKeyBase64 = await getSigningKey(keyIdentifier);
    if (!signingKeyBase64) throw ServerJWT.invalidError('Invalid token signing key');

    // Decode base64 signingKey as Buffer
    return Buffer.from(signingKeyBase64, 'base64'); // this warning is wrong
  }

  /**
   * Verifies JWT
   * @param {string} email
   * @param {string} token JWT token to verify
   * @param {string} type Type of JWT ('access' or 'refresh')
   * @returns {Promise<Boolean>}
   */
  static async _verify(token, type) {
    try {
      // Decode w/ complete data to get the key identifier (header.kid) & email (payload.email)
      let decoded = jwt.decode(token, { complete: true });

      const { email } = decoded.payload;
      const keyIdentifier = decoded.header.kid;

      // First verify that user exists in our db
      const userID = await ServerJWT._verifyEmail(email);
      // Then verify the signing key w/ key identifier given in token
      const signingKey = await ServerJWT._verifySigningKey(keyIdentifier);

      const verifyOptions = {
        issuer: config.jwt.issuer,
        subject: userID, // user's UID in our db (User._id)
        audience: type, // 'access' or 'refresh'
        // scope: 'self, participant',
      };

      // Now verify JWT (throws error if invalid)
      decoded = jwt.verify(token, signingKey, verifyOptions);

      return true;
    } catch (e) {
      console.log(e);
      if (listOfJWTErrors.includes(e.name)) return false;
      throw new Error('Error occurred while verifying server access JWT');
    }
  }

  /**
   * Issue Access Token
   * @param email
   * @param [keyIdentifier] Previous key identifier to destroy
   * @returns {Promise<JWT>}
   */
  static async issueAccessToken(email, keyIdentifier = null) {
    return ServerJWT._create(email, 'access', '1hr', keyIdentifier);
  }

  /**
   * Issue Refresh Token
   * @param email
   * @param [keyIdentifier] Previous key identifier to destroy
   * @returns {Promise<JWT>}
   */
  // TODO: create rotating refresh token (re-issue refresh with every re-issued access token)
  static async issueRefreshToken(email, keyIdentifier = null) {
    return ServerJWT._create(email, 'refresh', '30d', keyIdentifier);
  }

  static async verifyAccessToken(email, token) {
    return ServerJWT._verify(token, 'access');
  }

  static async verifyRefreshToken(email, token) {
    return ServerJWT._verify(token, 'refresh');
  }
}

module.exports = ServerJWT;
