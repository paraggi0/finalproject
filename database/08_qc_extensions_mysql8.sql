-- QC Extension Tables for Enhanced CRUD Operations
-- Created: 2025-01-20
-- Purpose: Support complete quality control management with IQC, OQC, RQC, and NG tracking

USE production_db;

-- ================================================================
-- OQC RECORDS TABLE (Outgoing Quality Control)
-- ================================================================
CREATE TABLE IF NOT EXISTS oqc_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_number VARCHAR(50) NOT NULL,
    lot_number VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    customer VARCHAR(100),
    inspector VARCHAR(50) NOT NULL,
    status ENUM('PASS', 'FAIL', 'PENDING') DEFAULT 'PENDING',
    inspection_date DATE,
    packaging_status ENUM('GOOD', 'DAMAGED', 'INCOMPLETE') DEFAULT 'GOOD',
    visual_check BOOLEAN DEFAULT FALSE,
    dimensional_check BOOLEAN DEFAULT FALSE,
    functional_check BOOLEAN DEFAULT FALSE,
    packaging_check BOOLEAN DEFAULT FALSE,
    label_check BOOLEAN DEFAULT FALSE,
    defect_count INT DEFAULT 0,
    sampling_size INT,
    acceptance_criteria VARCHAR(100),
    rejection_reason TEXT,
    corrective_action TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    INDEX idx_part_number (part_number),
    INDEX idx_lot_number (lot_number),
    INDEX idx_status (status),
    INDEX idx_inspector (inspector),
    INDEX idx_inspection_date (inspection_date),
    INDEX idx_customer (customer)
);

-- ================================================================
-- RQC RECORDS TABLE (Rework Quality Control)
-- ================================================================
CREATE TABLE IF NOT EXISTS rqc_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_number VARCHAR(50) NOT NULL,
    lot_number VARCHAR(50) NOT NULL,
    original_quantity DECIMAL(10,2) NOT NULL,
    rework_quantity DECIMAL(10,2) DEFAULT 0,
    completed_quantity DECIMAL(10,2) DEFAULT 0,
    scrapped_quantity DECIMAL(10,2) DEFAULT 0,
    rework_type ENUM('DIMENSIONAL', 'VISUAL', 'FUNCTIONAL', 'CLEANING', 'REFINISHING', 'OTHER') NOT NULL,
    rework_reason TEXT,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED') DEFAULT 'PENDING',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    inspector VARCHAR(50),
    rework_operator VARCHAR(50),
    rework_station VARCHAR(50),
    rework_date DATE,
    completion_date DATE,
    estimated_time_hours DECIMAL(5,2),
    actual_time_hours DECIMAL(5,2),
    rework_cost DECIMAL(10,2),
    before_images TEXT,
    after_images TEXT,
    rework_instructions TEXT,
    quality_verification TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    INDEX idx_part_number (part_number),
    INDEX idx_lot_number (lot_number),
    INDEX idx_status (status),
    INDEX idx_rework_type (rework_type),
    INDEX idx_priority (priority),
    INDEX idx_rework_date (rework_date)
);

-- ================================================================
-- NG RECORDS TABLE (Not Good/Defective Parts Tracking)
-- ================================================================
CREATE TABLE IF NOT EXISTS ng_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_number VARCHAR(50) NOT NULL,
    lot_number VARCHAR(50),
    quantity_ng DECIMAL(10,2) NOT NULL,
    total_quantity DECIMAL(10,2),
    ng_percentage DECIMAL(5,2) AS ((quantity_ng / total_quantity) * 100) STORED,
    defect_type ENUM('DIMENSIONAL', 'VISUAL', 'FUNCTIONAL', 'MATERIAL', 'CONTAMINATION', 'DAMAGE', 'OTHER') NOT NULL,
    defect_category ENUM('CRITICAL', 'MAJOR', 'MINOR') DEFAULT 'MAJOR',
    defect_description TEXT,
    root_cause TEXT,
    detection_point ENUM('INCOMING', 'IN_PROCESS', 'FINAL', 'CUSTOMER') DEFAULT 'IN_PROCESS',
    detection_method ENUM('VISUAL', 'MEASUREMENT', 'TEST', 'CUSTOMER_COMPLAINT') DEFAULT 'VISUAL',
    disposition ENUM('SCRAP', 'REWORK', 'USE_AS_IS', 'RETURN_TO_SUPPLIER') NOT NULL,
    cost_impact DECIMAL(12,2),
    supplier VARCHAR(100),
    customer VARCHAR(100),
    machine_station VARCHAR(50),
    operator VARCHAR(50),
    inspector VARCHAR(50),
    detection_date DATE,
    resolution_date DATE,
    containment_action TEXT,
    corrective_action TEXT,
    preventive_action TEXT,
    verification_method TEXT,
    images TEXT,
    documents TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    INDEX idx_part_number (part_number),
    INDEX idx_defect_type (defect_type),
    INDEX idx_defect_category (defect_category),
    INDEX idx_disposition (disposition),
    INDEX idx_detection_point (detection_point),
    INDEX idx_detection_date (detection_date),
    INDEX idx_supplier (supplier)
);

-- ================================================================
-- QC INSPECTION CHECKLIST TABLE (for standardized inspections)
-- ================================================================
CREATE TABLE IF NOT EXISTS qc_inspection_checklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_number VARCHAR(50) NOT NULL,
    inspection_type ENUM('IQC', 'OQC', 'RQC', 'PROCESS') NOT NULL,
    checklist_name VARCHAR(100) NOT NULL,
    checklist_version VARCHAR(20) DEFAULT '1.0',
    check_item VARCHAR(200) NOT NULL,
    check_method ENUM('VISUAL', 'MEASUREMENT', 'TEST', 'DOCUMENT') NOT NULL,
    specification TEXT,
    tolerance VARCHAR(50),
    measuring_equipment VARCHAR(100),
    acceptance_criteria TEXT,
    sample_size INT DEFAULT 1,
    is_critical BOOLEAN DEFAULT FALSE,
    sequence_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    
    INDEX idx_part_number (part_number),
    INDEX idx_inspection_type (inspection_type),
    INDEX idx_checklist_name (checklist_name),
    INDEX idx_sequence (sequence_order)
);

-- ================================================================
-- QC INSPECTION RESULTS TABLE (detailed results for each check)
-- ================================================================
CREATE TABLE IF NOT EXISTS qc_inspection_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_record_id INT,
    inspection_type ENUM('IQC', 'OQC', 'RQC') NOT NULL,
    checklist_item_id INT,
    check_item VARCHAR(200) NOT NULL,
    measured_value VARCHAR(100),
    specification VARCHAR(100),
    result_status ENUM('PASS', 'FAIL', 'NA') DEFAULT 'PASS',
    deviation_value DECIMAL(10,4),
    notes TEXT,
    inspector VARCHAR(50),
    inspection_datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_inspection_record (inspection_record_id),
    INDEX idx_inspection_type (inspection_type),
    INDEX idx_result_status (result_status),
    FOREIGN KEY (checklist_item_id) REFERENCES qc_inspection_checklist(id) ON DELETE SET NULL
);

-- ================================================================
-- Insert Sample Data for Testing
-- ================================================================

-- Sample OQC Records
INSERT IGNORE INTO oqc_records (part_number, lot_number, quantity, customer, inspector, status, inspection_date, packaging_status, notes) VALUES
('BRK-001', 'LOT-2025001', 100.00, 'PT. Automotive Sejahtera', 'QC001', 'PASS', '2025-01-20', 'GOOD', 'All checks passed'),
('BRK-002', 'LOT-2025002', 50.00, 'CV. Spare Parts Indonesia', 'QC002', 'PENDING', '2025-01-20', 'GOOD', 'Under inspection'),
('ENG-001', 'LOT-2025003', 25.00, 'PT. Engine Works', 'QC001', 'FAIL', '2025-01-19', 'DAMAGED', 'Packaging issues found');

-- Sample RQC Records
INSERT IGNORE INTO rqc_records (part_number, lot_number, original_quantity, rework_quantity, rework_type, status, inspector, rework_date, notes) VALUES
('BRK-001', 'LOT-2024050', 20.00, 15.00, 'VISUAL', 'IN_PROGRESS', 'QC001', '2025-01-20', 'Surface scratches need polishing'),
('ENG-001', 'LOT-2024051', 5.00, 5.00, 'DIMENSIONAL', 'PENDING', 'QC002', '2025-01-21', 'Bore diameter out of tolerance');

-- Sample NG Records
INSERT IGNORE INTO ng_records (part_number, lot_number, quantity_ng, total_quantity, defect_type, defect_category, defect_description, disposition, detection_point, inspector, detection_date, notes) VALUES
('BRK-001', 'LOT-2025001', 5.00, 100.00, 'VISUAL', 'MINOR', 'Surface scratches on coating', 'REWORK', 'FINAL', 'QC001', '2025-01-20', 'Rework approved'),
('BRK-002', 'LOT-2025002', 2.00, 50.00, 'DIMENSIONAL', 'MAJOR', 'Thickness out of specification', 'SCRAP', 'IN_PROCESS', 'QC002', '2025-01-19', 'Material issue'),
('ENG-001', 'LOT-2025003', 1.00, 25.00, 'FUNCTIONAL', 'CRITICAL', 'Pressure test failure', 'SCRAP', 'FINAL', 'QC001', '2025-01-18', 'Safety critical defect');

-- Sample QC Inspection Checklist
INSERT IGNORE INTO qc_inspection_checklist (part_number, inspection_type, checklist_name, check_item, check_method, specification, tolerance, is_critical, sequence_order) VALUES
('BRK-001', 'IQC', 'Brake Pad IQC', 'Visual Inspection', 'VISUAL', 'No scratches, cracks, or contamination', 'Zero defects', TRUE, 1),
('BRK-001', 'IQC', 'Brake Pad IQC', 'Thickness Measurement', 'MEASUREMENT', '10.5mm ± 0.1mm', '±0.1mm', TRUE, 2),
('BRK-001', 'IQC', 'Brake Pad IQC', 'Hardness Test', 'TEST', 'Shore A 65-75', '65-75', FALSE, 3),
('BRK-001', 'OQC', 'Brake Pad OQC', 'Packaging Check', 'VISUAL', 'Clean packaging, proper labeling', 'Zero defects', FALSE, 1),
('BRK-001', 'OQC', 'Brake Pad OQC', 'Final Dimension', 'MEASUREMENT', 'As per drawing', 'Per specification', TRUE, 2);

-- ================================================================
-- Views for QC Analytics
-- ================================================================

-- QC Summary View
CREATE OR REPLACE VIEW qc_summary AS
SELECT 
    'incoming' as qc_type,
    COUNT(*) as total_inspections,
    SUM(quantity) as total_quantity,
    COUNT(CASE WHEN status = 'PASS' THEN 1 END) as passed,
    COUNT(CASE WHEN status = 'FAIL' THEN 1 END) as failed,
    ROUND((COUNT(CASE WHEN status = 'PASS' THEN 1 END) / COUNT(*)) * 100, 2) as pass_rate
FROM iqc_records
WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
UNION ALL
SELECT 
    'outgoing' as qc_type,
    COUNT(*) as total_inspections,
    SUM(quantity) as total_quantity,
    COUNT(CASE WHEN status = 'PASS' THEN 1 END) as passed,
    COUNT(CASE WHEN status = 'FAIL' THEN 1 END) as failed,
    ROUND((COUNT(CASE WHEN status = 'PASS' THEN 1 END) / COUNT(*)) * 100, 2) as pass_rate
FROM oqc_records
WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- NG Analysis View
CREATE OR REPLACE VIEW ng_analysis AS
SELECT 
    defect_type,
    defect_category,
    COUNT(*) as occurrence_count,
    SUM(quantity_ng) as total_ng_quantity,
    AVG(ng_percentage) as avg_ng_percentage,
    disposition,
    COUNT(DISTINCT part_number) as affected_parts
FROM ng_records
WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY defect_type, defect_category, disposition
ORDER BY total_ng_quantity DESC;

-- ================================================================
-- Triggers for QC Audit Trail
-- ================================================================

DELIMITER //

-- Trigger for OQC Records audit
CREATE TRIGGER IF NOT EXISTS tr_oqc_records_audit
    BEFORE UPDATE ON oqc_records
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger for RQC Records audit
CREATE TRIGGER IF NOT EXISTS tr_rqc_records_audit
    BEFORE UPDATE ON rqc_records
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger for NG Records audit
CREATE TRIGGER IF NOT EXISTS tr_ng_records_audit
    BEFORE UPDATE ON ng_records
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

DELIMITER ;

-- ================================================================
-- COMPLETED: QC Extension Database Schema
-- Purpose: Complete quality control management with CRUD operations
-- Features: IQC, OQC, RQC, NG tracking with detailed inspection workflows
-- ================================================================
