# API Setup Documentation - Complete Website CRUD System

**PT. Topline Evergreen Manufacturing**  
**Date:** January 20, 2025  
**Status:** ✅ COMPLETE - All APIs configured for website CRUD operations

## 🎯 Overview

API backend telah berhasil dikonfigurasi untuk mendukung seluruh kebutuhan website dengan operasi CRUD lengkap. Sistem mencakup:

- **Warehouse Management** - Pengelolaan gudang lengkap
- **Production Management** - Manajemen produksi komprehensif  
- **Quality Control (QC)** - Kontrol kualitas terintegrasi
- **Authentication & Security** - Keamanan API dengan API key

## 🚀 Server Status

### Backend Server
- **URL:** http://localhost:3001
- **Status:** ✅ RUNNING
- **Database:** MySQL via XAMPP
- **API Key:** `website-admin-2025`

### Frontend Server  
- **URL:** http://localhost:8081
- **Status:** ✅ RUNNING
- **Type:** Static HTTP Server

## 📋 API Structure

### Base URL Structure
```
http://localhost:3001/api/website/[module]/[endpoint]
```

### Headers Required
```
x-api-key: website-admin-2025
Content-Type: application/json
```

## 🏭 WAREHOUSE MODULE

### Base Path: `/api/website/warehouse/`

#### Dashboard
- **GET** `/dashboard` - Warehouse dashboard data

#### Finished Goods CRUD
- **GET** `/finished-goods` - List all finished goods
- **GET** `/finished-goods/:id` - Get specific finished goods
- **POST** `/finished-goods` - Create new finished goods
- **PUT** `/finished-goods/:id` - Update finished goods
- **DELETE** `/finished-goods/:id` - Delete finished goods

#### Delivery Control CRUD
- **GET** `/delivery-control` - List all delivery control records
- **GET** `/delivery-control/:id` - Get specific delivery control
- **POST** `/delivery-control` - Create new delivery control
- **PUT** `/delivery-control/:id` - Update delivery control
- **DELETE** `/delivery-control/:id` - Delete delivery control

#### Delivery Orders CRUD
- **GET** `/delivery-orders` - List all delivery orders
- **GET** `/delivery-orders/:id` - Get specific delivery order
- **POST** `/delivery-orders` - Create new delivery order
- **PUT** `/delivery-orders/:id` - Update delivery order
- **DELETE** `/delivery-orders/:id` - Delete delivery order

#### Warehouse Returns CRUD
- **GET** `/warehouse-returns` - List all warehouse returns
- **GET** `/warehouse-returns/:id` - Get specific warehouse return
- **POST** `/warehouse-returns` - Create new warehouse return
- **PUT** `/warehouse-returns/:id` - Update warehouse return
- **DELETE** `/warehouse-returns/:id` - Delete warehouse return

#### Stock Reports
- **GET** `/stock-reports` - Combined WIP and finished goods reports

## 🏭 PRODUCTION MODULE

### Base Path: `/api/website/production/`

#### Dashboard
- **GET** `/dashboard` - Production dashboard data

#### Machine Output CRUD
- **GET** `/machine-output` - List all machine output records
- **GET** `/machine-output/:id` - Get specific machine output
- **POST** `/machine-output` - Create new machine output
- **PUT** `/machine-output/:id` - Update machine output
- **DELETE** `/machine-output/:id` - Delete machine output

#### WIP Inventory CRUD
- **GET** `/wip-inventory` - List all WIP inventory records
- **GET** `/wip-inventory/:id` - Get specific WIP inventory
- **POST** `/wip-inventory` - Create new WIP inventory
- **PUT** `/wip-inventory/:id` - Update WIP inventory
- **DELETE** `/wip-inventory/:id` - Delete WIP inventory

#### Machine Status CRUD
- **GET** `/machine-status` - List all machine status records
- **GET** `/machine-status/:id` - Get specific machine status
- **POST** `/machine-status` - Create new machine status
- **PUT** `/machine-status/:id` - Update machine status
- **DELETE** `/machine-status/:id` - Delete machine status

#### Reports
- **GET** `/reports` - Production reports with filtering

## 🔍 QUALITY CONTROL MODULE

### Base Path: `/api/website/qc/`

#### Dashboard
- **GET** `/dashboard` - QC dashboard data

#### IQC (Incoming Quality Control) CRUD
- **GET** `/iqc` - List all IQC records
- **GET** `/iqc/:id` - Get specific IQC record
- **POST** `/iqc` - Create new IQC record
- **PUT** `/iqc/:id` - Update IQC record
- **DELETE** `/iqc/:id` - Delete IQC record

#### OQC (Outgoing Quality Control) CRUD
- **GET** `/oqc` - List all OQC records
- **GET** `/oqc/:id` - Get specific OQC record
- **POST** `/oqc` - Create new OQC record
- **PUT** `/oqc/:id` - Update OQC record
- **DELETE** `/oqc/:id` - Delete OQC record

#### RQC (Rework Quality Control) CRUD
- **GET** `/rqc` - List all RQC records
- **GET** `/rqc/:id` - Get specific RQC record
- **POST** `/rqc` - Create new RQC record
- **PUT** `/rqc/:id` - Update RQC record
- **DELETE** `/rqc/:id` - Delete RQC record

#### NG (Not Good) Management CRUD
- **GET** `/ng` - List all NG records
- **GET** `/ng/:id` - Get specific NG record
- **POST** `/ng` - Create new NG record
- **PUT** `/ng/:id` - Update NG record
- **DELETE** `/ng/:id` - Delete NG record

#### Reports
- **GET** `/reports` - QC reports with filtering

## 🗃️ Database Tables

### Warehouse Tables
- `finished_goods` - Finished goods inventory
- `delivery_control` - Delivery management
- `delivery_orders` - Order tracking
- `warehouse_returns` - Return processing
- `warehouse_locations` - Location management

### Production Tables
- `outputmc` - Machine output records
- `wip` - Work in process inventory
- `machine_status` - Machine status tracking

### QC Tables
- `iqc_records` - Incoming quality control
- `oqc_records` - Outgoing quality control
- `rqc_records` - Rework quality control
- `ng_records` - Not good/defective parts
- `qc_inspection_checklist` - Standard checklists
- `qc_inspection_results` - Detailed results

## 🔧 API Features

### Pagination Support
All list endpoints support pagination:
```
?page=1&limit=50
```

### Filtering Support
Most endpoints support filtering:
```
?start_date=2025-01-01&end_date=2025-01-31&status=ACTIVE
```

### Response Format
Standard JSON response format:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  },
  "message": "Data berhasil diambil"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 🔐 Security Features

### API Key Authentication
- Header: `x-api-key: website-admin-2025`
- Applied to all endpoints
- 401 response for invalid keys

### Input Validation
- Required field validation
- Data type validation
- SQL injection prevention

### Database Security
- Prepared statements
- Transaction support
- Error handling

## 📖 Frontend Integration

### CRUD Utility Library
- **File:** `/assets/js/crud-utils.js`
- **Classes:** `CRUDManager`, `CRUDUIHelper`
- **Features:** Complete CRUD operations, form generation, validation

### Page Integration
All website pages integrated with CRUD system:

#### Warehouse Pages
- `/pages/wh/dashboard-wh.html` - Dashboard
- `/pages/wh/invfg.html` - Finished Goods
- `/pages/wh/dc.html` - Delivery Control
- `/pages/wh/do.html` - Delivery Orders
- `/pages/wh/return-wh.html` - Returns

#### Production Pages
- `/pages/produksi/dashboard-produksi.html` - Dashboard
- `/pages/produksi/mcoutput.html` - Machine Output
- `/pages/produksi/invwip.html` - WIP Inventory
- `/pages/produksi/mcstatus.html` - Machine Status

#### QC Pages
- `/pages/qc/dashboard-qc.html` - Dashboard
- `/pages/qc/iqc.html` - Incoming QC
- `/pages/qc/oqc.html` - Outgoing QC
- `/pages/qc/rqc.html` - Rework QC
- `/pages/qc/ng-qc.html` - NG Management

## 🧪 Testing

### API Testing Commands

#### Test Warehouse API
```bash
curl -X GET "http://localhost:3001/api/website/warehouse/dashboard" -H "x-api-key: website-admin-2025"
```

#### Test Production API
```bash
curl -X GET "http://localhost:3001/api/website/production/dashboard" -H "x-api-key: website-admin-2025"
```

#### Test QC API
```bash
curl -X GET "http://localhost:3001/api/website/qc/dashboard" -H "x-api-key: website-admin-2025"
```

### Frontend Testing
1. Open browser: http://localhost:8081
2. Navigate to any module page
3. Test CRUD operations
4. Verify API integration

## 🚀 Deployment Notes

### Requirements
- Node.js (v14+)
- MySQL 8.0+
- XAMPP for local development

### Startup Commands
```bash
# Backend
cd backend && npm start

# Frontend  
cd frontend && npx http-server -p 8081 -c-1
```

### Database Setup
```bash
# Run all schema files
mysql -u root -p < 07_warehouse_extensions_mysql8.sql
mysql -u root -p < 08_qc_extensions_mysql8.sql
```

## ✅ Status Summary

| Module | Dashboard | CRUD APIs | Frontend | Database | Status |
|--------|-----------|-----------|----------|----------|---------|
| Warehouse | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| Production | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| Quality Control | ✅ | ✅ | ✅ | ✅ | COMPLETE |

## 📞 Support

Semua API telah dikonfigurasi dan siap digunakan untuk operasi CRUD lengkap pada website PT. Topline Evergreen Manufacturing. Sistem mendukung pengelolaan warehouse, produksi, dan quality control dengan fitur lengkap dan terintegrasi.

---
**Setup Complete!** ✅ API backend sekarang mendukung seluruh kebutuhan website dengan struktur yang terorganisir dan fungsionalitas CRUD lengkap.
