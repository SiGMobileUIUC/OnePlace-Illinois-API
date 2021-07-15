-- CREATE DATABASE oneplace_api_database;

CREATE TABLE IF NOT EXISTS users(
    netid TEXT PRIMARY KEY,
    cookies JSON
);
