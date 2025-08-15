/**
 * WIP Inventory Service
 * PT. Topline Evergreen Manufacturing
 * 
 * Logika Inventory WIP:
 * 1. Output MC → Menambah WIP (+)
 * 2. Transfer QC → Mengurangi WIP (-)
 * 3. Hasil disimpan di tabel WIP
 */

const { execute } = require('../config/databaseAdapter');

class WIPInventoryService {
    /**
     * Menambah WIP dari Output MC
     * @param {Object} outputData - Data dari output MC
     */
    async addToWIPFromOutput(outputData) {
        try {
            const {
                customer, // Add customer field
                partnumber,
                model,
                description,
                quantity,
                machine,
                operator,
                lotnumber,
                shift = '1'
            } = outputData;

            // Cek apakah sudah ada WIP dengan partnumber dan lotnumber yang sama
            const [existingWIP] = await pool.execute(`
                SELECT id, quantity FROM wip 
                WHERE partnumber = ? AND lotnumber = ?
            `, [partnumber, lotnumber]);

            let wipResult;

            if (existingWIP.length > 0) {
                // Update quantity yang sudah ada (tambah)
                const newQuantity = existingWIP[0].quantity + parseInt(quantity);
                
                await pool.execute(`
                    UPDATE wip 
                    SET quantity = ?, 
                        operator = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [newQuantity, operator, existingWIP[0].id]);

                wipResult = {
                    id: existingWIP[0].id,
                    action: 'updated',
                    previous_quantity: existingWIP[0].quantity,
                    new_quantity: newQuantity,
                    added_quantity: parseInt(quantity)
                };
            } else {
                // Buat WIP baru
                const result = await pool.execute(`
                    INSERT INTO wip (
                        customer, partnumber, model, description, lotnumber, 
                        quantity, operator, location, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    customer || 'GENERAL', // Default customer if not provided
                    partnumber,
                    model || 'From Output MC',
                    description || 'WIP from production output',
                    lotnumber,
                    parseInt(quantity),
                    operator,
                    'Production Floor',
                    'available'
                ]);

                wipResult = {
                    id: result.insertId,
                    action: 'created',
                    quantity: parseInt(quantity)
                };
            }

            // Log transaksi WIP
            await this.logWIPTransaction({
                wip_id: wipResult.id,
                transaction_type: 'ADD_FROM_OUTPUT',
                quantity: parseInt(quantity),
                partnumber,
                lotnumber,
                operator,
                source: 'output_mc',
                notes: `Added from Output MC - Machine: ${machine}`
            });

            return {
                success: true,
                message: 'WIP inventory updated successfully',
                data: wipResult
            };

        } catch (error) {
            console.error('Error adding to WIP from output:', error);
            throw new Error(`Failed to add WIP from output: ${error.message}`);
        }
    }

    /**
     * Mengurangi WIP untuk Transfer QC
     * @param {Object} transferData - Data transfer QC
     */
    async reduceWIPForTransfer(transferData) {
        try {
            const {
                partnumber,
                lotnumber,
                quantity_transfer,
                pic_qc,
                pic_production,
                notes
            } = transferData;

            // Cari WIP yang akan di-transfer
            const [wipData] = await pool.execute(`
                SELECT id, quantity FROM wip 
                WHERE partnumber = ? AND lotnumber = ? AND status = 'available'
            `, [partnumber, lotnumber]);

            if (wipData.length === 0) {
                throw new Error(`WIP tidak ditemukan untuk partnumber: ${partnumber}, lotnumber: ${lotnumber}`);
            }

            const currentWIP = wipData[0];
            const transferQty = parseInt(quantity_transfer);

            if (currentWIP.quantity < transferQty) {
                throw new Error(`Quantity WIP tidak cukup. Available: ${currentWIP.quantity}, Requested: ${transferQty}`);
            }

            const remainingQuantity = currentWIP.quantity - transferQty;

            // Update WIP quantity (kurangi)
            if (remainingQuantity > 0) {
                await pool.execute(`
                    UPDATE wip 
                    SET quantity = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [remainingQuantity, currentWIP.id]);
            } else {
                // Jika quantity menjadi 0, update status menjadi 'transferred'
                await pool.execute(`
                    UPDATE wip 
                    SET quantity = 0,
                        status = 'transferred',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [currentWIP.id]);
            }

            // Catat di tabel tfrwipqc (Transfer WIP to QC)
            const transferResult = await pool.execute(`
                INSERT INTO tfrwipqc (
                    qc_batch_id, partnumber, model, quantity_sent, 
                    from_process, qc_priority, transfer_time, qc_status,
                    qc_inspector, transfer_operator, remarks
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                `QC-${lotnumber}-${Date.now()}`, // qc_batch_id
                partnumber,
                'WIP Transfer', // model - we can enhance this later
                transferQty,
                'WIP_PRODUCTION', // from_process
                'normal', // qc_priority
                new Date().toISOString(), // transfer_time
                'pending_qc', // qc_status
                pic_qc,
                pic_production, // transfer_operator
                notes || 'Transfer to QC'
            ]);

            // Log transaksi WIP
            await this.logWIPTransaction({
                wip_id: currentWIP.id,
                transaction_type: 'REDUCE_FOR_TRANSFER',
                quantity: -transferQty, // Negative karena mengurangi
                partnumber,
                lotnumber,
                operator: pic_production,
                source: 'transfer_qc',
                notes: `Transferred to QC - PIC QC: ${pic_qc}`
            });

            return {
                success: true,
                message: 'WIP transferred to QC successfully',
                data: {
                    wip_id: currentWIP.id,
                    transfer_id: transferResult.insertId,
                    previous_quantity: currentWIP.quantity,
                    transferred_quantity: transferQty,
                    remaining_quantity: remainingQuantity,
                    status: remainingQuantity > 0 ? 'partial_transfer' : 'fully_transferred'
                }
            };

        } catch (error) {
            console.error('Error reducing WIP for transfer:', error);
            throw new Error(`Failed to transfer WIP to QC: ${error.message}`);
        }
    }

    /**
     * Log transaksi WIP untuk audit trail
     * @param {Object} transactionData - Data transaksi
     */
    async logWIPTransaction(transactionData) {
        try {
            const {
                wip_id,
                transaction_type,
                quantity,
                partnumber,
                lotnumber,
                operator,
                source,
                notes
            } = transactionData;

            // Check if wip_transactions table exists, if not skip logging
            try {
                await pool.execute(`
                    INSERT INTO wip_transactions (
                        wip_id, transaction_type, quantity_change,
                        partnumber, lotnumber, operator, 
                        source_table, notes, timestamp
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                `, [
                    wip_id,
                    transaction_type,
                    quantity,
                    partnumber,
                    lotnumber,
                    operator,
                    source,
                    notes
                ]);
            } catch (tableError) {
                console.log('⚠️ WIP transactions table not ready, skipping log:', tableError.message);
            }

        } catch (error) {
            console.error('Error logging WIP transaction:', error);
            // Don't throw error for logging, just log it
        }
    }

    /**
     * Get WIP summary untuk reporting
     * @param {string} partnumber - Optional filter by partnumber
     */
    async getWIPSummary(partnumber = null) {
        try {
            let query = `
                SELECT 
                    partnumber,
                    COUNT(*) as lot_count,
                    SUM(quantity) as total_quantity,
                    AVG(quantity) as avg_quantity_per_lot,
                    status,
                    location
                FROM wip 
            `;
            let params = [];

            if (partnumber) {
                query += ` WHERE partnumber = ?`;
                params.push(partnumber);
            }

            query += ` GROUP BY partnumber, status, location ORDER BY partnumber, status`;

            const [summary] = await pool.execute(query, params);

            return {
                success: true,
                data: summary,
                message: 'WIP summary retrieved successfully'
            };

        } catch (error) {
            console.error('Error getting WIP summary:', error);
            throw new Error(`Failed to get WIP summary: ${error.message}`);
        }
    }

    /**
     * Get WIP transaction history
     * @param {string} partnumber - Optional filter
     * @param {number} limit - Limit results
     */
    async getWIPTransactionHistory(partnumber = null, limit = 50) {
        try {
            let query = `
                SELECT 
                    wt.*,
                    w.model,
                    w.location
                FROM wip_transactions wt
                LEFT JOIN wip w ON wt.wip_id = w.id
            `;
            let params = [];

            if (partnumber) {
                query += ` WHERE wt.partnumber = ?`;
                params.push(partnumber);
            }

            query += ` ORDER BY wt.timestamp DESC LIMIT ?`;
            params.push(limit);

            const [history] = await pool.execute(query, params);

            return {
                success: true,
                data: history,
                message: 'WIP transaction history retrieved successfully'
            };

        } catch (error) {
            console.error('Error getting WIP transaction history:', error);
            throw new Error(`Failed to get WIP transaction history: ${error.message}`);
        }
    }
}

module.exports = new WIPInventoryService();
