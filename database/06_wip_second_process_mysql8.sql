-- Create WIP Second Process Table
-- PT. Topline Evergreen Manufacturing - Android App Support
-- MySQL 8.0 Compatible

SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- WIP SECOND PROCESS TABLE (NEW)
-- ==========================================

CREATE TABLE IF NOT EXISTS `wip_second_process` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `partnumber` varchar(255) NOT NULL,
  `model` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `progress` varchar(100) DEFAULT NULL COMMENT 'Current process step',
  `quantity_ok` int(11) DEFAULT 0,
  `quantity_ng` int(11) DEFAULT 0,
  `status` enum('in_progress','completed','on_hold','pending') DEFAULT 'in_progress',
  `operator` varchar(100) NOT NULL,
  `lotnumber` varchar(100) DEFAULT NULL,
  `machine` varchar(50) DEFAULT NULL,
  `shift` enum('1','2','3') DEFAULT '1',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_partnumber` (`partnumber`),
  KEY `idx_model` (`model`),
  KEY `idx_status` (`status`),
  KEY `idx_operator` (`operator`),
  KEY `idx_lotnumber` (`lotnumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for testing
INSERT INTO `wip_second_process` (`partnumber`, `model`, `description`, `progress`, `quantity_ok`, `quantity_ng`, `status`, `operator`, `lotnumber`, `machine`) VALUES
('AB2MRR-001', 'K2FA', 'COVER MIRROR BACK R/L K93A', 'Assembly', 95, 5, 'in_progress', 'prod001', 'LOT-20250810-001', 'A02'),
('AB2MRR-002', 'KTMN', 'COVER MIRROR BACK LH KTMN NH1', 'Finishing', 145, 5, 'completed', 'prod002', 'LOT-20250810-002', 'A03'),
('QB2MRR-001', 'K1AL', 'HOLDER MIRROR BACK RH K1AA', 'Quality Check', 70, 5, 'on_hold', 'prod001', 'LOT-20250810-003', 'A01');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;
