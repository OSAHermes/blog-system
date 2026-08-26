const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'blog',
  password: process.env.DB_PASSWORD || 'blogpass123',
  database: process.env.DB_NAME || 'blog',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

async function initDatabase() {
  pool = mysql.createPool(config);
  
  // Test connection
  const conn = await pool.getConnection();
  console.log('✓ MySQL connected');
  conn.release();
  
  return pool;
}

async function getConnection() {
  if (!pool) {
    await initDatabase();
  }
  return pool.getConnection();
}

async function query(sql, params) {
  const conn = await getConnection();
  try {
    const [rows] = await conn.execute(sql, params || []);
    return rows;
  } finally {
    conn.release();
  }
}

module.exports = { initDatabase, getConnection, query };