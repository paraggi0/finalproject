-- MySQL 8.0 Compatible Export
-- Database: topline_manufacturing
-- Table Group: Master Data Tables
-- Compatible with Google Cloud SQL MySQL 8.0

-- Set SQL mode for MySQL 8.0 compatibility
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Disable foreign key checks during import
SET FOREIGN_KEY_CHECKS = 0;

--
-- Table structure for table `master_component`
--

CREATE TABLE IF NOT EXISTS `master_component` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `component_code` varchar(50) NOT NULL,
  `component_name` varchar(255) NOT NULL,
  `specification` text DEFAULT NULL,
  `unit` varchar(20) DEFAULT 'PCS',
  `category` enum('ELECTRONIC','MECHANICAL','FASTENER','OTHERS') DEFAULT 'MECHANICAL',
  `supplier` varchar(255) DEFAULT NULL,
  `minimum_stock` int(11) DEFAULT 0,
  `maximum_stock` int(11) DEFAULT 0,
  `unit_price` decimal(15,2) DEFAULT 0.00,
  `lead_time_days` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `component_code` (`component_code`),
  KEY `idx_component_code` (`component_code`),
  KEY `idx_category` (`category`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `master_component`
--

INSERT INTO `master_component` (`id`, `component_code`, `component_name`, `specification`, `unit`, `category`, `supplier`, `minimum_stock`, `maximum_stock`, `unit_price`, `lead_time_days`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'COMP-0001', '(TWIN TUB) PULSATOR COVER', 'Model: xx, Customer: PT HASURA MITRA GEMILANG', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(2, 'COMP-0002', '1PA CAP', 'Model: 1PA, Customer: PT YASUFUKU INDONESIA', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(3, 'COMP-0003', '1PA PROTECTOR MUFFLER', 'Model: 1PA, Customer: PT YASUFUKU INDONESIA', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(4, 'COMP-0004', '28D PROTECTOR MUFFLER', 'Model: 28D, Customer: PT YASUFUKU INDONESIA', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(5, 'COMP-0005', '2DP PROTECTOR MUFFLER', 'Model: 2DP, Customer: PT YASUFUKU INDONESIA', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(6, 'COMP-0006', '2PH-00 PROTECTOR MUFFLER', 'Model: 2PH, Customer: PT YASUFUKU INDONESIA', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(7, 'COMP-0007', '2PH-10 PROTECTOR MUFFLER', 'Model: 2PH, Customer: PT YASUFUKU INDONESIA', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(8, 'COMP-0008', '2PV CAP', 'Model: 2PV, Customer: PT YASUFUKU INDONESIA', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(9, 'COMP-0009', '54P PROTECTOR MUFFLER', 'Model: 54P, Customer: PT YASUFUKU INDONESIA', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(10, 'COMP-0010', 'B6H PROTECTOR MUFFLER', 'Model: B6H, Customer: PT YASUFUKU INDONESIA', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(11, 'COMP-0011', 'BACK COVER', 'Model: NAVICOM SMART SWITCH COMPONENT, Customer: PT NAVICOM INDONESIA', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(12, 'COMP-0012', 'BASE COVER A', 'Model: NAVICOM SMART SWITCH COMPONENT, Customer: PT NAVICOM INDONESIA', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(13, 'COMP-0013', 'BASE COVER B', 'Model: NAVICOM SMART SWITCH COMPONENT, Customer: PT NAVICOM INDONESIA', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(14, 'COMP-0014', 'BRACKET', 'Model: 660A, Customer: PT RESIN PLATING TECHNOLOGY', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54'),
(15, 'COMP-0015', 'CAP PAINTING LH_FL1', 'Model: KS CLZM, Customer: PT CUBIC INDONESIA', 'PCS', 'MECHANICAL', 'Component Supplier', 100, 1000, 0.00, 7, 1, '2025-08-05 13:11:54', '2025-08-05 13:11:54');

--
-- Table structure for table `master_customer`
--

CREATE TABLE IF NOT EXISTS `master_customer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_code` varchar(50) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `alamat` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_code` (`customer_code`),
  KEY `idx_customer_code` (`customer_code`),
  KEY `idx_customer_name` (`customer_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `master_customer`
--

INSERT INTO `master_customer` (`id`, `customer_code`, `customer_name`, `alamat`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'BINFAJ', 'CV BINTANG FAJAR', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(2, 'ARKINDIND', 'PT ARKHA INDUSTRIES INDONESIA', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(4, 'ASTKOMIND', 'PT ASTRA KOMPONEN INDONESIA', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(5, 'AUTPLAIND', 'PT AUTO PLASTIK INDONESIA', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(6, 'CUBIND', 'PT CUBIC INDONESIA', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(7, 'DAIIND', 'PT DAISABISU INDONESIA', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(8, 'FRAIND', 'PT FRAMAS INDONESIA', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(9, 'HASMITGEM', 'PT HASURA MITRA GEMILANG', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(10, 'JAEIND', 'PT JAEIL INDONESIA', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(11, 'KIRENGIND', 'PT KIRA ENGINEERING INDONESIA', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(12, 'NAVIND', 'PT NAVICOM INDONESIA', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(13, 'NISCHEIND', 'PT NISSEN CHEMITEC INDONESIA', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(14, 'ORIDURIND', 'PT ORIGIN DURACHEM INDONESIA', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(15, 'PATPREENG', 'PT PATEC PRESISI ENGINEERING', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(16, 'RESPLATEC', 'PT RESIN PLATING TECHNOLOGY', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24'),
(17, 'YASIND', 'PT YASUFUKU INDONESIA', NULL, 1, '2025-08-05 12:39:24', '2025-08-05 12:39:24');

--
-- Table structure for table `master_material`
--

CREATE TABLE IF NOT EXISTS `master_material` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `material_code` varchar(50) NOT NULL,
  `material_name` varchar(255) NOT NULL,
  `specification` text DEFAULT NULL,
  `unit` varchar(20) DEFAULT 'PCS',
  `category` enum('RAW_MATERIAL','SEMI_FINISHED','CONSUMABLE') DEFAULT 'RAW_MATERIAL',
  `supplier` varchar(255) DEFAULT NULL,
  `minimum_stock` int(11) DEFAULT 0,
  `maximum_stock` int(11) DEFAULT 0,
  `unit_price` decimal(15,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `material_code` (`material_code`),
  KEY `idx_material_code` (`material_code`),
  KEY `idx_category` (`category`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `master_material`
--

INSERT INTO `master_material` (`id`, `material_code`, `material_name`, `specification`, `unit`, `category`, `supplier`, `minimum_stock`, `maximum_stock`, `unit_price`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'MAT-0001', '5', 'Model: 6, Customer: PT FRAMAS INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(2, 'MAT-0002', '5', 'Model: ALPHA 4, Customer: PT HASURA MITRA GEMILANG', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(3, 'MAT-0003', '7', 'Model: VT6, Customer: PT HASURA MITRA GEMILANG', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(4, 'MAT-0004', 'A-DHU01-PK001', 'Model: xx, Customer: PT HASURA MITRA GEMILANG', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(5, 'MAT-0005', 'AB2MRR-KCMR93', 'Model: COVER MIRROR BACK R/L K93A YR-342, Customer: PT ARKHA INDUSTRIES INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(6, 'MAT-0006', 'BAS-00-007 BASE GARNISH INSTR CSTR FINISH PANEL NO', 'Model: xx, Customer: PT HASURA MITRA GEMILANG', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(7, 'MAT-0007', 'BODY', 'Model: SENSOR SERIES COMMON, Customer: PT NAVICOM INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(8, 'MAT-0008', 'BOLT SEAT HINGE', 'Model: K18, Customer: PT AUTO PLASTIK INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(9, 'MAT-0009', 'BOX BF', 'Model: xx, Customer: CV BINTANG FAJAR', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(10, 'MAT-0010', 'BOX COMP LUGGAGE KYZA', 'Model: KYZA, Customer: PT AUTO PLASTIK INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(11, 'MAT-0011', 'BOX TYPE D231 611 BLUE COLOR', 'Model: D331, Customer: PT DAISABISU INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(12, 'MAT-0012', 'BOX TYPE D231-611_GREEN COLOR', 'Model: D331, Customer: PT DAISABISU INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(13, 'MAT-0013', 'BOX TYPE D231-611_YELLOW COLOR', 'Model: D331, Customer: PT DAISABISU INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(14, 'MAT-0014', 'BOX TYPE D231-622 / 6262', 'Model: D231, Customer: PT DAISABISU INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(15, 'MAT-0015', 'BOX TYPE D231-633_BLUE COLOR', 'Model: D231, Customer: PT DAISABISU INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(16, 'MAT-0016', 'BOX TYPE D231-633_BROWN COLOR', 'Model: D231, Customer: PT DAISABISU INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(17, 'MAT-0017', 'BOX TYPE D231-633_GREEN COLOR', 'Model: D231, Customer: PT DAISABISU INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(18, 'MAT-0018', 'BOX TYPE D231-633_ORANGE COLOR', 'Model: D231, Customer: PT DAISABISU INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(19, 'MAT-0019', 'BOX TYPE D231-633_RED COLOR', 'Model: D231, Customer: PT DAISABISU INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43'),
(20, 'MAT-0020', 'BOX TYPE D231-633_YELLOW COLOR', 'Model: D231, Customer: PT DAISABISU INDONESIA', 'PCS', 'RAW_MATERIAL', 'TBD Supplier', 500, 2000, 0.00, 1, '2025-08-05 13:11:43', '2025-08-05 13:11:43');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;
