-- MySQL 8.0 Compatible Export
-- Database: topline_manufacturing  
-- Table Group: Stock Management
-- Compatible with Google Cloud SQL MySQL 8.0

-- Set SQL mode for MySQL 8.0 compatibility
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Disable foreign key checks during import
SET FOREIGN_KEY_CHECKS = 0;

--
-- Table structure for table `component_stock`
--

CREATE TABLE IF NOT EXISTS `component_stock` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `component_id` int(11) NOT NULL,
  `current_stock` int(11) DEFAULT 0,
  `reserved_stock` int(11) DEFAULT 0,
  `available_stock` int(11) GENERATED ALWAYS AS (`current_stock` - `reserved_stock`) STORED,
  `location` varchar(100) DEFAULT 'WAREHOUSE',
  `last_transaction_date` timestamp NULL DEFAULT NULL,
  `last_updated_by` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_component_id` (`component_id`),
  KEY `idx_location` (`location`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `component_stock_ibfk_1` FOREIGN KEY (`component_id`) REFERENCES `master_component` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `component_stock`
--

INSERT IGNORE INTO `component_stock` (`component_id`, `current_stock`, `reserved_stock`, `location`, `last_transaction_date`, `last_updated_by`, `is_active`, `created_at`, `updated_at`) VALUES
(1,1172,38,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(2,507,39,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(3,775,37,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(4,2234,54,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(5,576,38,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(6,1325,70,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(7,558,21,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(8,2233,40,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(9,757,45,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(10,1424,43,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(11,1986,93,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(12,1767,44,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(13,2473,46,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(14,2315,4,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29'),
(15,1151,89,'WAREHOUSE-B',NULL,'SYSTEM',1,'2025-08-05 13:12:29','2025-08-05 13:12:29');

--
-- Table structure for table `material_stock`
--

CREATE TABLE IF NOT EXISTS `material_stock` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `material_id` int(11) NOT NULL,
  `current_stock` int(11) DEFAULT 0,
  `reserved_stock` int(11) DEFAULT 0,
  `available_stock` int(11) GENERATED ALWAYS AS (`current_stock` - `reserved_stock`) STORED,
  `location` varchar(100) DEFAULT 'WAREHOUSE',
  `last_transaction_date` timestamp NULL DEFAULT NULL,
  `last_updated_by` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_material_id` (`material_id`),
  KEY `idx_location` (`location`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `material_stock_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `master_material` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `material_stock`
--

INSERT IGNORE INTO `material_stock` (`material_id`, `current_stock`, `reserved_stock`, `location`, `last_transaction_date`, `last_updated_by`, `is_active`, `created_at`, `updated_at`) VALUES
(1,4923,112,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(2,3028,10,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(3,1066,121,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(4,1319,156,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(5,1062,141,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(6,1483,111,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(7,4482,117,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(8,3954,126,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(9,3624,113,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(10,5001,77,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(11,3058,57,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(12,4524,161,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(13,3830,116,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(14,5664,66,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(15,5038,117,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(16,5809,114,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(17,1981,161,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(18,1363,74,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(19,4649,0,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03'),
(20,1606,89,'WAREHOUSE-A',NULL,'SYSTEM',1,'2025-08-05 13:12:03','2025-08-05 13:12:03');

--
-- Table structure for table `stock_transactions`
--

CREATE TABLE IF NOT EXISTS `stock_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_number` varchar(50) NOT NULL,
  `transaction_type` enum('WIP_IN','WIP_OUT','WIP_TO_FG','FG_IN','FG_OUT','FG_SHIPPED','ADJUSTMENT','TRANSFER') NOT NULL,
  `stock_type` enum('WIP','FG') NOT NULL,
  `partnumber` varchar(50) NOT NULL,
  `customer` varchar(100) NOT NULL,
  `lotnumber` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `quantity_before` int(11) DEFAULT 0,
  `quantity_after` int(11) DEFAULT 0,
  `location_from` varchar(50) DEFAULT NULL,
  `location_to` varchar(50) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `machine_id` varchar(50) DEFAULT NULL,
  `operator` varchar(100) DEFAULT NULL,
  `shift` enum('SHIFT_1','SHIFT_2','SHIFT_3') DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `transaction_time` time DEFAULT (CURTIME()),
  `notes` text DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `approved_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_number` (`transaction_number`),
  KEY `idx_transaction_number` (`transaction_number`),
  KEY `idx_transaction_type` (`transaction_type`),
  KEY `idx_stock_type` (`stock_type`),
  KEY `idx_partnumber` (`partnumber`),
  KEY `idx_customer` (`customer`),
  KEY `idx_transaction_date` (`transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_transactions`
--

-- (Empty table - no data to insert)

--
-- Table structure for table `fg`
--

CREATE TABLE IF NOT EXISTS `fg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `partnumber` varchar(50) NOT NULL,
  `customer` varchar(100) NOT NULL,
  `model` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `lotnumber` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `unit` varchar(20) DEFAULT 'PCS',
  `location` varchar(50) DEFAULT 'FG_WAREHOUSE',
  `storage_area` varchar(50) DEFAULT NULL,
  `pallet_number` varchar(50) DEFAULT NULL,
  `production_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `qc_status` enum('PASS','FAIL','PENDING') DEFAULT 'PASS',
  `shipping_status` enum('AVAILABLE','RESERVED','SHIPPED') DEFAULT 'AVAILABLE',
  `customer_po` varchar(100) DEFAULT NULL,
  `delivery_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_partnumber` (`partnumber`),
  KEY `idx_customer` (`customer`),
  KEY `idx_location` (`location`),
  KEY `idx_shipping_status` (`shipping_status`),
  KEY `idx_delivery_date` (`delivery_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fg`
--

INSERT IGNORE INTO `fg` (`partnumber`, `customer`, `model`, `description`, `lotnumber`, `quantity`, `unit`, `location`, `storage_area`, `pallet_number`, `production_date`, `expiry_date`, `qc_status`, `shipping_status`, `customer_po`, `delivery_date`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
('PN003','HONDA','MODEL-C','Finished Dashboard','FG001',80,'PCS','FG_WAREHOUSE','AREA-A',NULL,'2025-08-05',NULL,'PASS','AVAILABLE',NULL,NULL,NULL,'SYSTEM',NULL,'2025-08-05 14:04:56','2025-08-05 14:04:56'),
('PN004','TOYOTA','MODEL-D','Engine Assembly','FG002',30,'PCS','FG_WAREHOUSE','AREA-B',NULL,'2025-08-05',NULL,'PASS','RESERVED',NULL,'2025-08-12',NULL,'SYSTEM',NULL,'2025-08-05 14:04:56','2025-08-05 14:04:56');

--
-- Table structure for table `wip`
--

CREATE TABLE IF NOT EXISTS `wip` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `partnumber` varchar(50) NOT NULL,
  `customer` varchar(100) NOT NULL,
  `model` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `lotnumber` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `unit` varchar(20) DEFAULT 'PCS',
  `location` varchar(50) DEFAULT 'WIP_WAREHOUSE',
  `machine_id` varchar(50) DEFAULT NULL,
  `operator` varchar(100) DEFAULT NULL,
  `shift` enum('SHIFT_1','SHIFT_2','SHIFT_3') DEFAULT 'SHIFT_1',
  `production_date` date DEFAULT NULL,
  `status` enum('IN_PROCESS','HOLD','QC_PENDING','READY_TO_TRANSFER') DEFAULT 'IN_PROCESS',
  `qc_status` enum('PENDING','PASS','FAIL','REWORK') DEFAULT 'PENDING',
  `notes` text DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_partnumber` (`partnumber`),
  KEY `idx_customer` (`customer`),
  KEY `idx_location` (`location`),
  KEY `idx_status` (`status`),
  KEY `idx_production_date` (`production_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wip`
--

INSERT IGNORE INTO `wip` (`partnumber`, `customer`, `model`, `description`, `lotnumber`, `quantity`, `unit`, `location`, `machine_id`, `operator`, `shift`, `production_date`, `status`, `qc_status`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
('PN001','HONDA','MODEL-A','Dashboard Component','WIP001',100,'PCS','WIP_WAREHOUSE','MC001','operator1','SHIFT_1','2025-08-05','IN_PROCESS','PENDING',NULL,'SYSTEM',NULL,'2025-08-05 14:04:44','2025-08-05 14:04:44'),
('PN002','TOYOTA','MODEL-B','Engine Part','WIP002',50,'PCS','WIP_WAREHOUSE','MC002','operator1','SHIFT_1','2025-08-05','READY_TO_TRANSFER','PASS',NULL,'SYSTEM',NULL,'2025-08-05 14:04:44','2025-08-05 14:04:44');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;
