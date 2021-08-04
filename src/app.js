const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const cookieParser = require('cookie-parser')

const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const finalResponder = require('./middlewares/finalResponder');
const ApiError = require('./utils/ApiError');
const db = require('./models');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((obj, done) => done(null, obj));

// ignore warnings since JwtStrategy extends Strategy (Passport)
passport.use('jwt', jwtStrategy);

// TODO: Server fails to return response (hangs client) when a given token's Key Identifier has no record

// `force: true` resets the database
const shouldResetDatabase = process.env.RESET_DB || false;
db.sequelize.sync({ force: shouldResetDatabase }).then(() => {
  console.log('Restarted db');
});

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// use cookie helper
app.use(cookieParser(config.cookieSecret));

// JWT authentication
app.use(passport.initialize());
// app.use(passport.session());

// v1 api routes
app.use('/api/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Requested path not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// use as final response middleware
app.use(finalResponder);

module.exports = app;
