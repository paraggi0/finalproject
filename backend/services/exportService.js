/**
 * Export Service - Handle CSV Export Operations
 * PT. Topline Evergreen Manufacturing
 * Menangani export data ke CSV untuk website admin
 */

const { execute } = require('../config/databaseAdapter');

class ExportService {
    /**
     * Convert array of objects to CSV string
     */
    arrayToCSV(data, headers = null) {
        if (!data || data.length === 0) {
            return '';
        }

        const csvHeaders = headers || Object.keys(data[0]);
        const csvRows = [];

        // Add headers
        csvRows.push(csvHeaders.join(','));

        // Add data rows
        for (const row of data) {
            const values = csvHeaders.map(header => {
                const value = row[header];
                // Handle null/undefined values and escape commas/quotes
                if (value === null || value === undefined) {
                    return '';
                }
                // Convert to string and escape quotes
                const stringValue = String(value).replace(/"/g, '""');
                // Wrap in quotes if contains comma, quote, or newline
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue}"`;
                }
                return stringValue;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    /**
     * Export Bill of Material to CSV
     */
    async exportBOM() {
        try {
            const [data] = await pool.execute(`
                SELECT 
                    partnumber as "Part Number",
                    customer as "Customer",
                    model as "Model",
                    description as "Description",
                    created_at as "Created Date",
                    updated_at as "Updated Date"
                FROM billofmaterial 
                ORDER BY partnumber
            `);

            const csv = this.arrayToCSV(data);
            return {
                success: true,
                csv,
                filename: `BOM_Export_${new Date().toISOString().slice(0, 10)}.csv`,
                record_count: data.length
            };
        } catch (error) {
            throw new Error(`Failed to export BOM: ${error.message}`);
        }
    }

    /**
     * Export Production Output to CSV
     */
    async exportProductionOutput(startDate = null, endDate = null) {
        try {
            let query = `
                SELECT 
                    o.id as "ID",
                    o.created_at as "Production Date",
                    o.customer as "Customer",
                    o.partnumber as "Part Number",
                    o.model as "Model",
                    o.description as "Description",
                    o.quantity as "Good Quantity",
                    o.quantity_ng as "NG Quantity",
                    (o.quantity + o.quantity_ng) as "Total Quantity",
                    ROUND((o.quantity * 100.0) / NULLIF(o.quantity + o.quantity_ng, 0), 2) as "Quality Rate %",
                    o.machine as "Machine",
                    o.operator as "Operator",
                    o.shift as "Shift",
                    o.lotnumber as "Lot Number"
                FROM outputmc o
            `;

            const params = [];
            const conditions = [];

            if (startDate) {
                conditions.push('DATE(o.created_at) >= ?');
                params.push(startDate);
            }

            if (endDate) {
                conditions.push('DATE(o.created_at) <= ?');
                params.push(endDate);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY o.created_at DESC';

            const [data] = await pool.execute(query, params);

            const csv = this.arrayToCSV(data);
            return {
                success: true,
                csv,
                filename: `Production_Output_${startDate || 'All'}_${endDate || 'All'}_${new Date().toISOString().slice(0, 10)}.csv`,
                record_count: data.length
            };
        } catch (error) {
            throw new Error(`Failed to export production output: ${error.message}`);
        }
    }

    /**
     * Export WIP Stock to CSV
     */
    async exportWIPStock() {
        try {
            const [data] = await pool.execute(`
                SELECT 
                    w.id as "ID",
                    w.partnumber as "Part Number",
                    w.customer as "Customer",
                    w.model as "Model",
                    w.description as "Description",
                    w.quantity as "Quantity",
                    w.location as "Location",
                    w.lotnumber as "Lot Number",
                    w.operator as "Operator",
                    w.created_at as "Created Date",
                    COALESCE(s.minimum_stock, 0) as "Minimum Stock",
                    CASE 
                        WHEN w.quantity < COALESCE(s.minimum_stock, 0) THEN 'LOW'
                        WHEN w.quantity < (COALESCE(s.minimum_stock, 0) * 1.5) THEN 'WARNING'
                        ELSE 'NORMAL'
                    END as "Stock Status"
                FROM wip w
                LEFT JOIN schedule s ON w.partnumber = s.partnumber
                ORDER BY w.partnumber, w.created_at DESC
            `);

            const csv = this.arrayToCSV(data);
            return {
                success: true,
                csv,
                filename: `WIP_Stock_${new Date().toISOString().slice(0, 10)}.csv`,
                record_count: data.length
            };
        } catch (error) {
            throw new Error(`Failed to export WIP stock: ${error.message}`);
        }
    }

    /**
     * Export Finished Goods Stock to CSV
     */
    async exportFGStock() {
        try {
            const [data] = await pool.execute(`
                SELECT 
                    f.id as "ID",
                    f.partnumber as "Part Number",
                    f.customer as "Customer",
                    f.model as "Model",
                    f.description as "Description",
                    f.quantity as "Quantity",
                    f.location as "Location",
                    f.lotnumber as "Lot Number",
                    f.operator as "Operator",
                    f.created_at as "Created Date",
                    COALESCE(s.minimum_stock, 0) as "Minimum Stock",
                    CASE 
                        WHEN f.quantity < COALESCE(s.minimum_stock, 0) THEN 'LOW'
                        WHEN f.quantity < (COALESCE(s.minimum_stock, 0) * 1.5) THEN 'WARNING'
                        ELSE 'NORMAL'
                    END as "Stock Status"
                FROM fg f
                LEFT JOIN schedule s ON f.partnumber = s.partnumber
                ORDER BY f.partnumber, f.created_at DESC
            `);

            const csv = this.arrayToCSV(data);
            return {
                success: true,
                csv,
                filename: `FG_Stock_${new Date().toISOString().slice(0, 10)}.csv`,
                record_count: data.length
            };
        } catch (error) {
            throw new Error(`Failed to export FG stock: ${error.message}`);
        }
    }

    /**
     * Export Material Stock to CSV
     */
    async exportMaterialStock() {
        try {
            const [data] = await pool.execute(`
                SELECT 
                    m.id as "ID",
                    m.material_code as "Material Code",
                    m.material_name as "Material Name",
                    m.supplier as "Supplier",
                    m.quantity as "Quantity",
                    m.unit as "Unit",
                    m.location as "Location",
                    m.lotnumber as "Lot Number",
                    m.operator as "Operator",
                    m.created_at as "Created Date",
                    COALESCE(s.minimum_stock, 0) as "Minimum Stock",
                    CASE 
                        WHEN m.quantity < COALESCE(s.minimum_stock, 0) THEN 'LOW'
                        WHEN m.quantity < (COALESCE(s.minimum_stock, 0) * 1.5) THEN 'WARNING'
                        ELSE 'NORMAL'
                    END as "Stock Status"
                FROM material m
                LEFT JOIN schedule s ON m.material_code = s.partnumber
                ORDER BY m.material_code, m.created_at DESC
            `);

            const csv = this.arrayToCSV(data);
            return {
                success: true,
                csv,
                filename: `Material_Stock_${new Date().toISOString().slice(0, 10)}.csv`,
                record_count: data.length
            };
        } catch (error) {
            throw new Error(`Failed to export material stock: ${error.message}`);
        }
    }

    /**
     * Export Component Stock to CSV
     */
    async exportComponentStock() {
        try {
            const [data] = await pool.execute(`
                SELECT 
                    c.id as "ID",
                    c.component_code as "Component Code",
                    c.component_name as "Component Name",
                    c.supplier as "Supplier",
                    c.quantity as "Quantity",
                    c.unit as "Unit",
                    c.location as "Location",
                    c.lotnumber as "Lot Number",
                    c.operator as "Operator",
                    c.created_at as "Created Date",
                    COALESCE(s.minimum_stock, 0) as "Minimum Stock",
                    CASE 
                        WHEN c.quantity < COALESCE(s.minimum_stock, 0) THEN 'LOW'
                        WHEN c.quantity < (COALESCE(s.minimum_stock, 0) * 1.5) THEN 'WARNING'
                        ELSE 'NORMAL'
                    END as "Stock Status"
                FROM component c
                LEFT JOIN schedule s ON c.component_code = s.partnumber
                ORDER BY c.component_code, c.created_at DESC
            `);

            const csv = this.arrayToCSV(data);
            return {
                success: true,
                csv,
                filename: `Component_Stock_${new Date().toISOString().slice(0, 10)}.csv`,
                record_count: data.length
            };
        } catch (error) {
            throw new Error(`Failed to export component stock: ${error.message}`);
        }
    }

    /**
     * Export Schedule Delivery to CSV
     */
    async exportScheduleDelivery() {
        try {
            const [data] = await pool.execute(`
                SELECT 
                    s.id as "ID",
                    s.partnumber as "Part Number",
                    s.description as "Description",
                    s.supplier as "Supplier",
                    s.delivery_date as "Delivery Date",
                    s.delivery_quantity as "Delivery Quantity",
                    s.daily_schedule as "Daily Schedule",
                    s.minimum_stock as "Minimum Stock",
                    s.type as "Type",
                    s.status as "Status",
                    s.created_at as "Created Date",
                    CASE 
                        WHEN DATE(s.delivery_date) = DATE('now') THEN 'TODAY'
                        WHEN DATE(s.delivery_date) < DATE('now') THEN 'OVERDUE'
                        WHEN DATE(s.delivery_date) <= DATE('now', '+3 days') THEN 'UPCOMING'
                        ELSE 'SCHEDULED'
                    END as "Delivery Status"
                FROM schedule s
                ORDER BY s.delivery_date ASC, s.partnumber
            `);

            const csv = this.arrayToCSV(data);
            return {
                success: true,
                csv,
                filename: `Schedule_Delivery_${new Date().toISOString().slice(0, 10)}.csv`,
                record_count: data.length
            };
        } catch (error) {
            throw new Error(`Failed to export schedule delivery: ${error.message}`);
        }
    }

    /**
     * Export Machine Status to CSV
     */
    async exportMachineStatus() {
        try {
            const [data] = await pool.execute(`
                SELECT 
                    m.machine_id as "Machine ID",
                    m.machine_name as "Machine Name",
                    m.department as "Department",
                    m.status as "Status",
                    m.current_partnumber as "Current Part Number",
                    m.operator as "Operator",
                    m.shift as "Shift",
                    m.last_output_time as "Last Output Time",
                    m.efficiency_percentage as "Efficiency %",
                    m.updated_at as "Last Updated"
                FROM machine_status m
                ORDER BY m.department, m.machine_id
            `);

            const csv = this.arrayToCSV(data);
            return {
                success: true,
                csv,
                filename: `Machine_Status_${new Date().toISOString().slice(0, 10)}.csv`,
                record_count: data.length
            };
        } catch (error) {
            throw new Error(`Failed to export machine status: ${error.message}`);
        }
    }

    /**
     * Export Custom Query Results to CSV
     */
    async exportCustomQuery(query, filename = 'Custom_Export') {
        try {
            const [data] = await pool.execute(query);

            const csv = this.arrayToCSV(data);
            return {
                success: true,
                csv,
                filename: `${filename}_${new Date().toISOString().slice(0, 10)}.csv`,
                record_count: data.length
            };
        } catch (error) {
            throw new Error(`Failed to export custom query: ${error.message}`);
        }
    }

    /**
     * Get available export types
     */
    getAvailableExports() {
        return {
            success: true,
            exports: [
                { type: 'bom', name: 'Bill of Material', description: 'Export all BOM data' },
                { type: 'production', name: 'Production Output', description: 'Export production output with quality metrics' },
                { type: 'wip', name: 'WIP Stock', description: 'Export Work in Progress stock' },
                { type: 'fg', name: 'Finished Goods', description: 'Export Finished Goods stock' },
                { type: 'material', name: 'Material Stock', description: 'Export material inventory' },
                { type: 'component', name: 'Component Stock', description: 'Export component inventory' },
                { type: 'schedule', name: 'Schedule Delivery', description: 'Export delivery schedules' },
                { type: 'machine', name: 'Machine Status', description: 'Export machine status and efficiency' }
            ]
        };
    }
}

module.exports = new ExportService();
