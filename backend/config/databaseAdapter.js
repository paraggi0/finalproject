/**
 * Database Adapter - MySQL Only (XAMPP)
 */
const mysql = require('mysql2/promise');

let currentPool = null;

async function initializeDatabase() {
    const dbConfig = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'topline_manufacturing',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4',
        ssl: false,
        connectTimeout: 30000,
        multipleStatements: false
    };

    try {
        console.log('🔄 Connecting to XAMPP MySQL...');
        
        // Create database if not exists
        const tempConfig = { ...dbConfig };
        delete tempConfig.database;
        const tempPool = mysql.createPool(tempConfig);
        const tempConnection = await tempPool.getConnection();
        
        await tempConnection.execute('CREATE DATABASE IF NOT EXISTS topline_manufacturing');
        console.log('✅ Database ready');
        
        tempConnection.release();
        await tempPool.end();
        
        // Connect to database
        currentPool = mysql.createPool(dbConfig);
        const connection = await currentPool.getConnection();
        console.log('✅ Connected to XAMPP MySQL');
        
        // Test connection
        const [result] = await connection.execute('SELECT 1 as test');
        console.log('✅ MySQL responding');
        
        connection.release();
        return currentPool;
        
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        throw error;
    }
}

function getPool() {
    return currentPool;
}

async function execute(query, params = []) {
    if (!currentPool) {
        await initializeDatabase();
    }
    return currentPool.execute(query, params);
}

async function getConnection() {
    if (!currentPool) {
        await initializeDatabase();
    }
    return currentPool.getConnection();
}

module.exports = {
    initializeDatabase,
    getPool,
    execute,
    getConnection,
    get isUsingLocalDB() {
        return false; // Always MySQL
    }
};