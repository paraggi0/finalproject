const express = require('express');
const router = express.Router();
const { execute } = require('../config/databaseAdapter');

// =============================================================================
// STOCK API ROUTES FOR FRONTEND DASHBOARD
// =============================================================================

// GET WIP Stock data
router.get('/wip', async (req, res) => {
    try {
        const [rows] = await execute(`
            SELECT 
                partnumber as itemCode,
                description,
                model,
                customer,
                timestamp as lastUpdate,
                'In Process' as status,
                'PCS' as unit,
                'PROD-LINE' as location,
                FLOOR(RAND() * 500 + 100) as qty
            FROM billofmaterial 
            ORDER BY partnumber
            LIMIT 50
        `);
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*'
        });
        
        res.json(rows);
        
    } catch (error) {
        console.error('Get WIP stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch WIP stock data',
            error: error.message
        });
    }
});

// GET Finished Good stock data
router.get('/finished-good', async (req, res) => {
    try {
        // Generate dummy data based on BOM data for now
        const [bomRows] = await execute(`
            SELECT 
                partnumber,
                description,
                customer,
                model
            FROM billofmaterial 
            GROUP BY partnumber, description, customer, model
            ORDER BY partnumber
            LIMIT 20
        `);
        
        const finishedGoodData = bomRows.map((item, index) => ({
            productCode: `FG-${String(index + 1).padStart(3, '0')}`,
            description: item.description,
            currentStock: Math.floor(Math.random() * 5000) + 500,
            minimumStock: Math.floor(Math.random() * 2000) + 1000,
            deliverySchedule: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: ['Normal', 'Low', 'Critical'][Math.floor(Math.random() * 3)],
            lastUpdate: new Date().toISOString(),
            customer: item.customer,
            model: item.model,
            partNumber: item.partnumber
        }));
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*'
        });
        
        res.json(finishedGoodData);
        
    } catch (error) {
        console.error('Get Finished Good stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch Finished Good stock data',
            error: error.message
        });
    }
});

// GET Materials stock data
router.get('/materials', async (req, res) => {
    try {
        // Generate materials data based on BOM
        const [bomRows] = await execute(`
            SELECT 
                description,
                model,
                customer,
                COUNT(*) as usage_count
            FROM billofmaterial 
            WHERE description IS NOT NULL AND description != ''
            GROUP BY description, model, customer
            ORDER BY usage_count DESC, description
            LIMIT 15
        `);
        
        const materialsData = bomRows.map((item, index) => ({
            materialCode: `MAT-${String(index + 1).padStart(3, '0')}`,
            description: `${item.description} ${item.model || ''}`.trim(),
            type: ['Raw Material', 'Component', 'Consumable'][Math.floor(Math.random() * 3)],
            currentStock: Math.floor(Math.random() * 20000) + 1000,
            minimumStock: Math.floor(Math.random() * 5000) + 500,
            arrivalSchedule: new Date(Date.now() + Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            supplier: ['Steel Corp Indonesia', 'Fastener Ltd', 'Plastic Solutions', 'Chemical Supply'][Math.floor(Math.random() * 4)],
            status: ['Normal', 'Low', 'Critical'][Math.floor(Math.random() * 3)],
            unit: 'PCS',
            usageCount: item.usage_count,
            customer: item.customer
        }));
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*'
        });
        
        res.json(materialsData);
        
    } catch (error) {
        console.error('Get Materials stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch Materials stock data',
            error: error.message
        });
    }
});

// GET Stock summary for dashboard stats
router.get('/summary', async (req, res) => {
    try {
        // Get item count from BOM
        const [itemsCount] = await execute(`
            SELECT COUNT(DISTINCT partnumber) as total_items
            FROM billofmaterial
        `);
        
        // Get customer count
        const [customersCount] = await execute(`
            SELECT COUNT(DISTINCT customer) as total_customers
            FROM billofmaterial
        `);
        
        const summary = {
            totalWipStock: Math.floor(Math.random() * 10000) + 5000, // Simulated
            totalItems: itemsCount[0]?.total_items || 0,
            totalCustomers: customersCount[0]?.total_customers || 0,
            lastUpdate: new Date().toISOString()
        };
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*'
        });
        
        res.json(summary);
        
    } catch (error) {
        console.error('Get stock summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stock summary',
            error: error.message
        });
    }
});

module.exports = router;
