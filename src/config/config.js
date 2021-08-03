const path = require('path');
const Joi = require('joi');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(80),

    POSTGRES_HOST: Joi.string().required().default('localhost'),
    POSTGRES_USER: Joi.string().required().default('postgres'),
    POSTGRES_PASSWORD: Joi.string().required(),
    POSTGRES_DB: Joi.string().required().description('Database name to connect'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,

  postgres: {
    host: envVars.POSTGRES_HOST,
    user: envVars.POSTGRES_USER,
    password: envVars.POSTGRES_PASSWORD,
    dbname: envVars.POSTGRES_DB,
    dialect: 'postgres',
    sequelize_port: 5432,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  jwt: {
    issuer: 'https://oneplaceillinois.com',
  },
};
