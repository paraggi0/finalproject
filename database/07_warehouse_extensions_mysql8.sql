-- Warehouse Extension Tables for Enhanced CRUD Operations
-- Created: 2025-01-20
-- Purpose: Support complete warehouse management with delivery control, finished goods tracking, and returns

USE production_db;

-- ================================================================
-- FINISHED GOODS TABLE (Enhanced)
-- ================================================================
CREATE TABLE IF NOT EXISTS finished_goods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_number VARCHAR(50) NOT NULL,
    part_name VARCHAR(100),
    lot_number VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    location VARCHAR(50),
    quality_status ENUM('PASS', 'FAIL', 'PENDING') DEFAULT 'PENDING',
    production_date DATE,
    expiry_date DATE,
    batch_id VARCHAR(50),
    warehouse_section VARCHAR(50),
    operator VARCHAR(50),
    qc_inspector VARCHAR(50),
    notes TEXT,
    status ENUM('AVAILABLE', 'ALLOCATED', 'SHIPPED', 'RETURNED') DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    INDEX idx_part_number (part_number),
    INDEX idx_lot_number (lot_number),
    INDEX idx_status (status),
    INDEX idx_quality_status (quality_status),
    INDEX idx_created_at (created_at)
);

-- ================================================================
-- DELIVERY CONTROL TABLE  
-- ================================================================
CREATE TABLE IF NOT EXISTS delivery_control (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_address TEXT,
    delivery_date DATE NOT NULL,
    planned_time TIME,
    actual_pickup_time TIME,
    actual_delivery_time TIME,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    vehicle_number VARCHAR(20),
    delivery_status ENUM('PLANNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'DELAYED') DEFAULT 'PLANNED',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    total_weight DECIMAL(10,2),
    total_volume DECIMAL(10,2),
    delivery_instructions TEXT,
    special_requirements TEXT,
    proof_of_delivery TEXT,
    delivery_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    INDEX idx_delivery_id (delivery_id),
    INDEX idx_customer_name (customer_name),
    INDEX idx_delivery_date (delivery_date),
    INDEX idx_delivery_status (delivery_status),
    INDEX idx_priority (priority)
);

-- ================================================================
-- DELIVERY ORDERS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS delivery_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    delivery_control_id INT,
    part_number VARCHAR(50) NOT NULL,
    part_name VARCHAR(100),
    lot_number VARCHAR(50),
    ordered_quantity DECIMAL(10,2) NOT NULL,
    delivered_quantity DECIMAL(10,2) DEFAULT 0,
    remaining_quantity DECIMAL(10,2) AS (ordered_quantity - delivered_quantity) STORED,
    unit_price DECIMAL(12,2),
    total_amount DECIMAL(15,2) AS (delivered_quantity * unit_price) STORED,
    customer_po VARCHAR(50),
    order_date DATE NOT NULL,
    requested_delivery_date DATE,
    order_status ENUM('PENDING', 'CONFIRMED', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    packaging_type VARCHAR(50),
    packaging_quantity INT,
    special_instructions TEXT,
    order_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    FOREIGN KEY (delivery_control_id) REFERENCES delivery_control(id) ON DELETE SET NULL,
    INDEX idx_order_number (order_number),
    INDEX idx_part_number (part_number),
    INDEX idx_customer_po (customer_po),
    INDEX idx_order_date (order_date),
    INDEX idx_order_status (order_status),
    INDEX idx_delivery_control (delivery_control_id)
);

-- ================================================================
-- WAREHOUSE RETURNS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS warehouse_returns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_number VARCHAR(50) UNIQUE NOT NULL,
    original_order_number VARCHAR(50),
    part_number VARCHAR(50) NOT NULL,
    part_name VARCHAR(100),
    lot_number VARCHAR(50),
    returned_quantity DECIMAL(10,2) NOT NULL,
    return_reason ENUM('DEFECTIVE', 'WRONG_ITEM', 'DAMAGED', 'CUSTOMER_REQUEST', 'EXPIRED', 'OTHER') NOT NULL,
    return_condition ENUM('GOOD', 'DAMAGED', 'EXPIRED', 'UNUSABLE') DEFAULT 'GOOD',
    customer_name VARCHAR(100),
    return_date DATE NOT NULL,
    received_date DATE,
    inspection_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'REWORK_REQUIRED') DEFAULT 'PENDING',
    inspector VARCHAR(50),
    inspection_notes TEXT,
    disposition ENUM('RESTOCK', 'REWORK', 'SCRAP', 'VENDOR_RETURN') DEFAULT 'RESTOCK',
    restocked_quantity DECIMAL(10,2) DEFAULT 0,
    credit_amount DECIMAL(12,2),
    return_authorization VARCHAR(50),
    customer_contact VARCHAR(100),
    return_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    INDEX idx_return_number (return_number),
    INDEX idx_original_order (original_order_number),
    INDEX idx_part_number (part_number),
    INDEX idx_return_date (return_date),
    INDEX idx_inspection_status (inspection_status),
    INDEX idx_return_reason (return_reason)
);

-- ================================================================
-- WAREHOUSE LOCATIONS TABLE (for better inventory management)
-- ================================================================
CREATE TABLE IF NOT EXISTS warehouse_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_code VARCHAR(20) UNIQUE NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    zone VARCHAR(50),
    aisle VARCHAR(10),
    rack VARCHAR(10),
    shelf VARCHAR(10),
    bin VARCHAR(10),
    location_type ENUM('RECEIVING', 'STORAGE', 'PICKING', 'STAGING', 'SHIPPING', 'QUARANTINE') DEFAULT 'STORAGE',
    capacity_weight DECIMAL(10,2),
    capacity_volume DECIMAL(10,2),
    current_weight DECIMAL(10,2) DEFAULT 0,
    current_volume DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_location_code (location_code),
    INDEX idx_zone (zone),
    INDEX idx_location_type (location_type)
);

-- ================================================================
-- Insert Sample Data for Testing
-- ================================================================

-- Sample Warehouse Locations
INSERT IGNORE INTO warehouse_locations (location_code, location_name, zone, aisle, rack, shelf, location_type) VALUES
('A01-01-01', 'Zone A Rack 1 Shelf 1', 'A', '01', '01', '01', 'STORAGE'),
('A01-01-02', 'Zone A Rack 1 Shelf 2', 'A', '01', '01', '02', 'STORAGE'),
('B01-01-01', 'Zone B Rack 1 Shelf 1', 'B', '01', '01', '01', 'PICKING'),
('RCV-001', 'Receiving Area 1', 'RCV', NULL, NULL, NULL, 'RECEIVING'),
('SHP-001', 'Shipping Area 1', 'SHP', NULL, NULL, NULL, 'SHIPPING'),
('QAR-001', 'Quarantine Area 1', 'QAR', NULL, NULL, NULL, 'QUARANTINE');

-- Sample Finished Goods
INSERT IGNORE INTO finished_goods (part_number, part_name, lot_number, quantity, location, quality_status, production_date, warehouse_section, operator, status) VALUES
('BRK-001', 'Brake Pad Set', 'LOT-2025001', 100.00, 'A01-01-01', 'PASS', '2025-01-15', 'Zone A', 'John Doe', 'AVAILABLE'),
('BRK-002', 'Brake Disc', 'LOT-2025002', 50.00, 'A01-01-02', 'PASS', '2025-01-16', 'Zone A', 'Jane Smith', 'AVAILABLE'),
('ENG-001', 'Engine Block', 'LOT-2025003', 25.00, 'B01-01-01', 'PENDING', '2025-01-17', 'Zone B', 'Mike Johnson', 'AVAILABLE');

-- Sample Delivery Control
INSERT IGNORE INTO delivery_control (delivery_id, customer_name, customer_address, delivery_date, driver_name, driver_phone, vehicle_number, delivery_status, priority) VALUES
('DEL-2025001', 'PT. Automotive Sejahtera', 'Jl. Industri No. 123, Jakarta', '2025-01-22', 'Ahmad Wijaya', '081234567890', 'B 1234 CD', 'PLANNED', 'HIGH'),
('DEL-2025002', 'CV. Spare Parts Indonesia', 'Jl. Motor No. 456, Bandung', '2025-01-23', 'Budi Santoso', '081234567891', 'D 5678 EF', 'PLANNED', 'MEDIUM');

-- Sample Delivery Orders
INSERT IGNORE INTO delivery_orders (order_number, delivery_control_id, part_number, part_name, lot_number, ordered_quantity, delivered_quantity, unit_price, customer_po, order_date, requested_delivery_date, order_status) VALUES
('ORD-2025001', 1, 'BRK-001', 'Brake Pad Set', 'LOT-2025001', 50.00, 0.00, 125000.00, 'PO-CUST-001', '2025-01-20', '2025-01-22', 'CONFIRMED'),
('ORD-2025002', 1, 'BRK-002', 'Brake Disc', 'LOT-2025002', 25.00, 0.00, 250000.00, 'PO-CUST-001', '2025-01-20', '2025-01-22', 'CONFIRMED'),
('ORD-2025003', 2, 'ENG-001', 'Engine Block', 'LOT-2025003', 10.00, 0.00, 1500000.00, 'PO-CUST-002', '2025-01-21', '2025-01-23', 'PENDING');

-- Sample Warehouse Returns
INSERT IGNORE INTO warehouse_returns (return_number, original_order_number, part_number, part_name, lot_number, returned_quantity, return_reason, return_condition, customer_name, return_date, inspection_status, return_notes) VALUES
('RET-2025001', 'ORD-2024050', 'BRK-001', 'Brake Pad Set', 'LOT-2024050', 5.00, 'DEFECTIVE', 'DAMAGED', 'PT. Automotive Sejahtera', '2025-01-18', 'PENDING', 'Customer reported quality issues'),
('RET-2025002', 'ORD-2024051', 'BRK-002', 'Brake Disc', 'LOT-2024051', 2.00, 'WRONG_ITEM', 'GOOD', 'CV. Spare Parts Indonesia', '2025-01-19', 'APPROVED', 'Wrong specification delivered');

-- ================================================================
-- Views for Dashboard Analytics
-- ================================================================

-- Warehouse Summary View
CREATE OR REPLACE VIEW warehouse_summary AS
SELECT 
    'finished_goods' as item_type,
    COUNT(*) as total_items,
    SUM(quantity) as total_quantity,
    COUNT(DISTINCT part_number) as unique_parts,
    SUM(CASE WHEN status = 'AVAILABLE' THEN quantity ELSE 0 END) as available_quantity,
    SUM(CASE WHEN quality_status = 'PASS' THEN quantity ELSE 0 END) as quality_passed
FROM finished_goods
WHERE status != 'SHIPPED'
UNION ALL
SELECT 
    'pending_deliveries' as item_type,
    COUNT(*) as total_items,
    SUM(ordered_quantity) as total_quantity,
    COUNT(DISTINCT part_number) as unique_parts,
    SUM(ordered_quantity - delivered_quantity) as available_quantity,
    0 as quality_passed
FROM delivery_orders
WHERE order_status NOT IN ('DELIVERED', 'CANCELLED')
UNION ALL
SELECT 
    'pending_returns' as item_type,
    COUNT(*) as total_items,
    SUM(returned_quantity) as total_quantity,
    COUNT(DISTINCT part_number) as unique_parts,
    SUM(CASE WHEN inspection_status = 'APPROVED' THEN returned_quantity ELSE 0 END) as available_quantity,
    0 as quality_passed
FROM warehouse_returns
WHERE inspection_status = 'PENDING';

-- ================================================================
-- Triggers for Audit Trail
-- ================================================================

DELIMITER //

-- Trigger for Finished Goods audit
CREATE TRIGGER IF NOT EXISTS tr_finished_goods_audit
    BEFORE UPDATE ON finished_goods
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger for Delivery Control audit
CREATE TRIGGER IF NOT EXISTS tr_delivery_control_audit
    BEFORE UPDATE ON delivery_control
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger for Delivery Orders audit
CREATE TRIGGER IF NOT EXISTS tr_delivery_orders_audit
    BEFORE UPDATE ON delivery_orders
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger for Warehouse Returns audit
CREATE TRIGGER IF NOT EXISTS tr_warehouse_returns_audit
    BEFORE UPDATE ON warehouse_returns
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

DELIMITER ;

-- ================================================================
-- Indexes for Performance Optimization
-- ================================================================

-- Additional composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_fg_part_status ON finished_goods(part_number, status);
CREATE INDEX IF NOT EXISTS idx_fg_location_quality ON finished_goods(location, quality_status);
CREATE INDEX IF NOT EXISTS idx_do_status_date ON delivery_orders(order_status, order_date);
CREATE INDEX IF NOT EXISTS idx_dc_status_date ON delivery_control(delivery_status, delivery_date);
CREATE INDEX IF NOT EXISTS idx_wr_status_date ON warehouse_returns(inspection_status, return_date);

-- ================================================================
-- COMPLETED: Warehouse Extension Database Schema
-- Purpose: Complete warehouse management with CRUD operations
-- Features: Finished goods tracking, delivery control, order management, returns processing
-- ================================================================
