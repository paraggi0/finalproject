/**
 * Dashboard Service - Business Logic untuk Dashboard Management
 * PT. Topline Evergreen Manufacturing
 * Menangani logic untuk dashboard masing-masing departement
 */

const { execute } = require('../config/databaseAdapter');
const inventoryService = require('./inventoryService');

class DashboardService {
    /**
     * Get Production Department Dashboard Data
     */
    async getProductionDashboard() {
        try {
            // Get today's production output
            const [todayOutput] = await execute(`
                SELECT 
                    o.customer,
                    o.partnumber,
                    o.model,
                    o.description,
                    SUM(o.quantity) as total_good,
                    SUM(o.quantity_ng) as total_ng,
                    COUNT(DISTINCT o.machine) as machines_used,
                    COUNT(DISTINCT o.operator) as operators_count,
                    MAX(o.created_at) as last_production
                FROM outputmc o
                WHERE DATE(o.created_at) = DATE('now')
                GROUP BY o.customer, o.partnumber, o.model, o.description
                ORDER BY total_good DESC
            `);

            // Get production efficiency by machine
            const [machineEfficiency] = await execute(`
                SELECT 
                    o.machine,
                    COUNT(*) as total_runs,
                    SUM(o.quantity) as total_good,
                    SUM(o.quantity_ng) as total_ng,
                    ROUND(
                        (SUM(o.quantity) * 100.0) / NULLIF(SUM(o.quantity + o.quantity_ng), 0), 2
                    ) as efficiency_percentage
                FROM outputmc o
                WHERE DATE(o.created_at) = DATE('now')
                GROUP BY o.machine
                ORDER BY efficiency_percentage DESC
            `);

            // Get operator performance
            const [operatorPerformance] = await execute(`
                SELECT 
                    o.operator,
                    COUNT(*) as total_runs,
                    SUM(o.quantity) as total_good,
                    SUM(o.quantity_ng) as total_ng,
                    COUNT(DISTINCT o.partnumber) as parts_produced
                FROM outputmc o
                WHERE DATE(o.created_at) = DATE('now')
                GROUP BY o.operator
                ORDER BY total_good DESC
            `);

            return {
                success: true,
                data: {
                    today_production: todayOutput,
                    machine_efficiency: machineEfficiency,
                    operator_performance: operatorPerformance
                },
                summary: {
                    total_good_today: todayOutput.reduce((sum, item) => sum + (item.total_good || 0), 0),
                    total_ng_today: todayOutput.reduce((sum, item) => sum + (item.total_ng || 0), 0),
                    total_efficiency: machineEfficiency.reduce((sum, item) => sum + (item.efficiency_percentage || 0), 0) / machineEfficiency.length || 0,
                    active_machines: machineEfficiency.length,
                    active_operators: operatorPerformance.length
                }
            };
        } catch (error) {
            console.error('Production Dashboard error:', error);
            throw new Error('Failed to fetch production dashboard data');
        }
    }

    /**
     * Get Warehouse Department Dashboard Data
     */
    async getWarehouseDashboard() {
        try {
            // Get current stock levels using corrected table names
            const [stockMovement] = await execute(`
                SELECT 
                    'WIP' as stock_type,
                    COUNT(*) as movement_count,
                    SUM(quantity) as total_quantity
                FROM wip 
                
                UNION ALL
                
                SELECT 
                    'MATERIAL' as stock_type,
                    COUNT(*) as movement_count,
                    SUM(quantity) as total_quantity
                FROM material 
                
                UNION ALL
                
                SELECT 
                    'COMPONENT' as stock_type,
                    COUNT(*) as movement_count,
                    SUM(quantity) as total_quantity
                FROM component
            `);

            // Get stock data using inventory service
            const wipStock = await inventoryService.getWIPStock();
            const materialStock = await inventoryService.getMaterialComponentStock();

            // Filter low stock items using correct data structure
            const lowStockAlerts = [
                ...wipStock.data.filter(item => item.stock_status === 'LOW'),
                ...materialStock.data.filter(item => item.stock_status === 'LOW')
            ];

            return {
                success: true,
                data: {
                    stock_movement: stockMovement,
                    low_stock_alerts: lowStockAlerts,
                    wip_summary: wipStock.summary,
                    material_summary: materialStock.summary
                },
                summary: {
                    total_movements: stockMovement.reduce((sum, item) => sum + (item.movement_count || 0), 0),
                    total_quantity: stockMovement.reduce((sum, item) => sum + (item.total_quantity || 0), 0),
                    low_stock_count: lowStockAlerts.length
                }
            };
        } catch (error) {
            console.error('Warehouse Dashboard error:', error);
            throw new Error('Failed to fetch warehouse dashboard data');
        }
    }

    /**
     * Get Quality Control Dashboard Data
     */
    async getQualityDashboard() {
        try {
            // Get quality metrics for today
            const [qualityMetrics] = await execute(`
                SELECT 
                    o.partnumber,
                    o.customer,
                    o.model,
                    o.description,
                    SUM(o.quantity) as good_quantity,
                    SUM(o.quantity_ng) as ng_quantity,
                    ROUND(
                        (SUM(o.quantity) * 100.0) / NULLIF(SUM(o.quantity + o.quantity_ng), 0), 2
                    ) as quality_rate,
                    COUNT(*) as total_lots
                FROM outputmc o
                WHERE DATE(o.created_at) = DATE('now')
                GROUP BY o.partnumber, o.customer, o.model, o.description
                HAVING SUM(o.quantity + o.quantity_ng) > 0
                ORDER BY quality_rate ASC
            `);

            // Get NG analysis by machine
            const [ngByMachine] = await execute(`
                SELECT 
                    o.machine,
                    SUM(o.quantity) as good_quantity,
                    SUM(o.quantity_ng) as ng_quantity,
                    ROUND(
                        (SUM(o.quantity_ng) * 100.0) / NULLIF(SUM(o.quantity + o.quantity_ng), 0), 2
                    ) as ng_rate
                FROM outputmc o
                WHERE DATE(o.created_at) = DATE('now')
                GROUP BY o.machine
                HAVING SUM(o.quantity + o.quantity_ng) > 0
                ORDER BY ng_rate DESC
            `);

            return {
                success: true,
                data: {
                    quality_metrics: qualityMetrics,
                    ng_by_machine: ngByMachine
                },
                summary: {
                    total_lots_today: qualityMetrics.reduce((sum, item) => sum + (item.total_lots || 0), 0),
                    avg_quality_rate: qualityMetrics.reduce((sum, item) => sum + (item.quality_rate || 0), 0) / qualityMetrics.length || 0,
                    total_ng_today: qualityMetrics.reduce((sum, item) => sum + (item.ng_quantity || 0), 0)
                }
            };
        } catch (error) {
            console.error('Quality Dashboard error:', error);
            throw new Error('Failed to fetch quality dashboard data');
        }
    }

    /**
     * Get Planning Department Dashboard Data
     */
    async getPlanningDashboard() {
        try {
            // Get schedule vs actual production
            const [scheduleVsActual] = await execute(`
                SELECT 
                    s.partnumber,
                    s.description,
                    s.daily_schedule,
                    COALESCE(SUM(o.quantity), 0) as actual_production,
                    ROUND(
                        (COALESCE(SUM(o.quantity), 0) * 100.0) / NULLIF(s.daily_schedule, 0), 2
                    ) as achievement_rate
                FROM schedule s
                LEFT JOIN outputmc o ON s.partnumber = o.partnumber 
                    AND DATE(o.created_at) = DATE('now')
                WHERE s.daily_schedule > 0
                GROUP BY s.partnumber, s.description, s.daily_schedule
                ORDER BY achievement_rate ASC
            `);

            // Get delivery schedule status
            const scheduleDelivery = await inventoryService.getScheduleDelivery();

            return {
                success: true,
                data: {
                    schedule_vs_actual: scheduleVsActual,
                    delivery_schedule: scheduleDelivery.data,
                    delivery_summary: scheduleDelivery.summary
                },
                summary: {
                    total_scheduled_items: scheduleVsActual.length,
                    on_target_items: scheduleVsActual.filter(item => item.achievement_rate >= 100).length,
                    behind_schedule_items: scheduleVsActual.filter(item => item.achievement_rate < 80).length
                }
            };
        } catch (error) {
            console.error('Planning Dashboard error:', error);
            throw new Error('Failed to fetch planning dashboard data');
        }
    }

    /**
     * Get Department-specific Dashboard Data
     */
    async getDepartmentDashboard(department) {
        try {
            switch (department.toLowerCase()) {
                case 'production':
                    return await this.getProductionDashboard();
                case 'warehouse':
                    return await this.getWarehouseDashboard();
                case 'quality':
                    return await this.getQualityDashboard();
                case 'planning':
                    return await this.getPlanningDashboard();
                default:
                    throw new Error('Invalid department specified');
            }
        } catch (error) {
            console.error(`${department} Dashboard error:`, error);
            throw error;
        }
    }

    /**
     * Get Overall Management Dashboard
     */
    async getManagementDashboard() {
        try {
            const [production, warehouse, quality, planning] = await Promise.all([
                this.getProductionDashboard(),
                this.getWarehouseDashboard(),
                this.getQualityDashboard(),
                this.getPlanningDashboard()
            ]);

            const dashboardData = await inventoryService.getDashboardData();

            return {
                success: true,
                data: {
                    overview: dashboardData.data,
                    departments: {
                        production: production.data,
                        warehouse: warehouse.data,
                        quality: quality.data,
                        planning: planning.data
                    }
                },
                summary: {
                    production: production.summary,
                    warehouse: {
                        total_movements: warehouse.data.stock_movement.reduce((sum, item) => sum + (item.movement_count || 0), 0),
                        low_stock_count: warehouse.data.low_stock_alerts.length
                    },
                    quality: quality.summary,
                    planning: planning.summary
                },
                last_updated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Management Dashboard error:', error);
            throw new Error('Failed to fetch management dashboard data');
        }
    }
}

module.exports = new DashboardService();
