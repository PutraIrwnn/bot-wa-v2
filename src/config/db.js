const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const Logger = require('../engine/core/Logger');
const dbLogger = new Logger('MySQL');

// Test the connection
pool.getConnection()
    .then(connection => {
        dbLogger.info('Connected to database successfully.');
        connection.release();
    })
    .catch(err => {
        dbLogger.error('Error connecting to MySQL database:', err);
    });

module.exports = pool;
