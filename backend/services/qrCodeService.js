/**
 * QR Code Service - Handle QR Code Operations
 * PT. Topline Evergreen Manufacturing
 * Menangani scan QR code untuk input data dan lot number tracking
 */

const { execute } = require('../config/databaseAdapter');
const crypto = require('crypto');

class QRCodeService {
    /**
     * Generate QR Code data untuk part number dengan lot number
     */
    generateQRData(partnumber, customer, lotnumber, type = 'PRODUCTION') {
        const timestamp = new Date().toISOString();
        const qrData = {
            partnumber,
            customer,
            lotnumber,
            type,
            timestamp,
            id: crypto.randomBytes(8).toString('hex')
        };

        return {
            success: true,
            qr_data: qrData,
            qr_string: JSON.stringify(qrData)
        };
    }

    /**
     * Validate dan Parse QR Code data
     */
    parseQRData(qrString) {
        try {
            const qrData = JSON.parse(qrString);
            
            // Validate required fields
            if (!qrData.partnumber || !qrData.customer || !qrData.lotnumber) {
                throw new Error('Invalid QR code: Missing required fields');
            }

            return {
                success: true,
                data: qrData,
                is_valid: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                is_valid: false
            };
        }
    }

    /**
     * Register stock menggunakan QR Code scan
     */
    async registerStockByQR(qrString, quantity, location, operator, stockType = 'WIP') {
        try {
            // Parse QR data
            const qrResult = this.parseQRData(qrString);
            if (!qrResult.success) {
                throw new Error(qrResult.error);
            }

            const { partnumber, customer, lotnumber } = qrResult.data;

            // Validate partnumber exists in BOM
            const [bomCheck] = await pool.execute(
                'SELECT * FROM billofmaterial WHERE partnumber = ? AND customer = ?',
                [partnumber, customer]
            );

            if (bomCheck.length === 0) {
                throw new Error('Part number tidak terdaftar dalam BOM');
            }

            const bomData = bomCheck[0];

            // Insert stock berdasarkan type
            let insertQuery, insertParams;
            
            switch (stockType.toUpperCase()) {
                case 'WIP':
                    insertQuery = `
                        INSERT INTO wip (partnumber, customer, model, description, quantity, location, lotnumber, operator, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                    `;
                    insertParams = [partnumber, customer, bomData.model, bomData.description, quantity, location, lotnumber, operator];
                    break;

                case 'FG':
                    insertQuery = `
                        INSERT INTO fg (partnumber, customer, model, description, quantity, location, lotnumber, operator, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                    `;
                    insertParams = [partnumber, customer, bomData.model, bomData.description, quantity, location, lotnumber, operator];
                    break;

                case 'MATERIAL':
                    insertQuery = `
                        INSERT INTO material (material_code, material_name, quantity, unit, location, lotnumber, operator, created_at)
                        VALUES (?, ?, ?, 'PCS', ?, ?, ?, datetime('now'))
                    `;
                    insertParams = [partnumber, bomData.description, quantity, location, lotnumber, operator];
                    break;

                case 'COMPONENT':
                    insertQuery = `
                        INSERT INTO component (component_code, component_name, quantity, unit, location, lotnumber, operator, created_at)
                        VALUES (?, ?, ?, 'PCS', ?, ?, ?, datetime('now'))
                    `;
                    insertParams = [partnumber, bomData.description, quantity, location, lotnumber, operator];
                    break;

                default:
                    throw new Error('Invalid stock type');
            }

            const [result] = await pool.execute(insertQuery, insertParams);

            // Log transaction untuk tracking
            await this.logStockTransaction({
                transaction_type: 'QR_REGISTER',
                stock_type: stockType,
                partnumber,
                customer,
                lotnumber,
                quantity,
                location,
                operator,
                qr_data: qrResult.data
            });

            return {
                success: true,
                message: `Stock ${stockType} berhasil didaftarkan via QR scan`,
                data: {
                    id: result.insertId,
                    partnumber,
                    customer,
                    lotnumber,
                    quantity,
                    location,
                    stock_type: stockType
                }
            };

        } catch (error) {
            console.error('QR Stock Registration error:', error);
            throw new Error(`Failed to register stock via QR: ${error.message}`);
        }
    }

    /**
     * Input Production Output menggunakan QR Code
     */
    async inputProductionByQR(qrString, quantity, quantityNG, machine, operator, shift) {
        try {
            // Parse QR data
            const qrResult = this.parseQRData(qrString);
            if (!qrResult.success) {
                throw new Error(qrResult.error);
            }

            const { partnumber, customer, lotnumber } = qrResult.data;

            // Get BOM data
            const [bomData] = await pool.execute(
                'SELECT * FROM billofmaterial WHERE partnumber = ? AND customer = ?',
                [partnumber, customer]
            );

            if (bomData.length === 0) {
                throw new Error('Part number tidak terdaftar dalam BOM');
            }

            const bom = bomData[0];

            // Insert production output
            const [result] = await pool.execute(`
                INSERT INTO outputmc (
                    customer, partnumber, model, description, quantity, quantity_ng,
                    machine, operator, shift, lotnumber, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `, [customer, partnumber, bom.model, bom.description, quantity, quantityNG, machine, operator, shift, lotnumber]);

            // Update WIP stock (consume WIP untuk production)
            await this.updateWIPStockAfterProduction(partnumber, customer, lotnumber, quantity + quantityNG);

            // Add to FG stock jika quantity > 0
            if (quantity > 0) {
                await pool.execute(`
                    INSERT INTO fg (partnumber, customer, model, description, quantity, location, lotnumber, operator, created_at)
                    VALUES (?, ?, ?, ?, ?, 'FG_WAREHOUSE', ?, ?, datetime('now'))
                `, [partnumber, customer, bom.model, bom.description, quantity, lotnumber, operator]);
            }

            // Log transaction
            await this.logStockTransaction({
                transaction_type: 'QR_PRODUCTION',
                stock_type: 'OUTPUT',
                partnumber,
                customer,
                lotnumber,
                quantity,
                quantity_ng: quantityNG,
                machine,
                operator,
                qr_data: qrResult.data
            });

            return {
                success: true,
                message: 'Production output berhasil dicatat via QR scan',
                data: {
                    id: result.insertId,
                    partnumber,
                    customer,
                    lotnumber,
                    good_quantity: quantity,
                    ng_quantity: quantityNG,
                    machine,
                    operator
                }
            };

        } catch (error) {
            console.error('QR Production Input error:', error);
            throw new Error(`Failed to input production via QR: ${error.message}`);
        }
    }

    /**
     * Update WIP stock setelah production
     */
    async updateWIPStockAfterProduction(partnumber, customer, lotnumber, consumedQuantity) {
        try {
            // Find matching WIP records
            const [wipRecords] = await pool.execute(`
                SELECT * FROM wip 
                WHERE partnumber = ? AND customer = ? AND lotnumber = ? AND quantity > 0
                ORDER BY created_at ASC
            `, [partnumber, customer, lotnumber]);

            let remainingToConsume = consumedQuantity;

            for (const wip of wipRecords) {
                if (remainingToConsume <= 0) break;

                if (wip.quantity >= remainingToConsume) {
                    // Update this record
                    await pool.execute(`
                        UPDATE wip SET quantity = quantity - ? WHERE id = ?
                    `, [remainingToConsume, wip.id]);
                    remainingToConsume = 0;
                } else {
                    // Consume all of this record
                    remainingToConsume -= wip.quantity;
                    await pool.execute(`
                        UPDATE wip SET quantity = 0 WHERE id = ?
                    `, [wip.id]);
                }
            }

            return {
                success: true,
                consumed_quantity: consumedQuantity - remainingToConsume
            };

        } catch (error) {
            console.error('WIP Stock Update error:', error);
            throw error;
        }
    }

    /**
     * Get QR Code history by lot number
     */
    async getQRHistory(lotnumber) {
        try {
            const [history] = await pool.execute(`
                SELECT 
                    'PRODUCTION' as transaction_type,
                    partnumber,
                    customer,
                    quantity,
                    quantity_ng,
                    machine,
                    operator,
                    created_at
                FROM outputmc 
                WHERE lotnumber = ?
                
                UNION ALL
                
                SELECT 
                    'WIP_STOCK' as transaction_type,
                    partnumber,
                    customer,
                    quantity,
                    0 as quantity_ng,
                    location as machine,
                    operator,
                    created_at
                FROM wip 
                WHERE lotnumber = ?
                
                UNION ALL
                
                SELECT 
                    'FG_STOCK' as transaction_type,
                    partnumber,
                    customer,
                    quantity,
                    0 as quantity_ng,
                    location as machine,
                    operator,
                    created_at
                FROM fg 
                WHERE lotnumber = ?
                
                ORDER BY created_at DESC
            `, [lotnumber, lotnumber, lotnumber]);

            return {
                success: true,
                data: history,
                summary: {
                    total_transactions: history.length,
                    total_production: history.filter(h => h.transaction_type === 'PRODUCTION').length,
                    total_stock_movements: history.filter(h => h.transaction_type !== 'PRODUCTION').length
                }
            };

        } catch (error) {
            console.error('QR History error:', error);
            throw new Error('Failed to fetch QR history');
        }
    }

    /**
     * Log stock transactions untuk audit trail
     */
    async logStockTransaction(transactionData) {
        try {
            await pool.execute(`
                INSERT INTO stock_transactions (
                    transaction_type, stock_type, partnumber, customer, lotnumber,
                    quantity, quantity_ng, location, machine, operator, qr_data, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `, [
                transactionData.transaction_type,
                transactionData.stock_type,
                transactionData.partnumber,
                transactionData.customer,
                transactionData.lotnumber,
                transactionData.quantity || 0,
                transactionData.quantity_ng || 0,
                transactionData.location || null,
                transactionData.machine || null,
                transactionData.operator,
                JSON.stringify(transactionData.qr_data)
            ]);

            return { success: true };
        } catch (error) {
            console.error('Transaction Log error:', error);
            // Don't throw error here to avoid breaking main operation
            return { success: false, error: error.message };
        }
    }
}

module.exports = new QRCodeService();
