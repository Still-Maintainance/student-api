require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "hopper.proxy.rlwy.net",
  port: 26243,
  user: "root",
  password: "SgMBhxbTeuJxLxJjxLNglOpvNUDkLisg",
  database: "railway",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;