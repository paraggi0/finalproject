const express = require('express');
const router = express.Router();
const { execute } = require('../config/databaseAdapter');

// =============================================================================
// MACHINES API ROUTES FOR FRONTEND DASHBOARD
// =============================================================================

// GET Machine Status data
router.get('/status', async (req, res) => {
    try {
        // Check if machine_status table exists, if not create dummy data
        let machineData;
        
        try {
            const [rows] = await execute(`
                SELECT 
                    machine_id as machineId,
                    machine_name as machineName,
                    status,
                    current_product as currentProduct,
                    operator,
                    TIME_FORMAT(start_time, '%H:%i') as startTime,
                    target_output as targetOutput,
                    actual_output as actualOutput,
                    ROUND((actual_output / NULLIF(target_output, 0)) * 100, 1) as efficiency,
                    updated_at as lastUpdate
                FROM machine_status 
                WHERE is_active = TRUE
                ORDER BY machine_id
            `);
            
            machineData = rows;
            
        } catch (tableError) {
            console.log('Machine status table not found, generating dummy data');
            
            // Generate dummy machine data based on customers
            const [customers] = await execute(`
                SELECT customer_code, customer_name 
                FROM master_customer 
                WHERE is_active = TRUE 
                ORDER BY customer_name 
                LIMIT 10
            `);
            
            const machineTypes = ['INJ', 'MILL', 'TURN', 'DRILL', 'WELD'];
            const operators = ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown', 'Mike Johnson'];
            const statuses = ['Running', 'Idle', 'Maintenance', 'Setup'];
            
            machineData = customers.slice(0, 8).map((customer, index) => {
                const machineType = machineTypes[index % machineTypes.length];
                const machineNum = String(index + 1).padStart(3, '0');
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const targetOutput = status === 'Running' ? Math.floor(Math.random() * 500) + 200 : 0;
                const actualOutput = status === 'Running' ? Math.floor(targetOutput * (0.7 + Math.random() * 0.3)) : 0;
                
                return {
                    machineId: `${machineType}-${machineNum}`,
                    machineName: `${machineType} Machine #${index + 1}`,
                    status: status,
                    currentProduct: status === 'Running' ? customer.customer_name.split(' ').slice(-1)[0] : '-',
                    operator: status !== 'Maintenance' ? operators[index % operators.length] : 'Maintenance Team',
                    startTime: status === 'Running' ? '07:00' : '-',
                    targetOutput: targetOutput,
                    actualOutput: actualOutput,
                    efficiency: targetOutput > 0 ? Math.round((actualOutput / targetOutput) * 100) : 0,
                    lastUpdate: new Date().toISOString()
                };
            });
        }
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*'
        });
        
        res.json(machineData);
        
    } catch (error) {
        console.error('Get machine status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch machine status data',
            error: error.message
        });
    }
});

// GET Machine summary for dashboard
router.get('/summary', async (req, res) => {
    try {
        // Get machine status summary
        let summary;
        
        try {
            const [rows] = await execute(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM machine_status 
                WHERE is_active = TRUE
                GROUP BY status
            `);
            
            summary = {
                total: 0,
                running: 0,
                idle: 0,
                maintenance: 0,
                setup: 0
            };
            
            rows.forEach(row => {
                summary.total += row.count;
                summary[row.status.toLowerCase()] = row.count;
            });
            
        } catch (tableError) {
            // Dummy data if table doesn't exist
            summary = {
                total: 8,
                running: 5,
                idle: 1,
                maintenance: 1,
                setup: 1
            };
        }
        
        summary.lastUpdate = new Date().toISOString();
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*'
        });
        
        res.json(summary);
        
    } catch (error) {
        console.error('Get machine summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch machine summary',
            error: error.message
        });
    }
});

// GET Production efficiency
router.get('/efficiency', async (req, res) => {
    try {
        let efficiencyData;
        
        try {
            const [rows] = await execute(`
                SELECT 
                    machine_id as machineId,
                    machine_name as machineName,
                    ROUND((actual_output / NULLIF(target_output, 0)) * 100, 1) as efficiency,
                    target_output as targetOutput,
                    actual_output as actualOutput,
                    status
                FROM machine_status 
                WHERE is_active = TRUE AND target_output > 0
                ORDER BY efficiency DESC
            `);
            
            efficiencyData = rows;
            
        } catch (tableError) {
            // Generate dummy efficiency data
            efficiencyData = [
                { machineId: 'INJ-001', machineName: 'Injection Machine #1', efficiency: 95, targetOutput: 500, actualOutput: 475, status: 'Running' },
                { machineId: 'MILL-002', machineName: 'Milling Machine #2', efficiency: 88, targetOutput: 300, actualOutput: 264, status: 'Running' },
                { machineId: 'TURN-003', machineName: 'Turning Machine #3', efficiency: 82, targetOutput: 400, actualOutput: 328, status: 'Running' }
            ];
        }
        
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*'
        });
        
        res.json(efficiencyData);
        
    } catch (error) {
        console.error('Get machine efficiency error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch machine efficiency data',
            error: error.message
        });
    }
});

module.exports = router;
