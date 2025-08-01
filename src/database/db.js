require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.HOST_DATABASE,
  user: process.env.USER_DATABASE,
  port: process.env.PORT_DATABASE,
  password: process.env.PASSWORD_DATABASE,
  database: process.env.DATABASE,
});

exports.query = async (query, values) => {
  const [results] = await pool.query(query, values);
  return results;
};
