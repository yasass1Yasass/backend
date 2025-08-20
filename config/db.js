require('dotenv').config(); // Load environment variables
const mysql = require('mysql2/promise'); // Using promise-based API

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the database!');
        connection.release(); 
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.message);
        process.exit(1);
    });

module.exports = pool; 