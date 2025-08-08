-- MySQL 8.0 Compatible Export
-- Database: topline_manufacturing  
-- Table Group: Production
-- Compatible with Google Cloud SQL MySQL 8.0

-- Set SQL mode for MySQL 8.0 compatibility
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Disable foreign key checks during import
SET FOREIGN_KEY_CHECKS = 0;

--
-- Table structure for table `production_orders`
--

CREATE TABLE IF NOT EXISTS `production_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `product_code` varchar(50) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity_ordered` int(11) NOT NULL,
  `quantity_produced` int(11) DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `target_date` date DEFAULT NULL,
  `actual_date` date DEFAULT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') DEFAULT 'MEDIUM',
  `notes` text DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_target_date` (`target_date`),
  CONSTRAINT `production_orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `master_customer` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `production_orders`
--

-- (Empty table - no data to insert)

--
-- Table structure for table `production_transactions`
--

CREATE TABLE IF NOT EXISTS `production_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_number` varchar(50) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `machine_id` int(11) DEFAULT NULL,
  `product_code` varchar(50) NOT NULL,
  `quantity_produced` int(11) NOT NULL,
  `shift` enum('SHIFT_1','SHIFT_2','SHIFT_3') DEFAULT 'SHIFT_1',
  `operator` varchar(100) DEFAULT NULL,
  `quality_status` enum('OK','NG','REWORK') DEFAULT 'OK',
  `production_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_number` (`transaction_number`),
  KEY `order_id` (`order_id`),
  KEY `idx_transaction_number` (`transaction_number`),
  KEY `idx_production_date` (`production_date`),
  KEY `idx_product_code` (`product_code`),
  KEY `idx_quality_status` (`quality_status`),
  CONSTRAINT `production_transactions_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `production_orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `production_transactions`
--

-- (Empty table - no data to insert)

--
-- Table structure for table `machine_status`
--

CREATE TABLE IF NOT EXISTS `machine_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `machine_id` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'inactive',
  `target` int(11) DEFAULT 0,
  `actual` int(11) DEFAULT 0,
  `output_today` int(11) DEFAULT 0,
  `efficiency` decimal(5,2) DEFAULT 0.00,
  `operator` varchar(255) DEFAULT NULL,
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_machine_id` (`machine_id`),
  KEY `idx_status` (`status`),
  KEY `idx_last_update` (`last_update`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `machine_status`
--

INSERT IGNORE INTO `machine_status` (`machine_id`, `status`, `target`, `actual`, `output_today`, `efficiency`, `operator`, `last_update`, `notes`) VALUES
('MC001','active',100,85,85,85.00,'John Operator','2025-08-05 12:07:09',NULL),
('MC002','maintenance',120,0,0,0.00,NULL,'2025-08-05 12:07:09',NULL);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;
