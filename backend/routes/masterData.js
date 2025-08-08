const express = require('express');
const router = express.Router();
const { execute } = require('../config/databaseAdapter');

// =============================================================================
// MASTER MATERIAL MANAGEMENT
// =============================================================================

router.post('/create-master-material', async (req, res) => {
    try {
        console.log('🔧 Creating master_material table...');
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS master_material (
                id INT AUTO_INCREMENT PRIMARY KEY,
                material_code VARCHAR(50) NOT NULL UNIQUE,
                material_name VARCHAR(255) NOT NULL,
                specification TEXT,
                unit VARCHAR(20) DEFAULT 'PCS',
                category ENUM('RAW_MATERIAL', 'SEMI_FINISHED', 'CONSUMABLE') DEFAULT 'RAW_MATERIAL',
                supplier VARCHAR(255),
                minimum_stock INT DEFAULT 0,
                maximum_stock INT DEFAULT 0,
                unit_price DECIMAL(15,2) DEFAULT 0.00,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_material_code (material_code),
                INDEX idx_category (category),
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await execute(createTableQuery);
        
        res.json({
            success: true,
            message: 'Master material table created successfully',
            table: 'master_material'
        });

    } catch (error) {
        console.error('Create master material table error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/create-material-stock', async (req, res) => {
    try {
        console.log('🔧 Creating material_stock table...');
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS material_stock (
                id INT AUTO_INCREMENT PRIMARY KEY,
                material_id INT NOT NULL,
                current_stock INT DEFAULT 0,
                reserved_stock INT DEFAULT 0,
                available_stock INT GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
                location VARCHAR(100) DEFAULT 'WAREHOUSE',
                last_transaction_date TIMESTAMP NULL,
                last_updated_by VARCHAR(100),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (material_id) REFERENCES master_material(id) ON DELETE CASCADE,
                INDEX idx_material_id (material_id),
                INDEX idx_location (location),
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await execute(createTableQuery);
        
        res.json({
            success: true,
            message: 'Material stock table created successfully',
            table: 'material_stock'
        });

    } catch (error) {
        console.error('Create material stock table error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================================================
// MASTER COMPONENT MANAGEMENT
// =============================================================================

router.post('/create-master-component', async (req, res) => {
    try {
        console.log('🔧 Creating master_component table...');
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS master_component (
                id INT AUTO_INCREMENT PRIMARY KEY,
                component_code VARCHAR(50) NOT NULL UNIQUE,
                component_name VARCHAR(255) NOT NULL,
                specification TEXT,
                unit VARCHAR(20) DEFAULT 'PCS',
                category ENUM('ELECTRONIC', 'MECHANICAL', 'FASTENER', 'OTHERS') DEFAULT 'MECHANICAL',
                supplier VARCHAR(255),
                minimum_stock INT DEFAULT 0,
                maximum_stock INT DEFAULT 0,
                unit_price DECIMAL(15,2) DEFAULT 0.00,
                lead_time_days INT DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_component_code (component_code),
                INDEX idx_category (category),
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await execute(createTableQuery);
        
        res.json({
            success: true,
            message: 'Master component table created successfully',
            table: 'master_component'
        });

    } catch (error) {
        console.error('Create master component table error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/create-component-stock', async (req, res) => {
    try {
        console.log('🔧 Creating component_stock table...');
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS component_stock (
                id INT AUTO_INCREMENT PRIMARY KEY,
                component_id INT NOT NULL,
                current_stock INT DEFAULT 0,
                reserved_stock INT DEFAULT 0,
                available_stock INT GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
                location VARCHAR(100) DEFAULT 'WAREHOUSE',
                last_transaction_date TIMESTAMP NULL,
                last_updated_by VARCHAR(100),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (component_id) REFERENCES master_component(id) ON DELETE CASCADE,
                INDEX idx_component_id (component_id),
                INDEX idx_location (location),
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await execute(createTableQuery);
        
        res.json({
            success: true,
            message: 'Component stock table created successfully',
            table: 'component_stock'
        });

    } catch (error) {
        console.error('Create component stock table error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================================================
// POPULATE MASTER DATA FROM BOM
// =============================================================================

router.post('/populate-master-material', async (req, res) => {
    try {
        console.log('📝 Populating master material from BOM data...');
        
        // Get unique materials from BOM
        const [bomMaterials] = await execute(`
            SELECT DISTINCT 
                description,
                model,
                customer
            FROM billofmaterial 
            WHERE description IS NOT NULL 
            AND description != ''
            AND description NOT LIKE '%PROTECTOR%'
            AND description NOT LIKE '%CAP%'
            AND description NOT LIKE '%COVER%'
            ORDER BY description
            LIMIT 20
        `);
        
        let insertCount = 0;
        let skipCount = 0;
        
        for (const material of bomMaterials) {
            try {
                const materialCode = `MAT-${String(insertCount + 1).padStart(4, '0')}`;
                const materialName = material.description;
                const specification = `Model: ${material.model || 'N/A'}, Customer: ${material.customer}`;
                const category = 'RAW_MATERIAL';
                const supplier = 'TBD Supplier';
                
                await execute(`
                    INSERT INTO master_material 
                    (material_code, material_name, specification, category, supplier, minimum_stock, maximum_stock)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [materialCode, materialName, specification, category, supplier, 500, 2000]);
                
                insertCount++;
                
            } catch (insertError) {
                if (insertError.code === 'ER_DUP_ENTRY') {
                    skipCount++;
                } else {
                    throw insertError;
                }
            }
        }
        
        res.json({
            success: true,
            message: 'Master material populated successfully',
            results: {
                total_found: bomMaterials.length,
                inserted: insertCount,
                skipped: skipCount
            }
        });

    } catch (error) {
        console.error('Populate master material error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/populate-master-component', async (req, res) => {
    try {
        console.log('📝 Populating master component from BOM data...');
        
        // Get unique components from BOM (parts that look like components)
        const [bomComponents] = await execute(`
            SELECT DISTINCT 
                description,
                model,
                customer
            FROM billofmaterial 
            WHERE description IS NOT NULL 
            AND description != ''
            AND (
                description LIKE '%PROTECTOR%' OR 
                description LIKE '%CAP%' OR 
                description LIKE '%COVER%' OR
                description LIKE '%BRACKET%' OR
                description LIKE '%GRIP%' OR
                description LIKE '%CASE%'
            )
            ORDER BY description
            LIMIT 15
        `);
        
        let insertCount = 0;
        let skipCount = 0;
        
        for (const component of bomComponents) {
            try {
                const componentCode = `COMP-${String(insertCount + 1).padStart(4, '0')}`;
                const componentName = component.description;
                const specification = `Model: ${component.model || 'N/A'}, Customer: ${component.customer}`;
                const category = 'MECHANICAL';
                const supplier = 'Component Supplier';
                
                await execute(`
                    INSERT INTO master_component 
                    (component_code, component_name, specification, category, supplier, minimum_stock, maximum_stock, lead_time_days)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [componentCode, componentName, specification, category, supplier, 100, 1000, 7]);
                
                insertCount++;
                
            } catch (insertError) {
                if (insertError.code === 'ER_DUP_ENTRY') {
                    skipCount++;
                } else {
                    throw insertError;
                }
            }
        }
        
        res.json({
            success: true,
            message: 'Master component populated successfully',
            results: {
                total_found: bomComponents.length,
                inserted: insertCount,
                skipped: skipCount
            }
        });

    } catch (error) {
        console.error('Populate master component error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================================================
// POPULATE STOCK DATA WITH RANDOM VALUES
// =============================================================================

router.post('/populate-material-stock', async (req, res) => {
    try {
        console.log('📦 Populating material stock data...');
        
        // Get all materials
        const [materials] = await execute(`
            SELECT id, material_code, material_name 
            FROM master_material 
            WHERE is_active = TRUE
        `);
        
        let insertCount = 0;
        
        for (const material of materials) {
            try {
                const currentStock = Math.floor(Math.random() * 5000) + 1000;
                const reservedStock = Math.floor(Math.random() * 200);
                
                await execute(`
                    INSERT INTO material_stock 
                    (material_id, current_stock, reserved_stock, location, last_updated_by)
                    VALUES (?, ?, ?, ?, ?)
                `, [material.id, currentStock, reservedStock, 'WAREHOUSE-A', 'SYSTEM']);
                
                insertCount++;
                
            } catch (insertError) {
                console.error(`Error inserting stock for material ${material.material_code}:`, insertError);
            }
        }
        
        res.json({
            success: true,
            message: 'Material stock populated successfully',
            results: {
                total_materials: materials.length,
                inserted: insertCount
            }
        });

    } catch (error) {
        console.error('Populate material stock error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/populate-component-stock', async (req, res) => {
    try {
        console.log('📦 Populating component stock data...');
        
        // Get all components
        const [components] = await execute(`
            SELECT id, component_code, component_name 
            FROM master_component 
            WHERE is_active = TRUE
        `);
        
        let insertCount = 0;
        
        for (const component of components) {
            try {
                const currentStock = Math.floor(Math.random() * 2000) + 500;
                const reservedStock = Math.floor(Math.random() * 100);
                
                await execute(`
                    INSERT INTO component_stock 
                    (component_id, current_stock, reserved_stock, location, last_updated_by)
                    VALUES (?, ?, ?, ?, ?)
                `, [component.id, currentStock, reservedStock, 'WAREHOUSE-B', 'SYSTEM']);
                
                insertCount++;
                
            } catch (insertError) {
                console.error(`Error inserting stock for component ${component.component_code}:`, insertError);
            }
        }
        
        res.json({
            success: true,
            message: 'Component stock populated successfully',
            results: {
                total_components: components.length,
                inserted: insertCount
            }
        });

    } catch (error) {
        console.error('Populate component stock error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
