/** Common config for message.ly */

// read .env files and make environmental variables

// need
// DB_USERNAME=
// DB_PASSWORD=
// DB_HOST=

require("dotenv").config();

const DB_URI = (process.env.NODE_ENV === "test")
  ? `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/messagely_test` 
  : `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/messagely`;

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = (process.env.NODE_ENV === "test") ? 1 : 12;


module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};