-- Database Tables for Android API
-- PT. Topline Evergreen Manufacturing - Android App Support
-- MySQL 8.0 Compatible

SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- 1. USER ANDROID TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS `userandroid` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `department` enum('PRODUCTION','QC','WAREHOUSE','ADMIN') DEFAULT 'PRODUCTION',
  `role` enum('OPERATOR','SUPERVISOR','MANAGER','ADMIN') DEFAULT 'OPERATOR',
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`),
  KEY `idx_department` (`department`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default users for Android app
INSERT INTO `userandroid` (`username`, `password`, `full_name`, `department`, `role`, `phone`) VALUES
('prod001', 'prod123', 'Operator Produksi 1', 'PRODUCTION', 'OPERATOR', '081234567001'),
('prod002', 'prod123', 'Operator Produksi 2', 'PRODUCTION', 'OPERATOR', '081234567002'),
('qc001', 'qc123', 'Inspector QC 1', 'QC', 'OPERATOR', '081234567003'),
('qc002', 'qc123', 'Inspector QC 2', 'QC', 'OPERATOR', '081234567004'),
('spv001', 'spv123', 'Supervisor Produksi', 'PRODUCTION', 'SUPERVISOR', '081234567005'),
('admin', 'admin123', 'Administrator Android', 'ADMIN', 'ADMIN', '081234567999');

-- ==========================================
-- 2. OUTPUT MC TABLE (Enhanced)
-- ==========================================

CREATE TABLE IF NOT EXISTS `outputmc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `machine` varchar(50) NOT NULL,
  `customer` varchar(255) DEFAULT NULL,
  `partnumber` varchar(255) NOT NULL,
  `model` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `quantity_ng` int(11) DEFAULT 0,
  `operator` varchar(100) NOT NULL,
  `shift` enum('1','2','3') DEFAULT '1',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_machine` (`machine`),
  KEY `idx_partnumber` (`partnumber`),
  KEY `idx_operator` (`operator`),
  KEY `idx_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. MC STATUS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS `mcstatus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `machine` varchar(50) NOT NULL,
  `status` enum('running','stop','maintenance','trial') NOT NULL,
  `operator` varchar(100) NOT NULL,
  `shift` enum('1','2','3') DEFAULT '1',
  `reason` text DEFAULT NULL,
  `estimated_duration` int(11) DEFAULT NULL COMMENT 'Duration in minutes',
  `notes` text DEFAULT NULL,
  `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_machine` (`machine`),
  KEY `idx_status` (`status`),
  KEY `idx_operator` (`operator`),
  KEY `idx_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. TRANSFER QC TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS `transfer_qc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer` varchar(255) DEFAULT NULL,
  `partnumber` varchar(255) NOT NULL,
  `model` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `lotnumber` varchar(100) NOT NULL,
  `pic_produksi` varchar(100) NOT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `status` enum('pending','ok','ng','partial_ok') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_partnumber` (`partnumber`),
  KEY `idx_lotnumber` (`lotnumber`),
  KEY `idx_status` (`status`),
  KEY `idx_qr_code` (`qr_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. WIP SECOND PROCESS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS `wip_second_process` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `partnumber` varchar(255) NOT NULL,
  `lotnumber` varchar(100) NOT NULL,
  `process_step` varchar(100) NOT NULL,
  `status` enum('in_progress','completed','on_hold') NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `operator` varchar(100) NOT NULL,
  `machine` varchar(50) DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_partnumber` (`partnumber`),
  KEY `idx_lotnumber` (`lotnumber`),
  KEY `idx_status` (`status`),
  KEY `idx_operator` (`operator`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. INCOMING QC TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS `incoming_qc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier` varchar(255) NOT NULL,
  `material_code` varchar(100) NOT NULL,
  `material_name` varchar(255) DEFAULT NULL,
  `batch_number` varchar(100) DEFAULT NULL,
  `quantity_received` int(11) NOT NULL,
  `unit` varchar(20) DEFAULT 'PCS',
  `inspection_result` enum('OK','NG','HOLD') NOT NULL,
  `inspector` varchar(100) NOT NULL,
  `supplier_certificate` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `inspection_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supplier` (`supplier`),
  KEY `idx_material_code` (`material_code`),
  KEY `idx_inspection_result` (`inspection_result`),
  KEY `idx_inspector` (`inspector`),
  KEY `idx_date` (`inspection_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 7. NG QC TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS `ng_qc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transfer_qc_id` int(11) DEFAULT NULL,
  `partnumber` varchar(255) NOT NULL,
  `lotnumber` varchar(100) DEFAULT NULL,
  `quantity_ng` int(11) NOT NULL,
  `defect_type` varchar(100) NOT NULL,
  `defect_description` text DEFAULT NULL,
  `inspector` varchar(100) NOT NULL,
  `action_required` enum('crush','rework','scrap','return_supplier') DEFAULT 'crush',
  `status` enum('pending_action','in_process','completed') DEFAULT 'pending_action',
  `processed_by` varchar(100) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transfer_qc_id` (`transfer_qc_id`),
  KEY `idx_partnumber` (`partnumber`),
  KEY `idx_lotnumber` (`lotnumber`),
  KEY `idx_status` (`status`),
  KEY `idx_action_required` (`action_required`),
  FOREIGN KEY (`transfer_qc_id`) REFERENCES `transfer_qc` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 8. OUTGOING QC TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS `outgoing_qc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transfer_qc_id` int(11) DEFAULT NULL,
  `partnumber` varchar(255) NOT NULL,
  `lotnumber` varchar(100) NOT NULL,
  `quantity_inspected` int(11) NOT NULL,
  `quantity_ok` int(11) DEFAULT 0,
  `quantity_ng` int(11) DEFAULT 0,
  `inspector` varchar(100) NOT NULL,
  `inspection_notes` text DEFAULT NULL,
  `sampling_plan` varchar(100) DEFAULT NULL,
  `test_results` text DEFAULT NULL,
  `status` enum('pending','in_progress','completed') DEFAULT 'pending',
  `inspection_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transfer_qc_id` (`transfer_qc_id`),
  KEY `idx_partnumber` (`partnumber`),
  KEY `idx_lotnumber` (`lotnumber`),
  KEY `idx_inspector` (`inspector`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`transfer_qc_id`) REFERENCES `transfer_qc` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 9. RETURN QC TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS `return_qc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `return_source` enum('warehouse','customer','internal') NOT NULL,
  `partnumber` varchar(255) NOT NULL,
  `lotnumber` varchar(100) DEFAULT NULL,
  `quantity_returned` int(11) NOT NULL,
  `return_reason` text NOT NULL,
  `inspector` varchar(100) NOT NULL,
  `analysis_result` enum('OK','NG','REWORK') DEFAULT NULL,
  `corrective_action` text DEFAULT NULL,
  `status` enum('under_analysis','completed','escalated') DEFAULT 'under_analysis',
  `notes` text DEFAULT NULL,
  `return_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `analysis_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_return_source` (`return_source`),
  KEY `idx_partnumber` (`partnumber`),
  KEY `idx_lotnumber` (`lotnumber`),
  KEY `idx_inspector` (`inspector`),
  KEY `idx_status` (`status`),
  KEY `idx_return_date` (`return_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 10. WIP TABLE (Enhanced)
-- ==========================================

CREATE TABLE IF NOT EXISTS `wip` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `partnumber` varchar(255) NOT NULL,
  `lotnumber` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `operator` varchar(100) DEFAULT NULL,
  `pic_qc` varchar(100) DEFAULT NULL,
  `pic_production` varchar(100) DEFAULT NULL,
  `status` enum('active','transferred','completed') DEFAULT 'active',
  `location` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_partnumber` (`partnumber`),
  KEY `idx_lotnumber` (`lotnumber`),
  KEY `idx_status` (`status`),
  KEY `idx_operator` (`operator`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 11. FINISH GOODS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS `finish_goods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `partnumber` varchar(255) NOT NULL,
  `lotnumber` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `source_type` enum('outgoing_qc','direct_production','transfer') DEFAULT 'outgoing_qc',
  `source_id` int(11) DEFAULT NULL COMMENT 'Reference ID from source table',
  `qc_status` enum('approved','pending','rejected') DEFAULT 'pending',
  `location` varchar(100) DEFAULT 'FG_WAREHOUSE',
  `created_by` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_partnumber` (`partnumber`),
  KEY `idx_lotnumber` (`lotnumber`),
  KEY `idx_qc_status` (`qc_status`),
  KEY `idx_location` (`location`),
  KEY `idx_source` (`source_type`, `source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- SAMPLE DATA INSERT
-- ==========================================

-- Sample BOM data for testing dropdown
INSERT IGNORE INTO `billofmaterial` (`customer`, `partnumber`, `model`, `description`) VALUES
('PT ARKHA INDUSTRIES INDONESIA', 'AB2MRR-001', 'K2FA', 'COVER MIRROR BACK R/L K93A'),
('PT ARKHA INDUSTRIES INDONESIA', 'AB2MRR-002', 'KTMN', 'COVER MIRROR BACK LH KTMN NH1'),
('PT ASTRA KOMPONEN INDONESIA', 'QB2MRR-001', 'K1AL', 'HOLDER MIRROR BACK RH K1AA'),
('PT AUTO PLASTIK INDONESIA', 'JI4ACO-001', 'BZ010-H', 'PLUG TRANSMISSION OIL FILLER'),
('PT HASURA MITRA GEMILANG', 'TWIN-001', 'PULSATOR', 'TWIN TUB PULSATOR COVER');

-- Sample WIP data
INSERT INTO `wip` (`partnumber`, `lotnumber`, `quantity`, `operator`, `pic_production`) VALUES
('AB2MRR-001', 'LOT-20250810-001', 100, 'prod001', 'spv001'),
('AB2MRR-002', 'LOT-20250810-002', 150, 'prod002', 'spv001'),
('QB2MRR-001', 'LOT-20250810-003', 75, 'prod001', 'spv001');

-- Sample Finish Goods data
INSERT INTO `finish_goods` (`partnumber`, `lotnumber`, `quantity`, `qc_status`, `created_by`) VALUES
('AB2MRR-001', 'LOT-20250809-001', 200, 'approved', 'qc001'),
('AB2MRR-002', 'LOT-20250809-002', 180, 'approved', 'qc002'),
('QB2MRR-001', 'LOT-20250809-003', 95, 'pending', 'qc001');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;
