-- Clear Database Script for MySQL 8.0
-- Use this script to clean up existing data before importing new data
-- Run this BEFORE running the import scripts

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all data from existing tables (if they exist)
DELETE FROM stock_transactions WHERE 1=1;
DELETE FROM component_stock WHERE 1=1;
DELETE FROM material_stock WHERE 1=1;
DELETE FROM fg WHERE 1=1;
DELETE FROM wip WHERE 1=1;
DELETE FROM billofmaterial WHERE 1=1;
DELETE FROM production_transactions WHERE 1=1;
DELETE FROM production_orders WHERE 1=1;
DELETE FROM machine_status WHERE 1=1;
DELETE FROM master_component WHERE 1=1;
DELETE FROM master_customer WHERE 1=1;
DELETE FROM master_material WHERE 1=1;

-- Reset AUTO_INCREMENT counters
ALTER TABLE master_component AUTO_INCREMENT = 1;
ALTER TABLE master_customer AUTO_INCREMENT = 1;
ALTER TABLE master_material AUTO_INCREMENT = 1;
ALTER TABLE billofmaterial AUTO_INCREMENT = 1;
ALTER TABLE component_stock AUTO_INCREMENT = 1;
ALTER TABLE material_stock AUTO_INCREMENT = 1;
ALTER TABLE fg AUTO_INCREMENT = 1;
ALTER TABLE wip AUTO_INCREMENT = 1;
ALTER TABLE stock_transactions AUTO_INCREMENT = 1;
ALTER TABLE production_orders AUTO_INCREMENT = 1;
ALTER TABLE production_transactions AUTO_INCREMENT = 1;
ALTER TABLE machine_status AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
