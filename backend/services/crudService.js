/**
 * CRUD Service - Handle Create, Read, Update, Delete Operations
 * PT. Topline Evergreen Manufacturing
 * Menangani operasi CRUD untuk website admin
 */

const { execute } = require('../config/databaseAdapter');

class CRUDService {
    /**
     * Generic CRUD operations untuk semua table
     */

    // =============================================================================
    // BILL OF MATERIAL CRUD
    // =============================================================================

    async createBOM(data) {
        try {
            const { partnumber, customer, model, description } = data;
            
            const [result] = await pool.execute(`
                INSERT INTO billofmaterial (partnumber, customer, model, description, created_at)
                VALUES (?, ?, ?, ?, datetime('now'))
            `, [partnumber, customer, model, description]);

            return {
                success: true,
                data: { id: result.insertId, ...data },
                message: 'BOM created successfully'
            };
        } catch (error) {
            throw new Error(`Failed to create BOM: ${error.message}`);
        }
    }

    async updateBOM(partnumber, customer, data) {
        try {
            const updateFields = [];
            const params = [];
            
            if (data.model !== undefined) {
                updateFields.push('model = ?');
                params.push(data.model);
            }
            if (data.description !== undefined) {
                updateFields.push('description = ?');
                params.push(data.description);
            }
            
            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }
            
            updateFields.push('updated_at = datetime(\'now\')');
            params.push(partnumber, customer);
            
            const [result] = await pool.execute(`
                UPDATE billofmaterial 
                SET ${updateFields.join(', ')} 
                WHERE partnumber = ? AND customer = ?
            `, params);

            if (result.affectedRows === 0) {
                throw new Error('BOM not found');
            }

            return {
                success: true,
                message: 'BOM updated successfully'
            };
        } catch (error) {
            throw new Error(`Failed to update BOM: ${error.message}`);
        }
    }

    async deleteBOM(partnumber, customer) {
        try {
            // Check if BOM is being used in other tables
            const [wipCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM wip WHERE partnumber = ? AND customer = ?',
                [partnumber, customer]
            );
            
            const [fgCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM fg WHERE partnumber = ? AND customer = ?',
                [partnumber, customer]
            );
            
            const [outputCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM outputmc WHERE partnumber = ? AND customer = ?',
                [partnumber, customer]
            );

            if (wipCount[0].count > 0 || fgCount[0].count > 0 || outputCount[0].count > 0) {
                throw new Error('Cannot delete BOM: Part number is being used in production/inventory');
            }

            const [result] = await pool.execute(
                'DELETE FROM billofmaterial WHERE partnumber = ? AND customer = ?',
                [partnumber, customer]
            );

            if (result.affectedRows === 0) {
                throw new Error('BOM not found');
            }

            return {
                success: true,
                message: 'BOM deleted successfully'
            };
        } catch (error) {
            throw new Error(`Failed to delete BOM: ${error.message}`);
        }
    }

    // =============================================================================
    // OUTPUT MC CRUD
    // =============================================================================

    async updateOutputMC(id, data) {
        try {
            const updateFields = [];
            const params = [];
            
            if (data.quantity !== undefined) {
                updateFields.push('quantity = ?');
                params.push(data.quantity);
            }
            if (data.quantity_ng !== undefined) {
                updateFields.push('quantity_ng = ?');
                params.push(data.quantity_ng);
            }
            if (data.machine !== undefined) {
                updateFields.push('machine = ?');
                params.push(data.machine);
            }
            if (data.operator !== undefined) {
                updateFields.push('operator = ?');
                params.push(data.operator);
            }
            if (data.shift !== undefined) {
                updateFields.push('shift = ?');
                params.push(data.shift);
            }
            
            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }
            
            updateFields.push('updated_at = datetime(\'now\')');
            params.push(id);
            
            const [result] = await pool.execute(`
                UPDATE outputmc 
                SET ${updateFields.join(', ')} 
                WHERE id = ?
            `, params);

            if (result.affectedRows === 0) {
                throw new Error('Output record not found');
            }

            return {
                success: true,
                message: 'Output record updated successfully'
            };
        } catch (error) {
            throw new Error(`Failed to update output record: ${error.message}`);
        }
    }

    async deleteOutputMC(id) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM outputmc WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                throw new Error('Output record not found');
            }

            return {
                success: true,
                message: 'Output record deleted successfully'
            };
        } catch (error) {
            throw new Error(`Failed to delete output record: ${error.message}`);
        }
    }

    // =============================================================================
    // SCHEDULE CRUD
    // =============================================================================

    async createSchedule(data) {
        try {
            const { 
                partnumber, description, supplier, delivery_date, 
                delivery_quantity, daily_schedule, minimum_stock, 
                type = 'MATERIAL', status = 'SCHEDULED' 
            } = data;
            
            const [result] = await pool.execute(`
                INSERT INTO schedule (
                    partnumber, description, supplier, delivery_date, 
                    delivery_quantity, daily_schedule, minimum_stock, 
                    type, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `, [
                partnumber, description, supplier, delivery_date,
                delivery_quantity, daily_schedule, minimum_stock, 
                type, status
            ]);

            return {
                success: true,
                data: { id: result.insertId, ...data },
                message: 'Schedule created successfully'
            };
        } catch (error) {
            throw new Error(`Failed to create schedule: ${error.message}`);
        }
    }

    async updateSchedule(id, data) {
        try {
            const updateFields = [];
            const params = [];
            
            const allowedFields = [
                'description', 'supplier', 'delivery_date', 'delivery_quantity',
                'daily_schedule', 'minimum_stock', 'type', 'status'
            ];
            
            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    updateFields.push(`${field} = ?`);
                    params.push(data[field]);
                }
            });
            
            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }
            
            updateFields.push('updated_at = datetime(\'now\')');
            params.push(id);
            
            const [result] = await pool.execute(`
                UPDATE schedule 
                SET ${updateFields.join(', ')} 
                WHERE id = ?
            `, params);

            if (result.affectedRows === 0) {
                throw new Error('Schedule not found');
            }

            return {
                success: true,
                message: 'Schedule updated successfully'
            };
        } catch (error) {
            throw new Error(`Failed to update schedule: ${error.message}`);
        }
    }

    async deleteSchedule(id) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM schedule WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                throw new Error('Schedule not found');
            }

            return {
                success: true,
                message: 'Schedule deleted successfully'
            };
        } catch (error) {
            throw new Error(`Failed to delete schedule: ${error.message}`);
        }
    }

    // =============================================================================
    // MACHINE STATUS CRUD
    // =============================================================================

    async updateMachineStatus(machineId, data) {
        try {
            const updateFields = [];
            const params = [];
            
            const allowedFields = [
                'machine_name', 'department', 'status', 'current_partnumber',
                'operator', 'shift', 'efficiency_percentage'
            ];
            
            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    updateFields.push(`${field} = ?`);
                    params.push(data[field]);
                }
            });
            
            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }
            
            updateFields.push('updated_at = datetime(\'now\')');
            if (data.status === 'RUNNING') {
                updateFields.push('last_output_time = datetime(\'now\')');
            }
            
            params.push(machineId);
            
            const [result] = await pool.execute(`
                UPDATE machine_status 
                SET ${updateFields.join(', ')} 
                WHERE machine_id = ?
            `, params);

            if (result.affectedRows === 0) {
                throw new Error('Machine not found');
            }

            return {
                success: true,
                message: 'Machine status updated successfully'
            };
        } catch (error) {
            throw new Error(`Failed to update machine status: ${error.message}`);
        }
    }

    async createMachine(data) {
        try {
            const { 
                machine_id, machine_name, department, 
                status = 'IDLE', operator = null, shift = '1',
                efficiency_percentage = 0
            } = data;
            
            const [result] = await pool.execute(`
                INSERT INTO machine_status (
                    machine_id, machine_name, department, status,
                    operator, shift, efficiency_percentage, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `, [machine_id, machine_name, department, status, operator, shift, efficiency_percentage]);

            return {
                success: true,
                data: { id: result.insertId, ...data },
                message: 'Machine created successfully'
            };
        } catch (error) {
            throw new Error(`Failed to create machine: ${error.message}`);
        }
    }

    // =============================================================================
    // MATERIAL & COMPONENT CRUD
    // =============================================================================

    async updateMaterial(id, data) {
        try {
            const updateFields = [];
            const params = [];
            
            const allowedFields = [
                'material_name', 'supplier', 'quantity', 'unit', 'location'
            ];
            
            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    updateFields.push(`${field} = ?`);
                    params.push(data[field]);
                }
            });
            
            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }
            
            updateFields.push('updated_at = datetime(\'now\')');
            params.push(id);
            
            const [result] = await pool.execute(`
                UPDATE material 
                SET ${updateFields.join(', ')} 
                WHERE id = ?
            `, params);

            if (result.affectedRows === 0) {
                throw new Error('Material not found');
            }

            return {
                success: true,
                message: 'Material updated successfully'
            };
        } catch (error) {
            throw new Error(`Failed to update material: ${error.message}`);
        }
    }

    async updateComponent(id, data) {
        try {
            const updateFields = [];
            const params = [];
            
            const allowedFields = [
                'component_name', 'supplier', 'quantity', 'unit', 'location'
            ];
            
            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    updateFields.push(`${field} = ?`);
                    params.push(data[field]);
                }
            });
            
            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }
            
            updateFields.push('updated_at = datetime(\'now\')');
            params.push(id);
            
            const [result] = await pool.execute(`
                UPDATE component 
                SET ${updateFields.join(', ')} 
                WHERE id = ?
            `, params);

            if (result.affectedRows === 0) {
                throw new Error('Component not found');
            }

            return {
                success: true,
                message: 'Component updated successfully'
            };
        } catch (error) {
            throw new Error(`Failed to update component: ${error.message}`);
        }
    }

    // =============================================================================
    // BULK OPERATIONS
    // =============================================================================

    async bulkDelete(tableName, ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error('Invalid IDs array');
            }

            // Validate table name untuk security
            const allowedTables = ['outputmc', 'schedule', 'material', 'component'];
            if (!allowedTables.includes(tableName)) {
                throw new Error('Invalid table name');
            }

            const placeholders = ids.map(() => '?').join(',');
            const [result] = await pool.execute(
                `DELETE FROM ${tableName} WHERE id IN (${placeholders})`,
                ids
            );

            return {
                success: true,
                deleted_count: result.affectedRows,
                message: `${result.affectedRows} records deleted successfully`
            };
        } catch (error) {
            throw new Error(`Failed to bulk delete: ${error.message}`);
        }
    }

    async bulkUpdate(tableName, updates) {
        try {
            if (!Array.isArray(updates) || updates.length === 0) {
                throw new Error('Invalid updates array');
            }

            const allowedTables = ['outputmc', 'schedule', 'material', 'component', 'machine_status'];
            if (!allowedTables.includes(tableName)) {
                throw new Error('Invalid table name');
            }

            const results = [];
            
            for (const update of updates) {
                const { id, data } = update;
                
                try {
                    let result;
                    switch (tableName) {
                        case 'outputmc':
                            result = await this.updateOutputMC(id, data);
                            break;
                        case 'schedule':
                            result = await this.updateSchedule(id, data);
                            break;
                        case 'material':
                            result = await this.updateMaterial(id, data);
                            break;
                        case 'component':
                            result = await this.updateComponent(id, data);
                            break;
                        case 'machine_status':
                            result = await this.updateMachineStatus(id, data);
                            break;
                    }
                    
                    results.push({ id, success: true, result });
                } catch (error) {
                    results.push({ id, success: false, error: error.message });
                }
            }

            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;

            return {
                success: true,
                results,
                summary: {
                    total: updates.length,
                    success: successCount,
                    failed: failCount
                },
                message: `Bulk update completed: ${successCount} success, ${failCount} failed`
            };
        } catch (error) {
            throw new Error(`Failed to bulk update: ${error.message}`);
        }
    }

    // =============================================================================
    // VALIDATION HELPERS
    // =============================================================================

    async validatePartNumber(partnumber, customer) {
        try {
            const [result] = await pool.execute(
                'SELECT * FROM billofmaterial WHERE partnumber = ? AND customer = ?',
                [partnumber, customer]
            );
            
            return {
                exists: result.length > 0,
                data: result[0] || null
            };
        } catch (error) {
            throw new Error(`Failed to validate part number: ${error.message}`);
        }
    }

    async validateMachine(machineId) {
        try {
            const [result] = await pool.execute(
                'SELECT * FROM machine_status WHERE machine_id = ?',
                [machineId]
            );
            
            return {
                exists: result.length > 0,
                data: result[0] || null
            };
        } catch (error) {
            throw new Error(`Failed to validate machine: ${error.message}`);
        }
    }
}

module.exports = new CRUDService();
