/**
 * Inventory Service - Core Business Logic
 * PT. Topline Evergreen Manufacturing
 * Menangani logika untuk Stock WIP, FG, Material, Component
 */

const { execute } = require('../config/databaseAdapter');

class InventoryService {
    /**
     * Get Real-time Stock WIP with minimum stock calculation
     */
    async getWIPStock() {
        try {
            const [wipData] = await execute(`
                SELECT 
                    w.partnumber,
                    w.customer,
                    w.model,
                    w.description,
                    SUM(w.quantity) as current_stock,
                    w.location,
                    w.lotnumber,
                    MAX(w.created_at) as last_updated,
                    COALESCE(s.daily_schedule, 0) as daily_schedule,
                    COALESCE(s.minimum_stock, 0) as minimum_stock,
                    CASE 
                        WHEN SUM(w.quantity) < COALESCE(s.minimum_stock, 0) THEN 'LOW'
                        WHEN SUM(w.quantity) < (COALESCE(s.minimum_stock, 0) * 1.5) THEN 'WARNING'
                        ELSE 'NORMAL'
                    END as stock_status
                FROM wip w
                LEFT JOIN schedule s ON w.partnumber = s.partnumber
                GROUP BY w.partnumber, w.customer, w.model, w.description, w.location
                ORDER BY w.partnumber
            `);

            return {
                success: true,
                data: wipData,
                summary: {
                    total_items: wipData.length,
                    low_stock_items: wipData.filter(item => item.stock_status === 'LOW').length,
                    warning_items: wipData.filter(item => item.stock_status === 'WARNING').length,
                    total_quantity: wipData.reduce((sum, item) => sum + (item.current_stock || 0), 0)
                }
            };
        } catch (error) {
            console.error('WIP Stock error:', error);
            throw new Error('Failed to fetch WIP stock data');
        }
    }

    /**
     * Get Real-time Finished Goods Stock with minimum stock
     */
    async getFGStock() {
        try {
            // Since FG table doesn't exist yet, create mock data or return empty
            const fgData = [];

            return {
                success: true,
                data: fgData,
                summary: {
                    total_items: fgData.length,
                    low_stock_items: 0,
                    warning_items: 0,
                    total_quantity: 0
                }
            };
        } catch (error) {
            console.error('FG Stock error:', error);
            throw new Error('Failed to fetch FG stock data');
        }
    }

    /**
     * Get Material and Component Stock
     */
    async getMaterialComponentStock() {
        try {
            // Get Material Stock - use correct table name 'material'
            const [materialData] = await execute(`
                SELECT 
                    m.material_code as partnumber,
                    m.material_name as description,
                    m.supplier,
                    SUM(m.quantity) as current_stock,
                    m.unit,
                    m.location,
                    MAX(m.created_at) as last_updated,
                    0 as daily_schedule,
                    100 as minimum_stock,
                    CASE 
                        WHEN SUM(m.quantity) < 100 THEN 'LOW'
                        WHEN SUM(m.quantity) < 200 THEN 'WARNING'
                        ELSE 'NORMAL'
                    END as stock_status,
                    'MATERIAL' as type
                FROM material m
                GROUP BY m.material_code, m.material_name, m.supplier, m.unit, m.location
            `);

            // Get Component Stock - use correct table name 'component'
            const [componentData] = await execute(`
                SELECT 
                    c.component_code as partnumber,
                    c.component_name as description,
                    c.supplier,
                    SUM(c.quantity) as current_stock,
                    c.unit,
                    c.location,
                    MAX(c.created_at) as last_updated,
                    0 as daily_schedule,
                    50 as minimum_stock,
                    CASE 
                        WHEN SUM(c.quantity) < 50 THEN 'LOW'
                        WHEN SUM(c.quantity) < 100 THEN 'WARNING'
                        ELSE 'NORMAL'
                    END as stock_status,
                    'COMPONENT' as type
                FROM component c
                GROUP BY c.component_code, c.component_name, c.supplier, c.unit, c.location
            `);

            const combinedData = [...materialData, ...componentData];

            return {
                success: true,
                data: combinedData,
                summary: {
                    total_materials: materialData.length,
                    total_components: componentData.length,
                    total_items: combinedData.length,
                    low_stock_items: combinedData.filter(item => item.stock_status === 'LOW').length,
                    warning_items: combinedData.filter(item => item.stock_status === 'WARNING').length,
                    total_material_qty: materialData.reduce((sum, item) => sum + (item.current_stock || 0), 0),
                    total_component_qty: componentData.reduce((sum, item) => sum + (item.current_stock || 0), 0)
                }
            };
        } catch (error) {
            console.error('Material/Component Stock error:', error);
            throw new Error('Failed to fetch material/component stock data');
        }
    }

    /**
     * Get Schedule Delivery for Material & Component
     */
    async getScheduleDelivery() {
        try {
            const [scheduleData] = await execute(`
                SELECT 
                    s.partnumber,
                    s.description,
                    s.supplier,
                    s.delivery_date,
                    s.delivery_quantity,
                    s.daily_schedule,
                    s.minimum_stock,
                    s.type,
                    s.status,
                    s.created_at,
                    CASE 
                        WHEN DATE(s.delivery_date) = DATE('now') THEN 'TODAY'
                        WHEN DATE(s.delivery_date) < DATE('now') THEN 'OVERDUE'
                        WHEN DATE(s.delivery_date) <= DATE('now', '+3 days') THEN 'UPCOMING'
                        ELSE 'SCHEDULED'
                    END as delivery_status
                FROM schedule s
                WHERE s.delivery_date >= DATE('now', '-7 days')
                ORDER BY s.delivery_date ASC, s.partnumber
            `);

            return {
                success: true,
                data: scheduleData,
                summary: {
                    total_schedules: scheduleData.length,
                    today_deliveries: scheduleData.filter(item => item.delivery_status === 'TODAY').length,
                    overdue_deliveries: scheduleData.filter(item => item.delivery_status === 'OVERDUE').length,
                    upcoming_deliveries: scheduleData.filter(item => item.delivery_status === 'UPCOMING').length
                }
            };
        } catch (error) {
            console.error('Schedule Delivery error:', error);
            throw new Error('Failed to fetch schedule delivery data');
        }
    }

    /**
     * Get Machine Status Real-time
     */
    async getMachineStatus() {
        try {
            const [machineData] = await execute(`
                SELECT 
                    m.machine_id,
                    m.machine_name,
                    m.location,
                    m.current_status as status,
                    m.current_operator as operator,
                    m.shift,
                    m.last_update as last_output_time,
                    m.efficiency_percentage,
                    m.last_update as updated_at,
                    CASE 
                        WHEN m.current_status = 'running' THEN 'ACTIVE'
                        WHEN m.current_status = 'idle' THEN 'STANDBY'
                        WHEN m.current_status = 'maintenance' THEN 'MAINTENANCE'
                        ELSE 'UNKNOWN'
                    END as status_category
                FROM machine_status m
                ORDER BY m.location, m.machine_id
            `);

            return {
                success: true,
                data: machineData,
                summary: {
                    total_machines: machineData.length,
                    running_machines: machineData.filter(m => m.status === 'running').length,
                    idle_machines: machineData.filter(m => m.status === 'idle').length,
                    maintenance_machines: machineData.filter(m => m.status === 'maintenance').length,
                    avg_efficiency: machineData.reduce((sum, m) => sum + (m.efficiency_percentage || 0), 0) / machineData.length || 0
                }
            };
        } catch (error) {
            console.error('Machine Status error:', error);
            throw new Error('Failed to fetch machine status data');
        }
    }

    /**
     * Get All Dashboard Data untuk Index Page
     */
    async getDashboardData() {
        try {
            const [wipStock, fgStock, materialComponentStock, scheduleDelivery, machineStatus] = await Promise.all([
                this.getWIPStock(),
                this.getFGStock(),
                this.getMaterialComponentStock(),
                this.getScheduleDelivery(),
                this.getMachineStatus()
            ]);

            return {
                success: true,
                data: {
                    wip_stock: wipStock.data,
                    wip_summary: wipStock.summary,
                    fg_stock: fgStock.data,
                    fg_summary: fgStock.summary,
                    material_component_stock: {
                        materials: materialComponentStock.data.filter(item => item.type === 'MATERIAL'),
                        components: materialComponentStock.data.filter(item => item.type === 'COMPONENT'),
                        combined: materialComponentStock.data
                    },
                    material_component_summary: materialComponentStock.summary,
                    schedule_delivery: scheduleDelivery.data,
                    schedule_summary: scheduleDelivery.summary,
                    machine_status: machineStatus.data,
                    machine_summary: machineStatus.summary
                },
                last_updated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Dashboard Data error:', error);
            throw new Error('Failed to fetch dashboard data');
        }
    }
}

module.exports = new InventoryService();
