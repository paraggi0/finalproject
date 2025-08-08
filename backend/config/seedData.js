/**
 * Seed data untuk SQLite database
 * PT. Topline Manufacturing
 */

const { getPool } = require('./databaseAdapter');

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database with test data...');
        const pool = getPool();
        
        if (!pool) {
            console.error('❌ Database not initialized');
            return false;
        }

        // Insert WIP test data
        await pool.execute(`
            INSERT OR IGNORE INTO wip (partnumber, customer, model, description, quantity, location, lotnumber, operator)
            VALUES 
            ('TL001', 'HONDA', 'CIVIC', 'Honda Civic Dashboard Component', 600, 'WIP_AREA_1', 'LOT20250801001', 'operator1'),
            ('TL002', 'HONDA', 'ACCORD', 'Honda Accord Center Console', 480, 'WIP_AREA_1', 'LOT20250801002', 'operator2'),
            ('TL003', 'TOYOTA', 'CAMRY', 'Toyota Camry Interior Panel', 400, 'WIP_AREA_2', 'LOT20250801003', 'operator1'),
            ('TL004', 'TOYOTA', 'COROLLA', 'Toyota Corolla Door Handle', 600, 'WIP_AREA_2', 'LOT20250801004', 'operator3'),
            ('TL005', 'NISSAN', 'ALTIMA', 'Nissan Altima Dashboard', 160, 'WIP_AREA_3', 'LOT20250801005', 'operator2')
        `);
        console.log('✅ WIP test data inserted');

        // Insert Material test data
        await pool.execute(`
            INSERT OR IGNORE INTO material (material_code, material_name, supplier, quantity, unit, location)
            VALUES 
            ('MAT001', 'ABS Plastic Resin', 'SUPPLIER_A', 2000, 'KG', 'MAT_WAREHOUSE'),
            ('MAT002', 'PC Plastic Resin', 'SUPPLIER_B', 1600, 'KG', 'MAT_WAREHOUSE'),
            ('MAT003', 'Steel Sheet', 'SUPPLIER_C', 1000, 'KG', 'MAT_WAREHOUSE'),
            ('MAT004', 'Aluminum Sheet', 'SUPPLIER_D', 600, 'KG', 'MAT_WAREHOUSE')
        `);
        console.log('✅ Material test data inserted');

        // Insert Component test data
        await pool.execute(`
            INSERT OR IGNORE INTO component (component_code, component_name, supplier, quantity, unit, location)
            VALUES 
            ('CMP001', 'Standard Screw M4x20', 'SUPPLIER_E', 10000, 'PCS', 'CMP_WAREHOUSE'),
            ('CMP002', 'Washer M4', 'SUPPLIER_E', 10000, 'PCS', 'CMP_WAREHOUSE'),
            ('CMP003', 'Wire Connector', 'SUPPLIER_F', 2000, 'PCS', 'CMP_WAREHOUSE'),
            ('CMP004', 'LED Indicator', 'SUPPLIER_G', 1000, 'PCS', 'CMP_WAREHOUSE')
        `);
        console.log('✅ Component test data inserted');

        // Insert Schedule test data
        await pool.execute(`
            INSERT OR IGNORE INTO schedule (partnumber, description, supplier, delivery_date, delivery_quantity, daily_schedule, minimum_stock, type, status)
            VALUES 
            ('TL001', 'Honda Civic Dashboard Component', 'SUPPLIER_A', '2025-08-05', 200, 100, 50, 'MATERIAL', 'SCHEDULED'),
            ('TL002', 'Honda Accord Center Console', 'SUPPLIER_A', '2025-08-06', 150, 75, 30, 'MATERIAL', 'SCHEDULED'),
            ('MAT001', 'ABS Plastic Resin', 'SUPPLIER_A', '2025-08-04', 500, 0, 200, 'MATERIAL', 'SCHEDULED'),
            ('MAT002', 'PC Plastic Resin', 'SUPPLIER_B', '2025-08-07', 400, 0, 150, 'MATERIAL', 'SCHEDULED'),
            ('CMP001', 'Standard Screw M4x20', 'SUPPLIER_E', '2025-08-03', 2000, 0, 1000, 'MATERIAL', 'SCHEDULED')
        `);
        console.log('✅ Schedule test data inserted');

        // Insert Machine Status test data
        await pool.execute(`
            INSERT OR IGNORE INTO machine_status (id, machine_id, machine_name, current_status, efficiency_percentage, current_operator, shift, location)
            VALUES 
            ('machine_1', 'INJ-001', 'Injection Machine 1', 'running', 92.4, 'operator1', '1', 'Production Floor A'),
            ('machine_2', 'INJ-002', 'Injection Machine 2', 'idle', 0, 'operator2', '1', 'Production Floor A')
        `);
        console.log('✅ Machine status test data inserted');

        // Insert OutputMC test data
        await pool.execute(`
            INSERT OR IGNORE INTO outputmc (id, customer, partnumber, model, description, quantity, quantity_ng, machine, operator, shift, lotnumber)
            VALUES 
            ('output_1', 'HONDA', 'TL001', 'CIVIC', 'Honda Civic Dashboard Component', 50, 2, 'INJ-001', 'operator1', '1', 'LOT20250801001'),
            ('output_2', 'HONDA', 'TL002', 'ACCORD', 'Honda Accord Center Console', 40, 1, 'INJ-002', 'operator2', '1', 'LOT20250801002'),
            ('output_3', 'TOYOTA', 'TL003', 'CAMRY', 'Toyota Camry Interior Panel', 35, 0, 'INJ-001', 'operator1', '2', 'LOT20250801003')
        `);
        console.log('✅ Output MC test data inserted');

        console.log('🎉 Database seeding completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        return false;
    }
}

module.exports = { seedDatabase };
