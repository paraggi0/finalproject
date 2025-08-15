# API Documentation - PT. Topline Evergreen Manufacturing
## Complete System API Reference

### Server Configuration
- **Base URL**: `http://192.168.1.184:3001`
- **Server**: Node.js Express with MySQL Database
- **Static IP**: 192.168.1.184:3001

---

## WEBSITE API ENDPOINTS
**Base Path**: `/api/website`  
**Authentication**: Header `x-api-key: website-admin-2025`

### Master Data Management
**Base Path**: `/api/website/masterdata`

#### BOM Management
- **GET** `/bom` - List all BOM records with pagination
- **POST** `/bom` - Create new BOM record
- **PUT** `/bom/:id` - Update BOM record
- **DELETE** `/bom/:id` - Delete BOM record

#### User Management  
- **GET** `/users` - List all users with pagination
- **POST** `/users` - Create new user (auto-hash password)
- **PUT** `/users/:id` - Update user data
- **DELETE** `/users/:id` - Delete user

### Stock Management
**Base Path**: `/api/website/stock`

#### WIP Stock Management
- **GET** `/wip` - List WIP inventory with pagination
- **POST** `/wip` - Create WIP stock entry
- **PUT** `/wip/:id` - Update WIP stock
- **DELETE** `/wip/:id` - Delete WIP stock record

#### Finished Goods Management
- **GET** `/finished-goods` - List finished goods with pagination
- **POST** `/finished-goods` - Create finished goods entry
- **PUT** `/finished-goods/:id` - Update finished goods
- **DELETE** `/finished-goods/:id` - Delete finished goods record

#### Stock Dashboard
- **GET** `/dashboard` - Get stock summary dashboard data

---

## ANDROID API ENDPOINTS
**Base Path**: `/api/android`  
**Authentication**: Header `x-api-key: android-topline-2025`

### Authentication
**Base Path**: `/api/android/auth`

- **POST** `/login` - Android user login
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

### Production Management
**Base Path**: `/api/android/production`

#### Data Retrieval (GET)
- **GET** `/customers` - List all customers for dropdown
- **GET** `/bom-by-customer/:customer` - Get BOM by customer
- **GET** `/machines` - List all machines
- **GET** `/mc-output` - List MC output records with pagination
- **GET** `/mc-status` - Get current machine status

#### Production Input (POST)
- **POST** `/machine-status` - Record machine status
  ```json
  {
    "machine_name": "string",
    "status": "RUNNING|STOPPED|MAINTENANCE|BREAKDOWN",
    "operator": "string",
    "shift": "string",
    "remarks": "string",
    "temperature": "number",
    "pressure": "number",
    "rpm": "number"
  }
  ```

- **POST** `/production-output` - Record production output
  ```json
  {
    "bom_id": "number",
    "machine_name": "string", 
    "quantity_produced": "number",
    "quantity_good": "number",
    "quantity_ng": "number",
    "operator": "string",
    "shift": "string",
    "start_time": "datetime",
    "end_time": "datetime",
    "remarks": "string"
  }
  ```

- **POST** `/start-batch` - Start production batch
  ```json
  {
    "bom_id": "number",
    "batch_number": "string",
    "planned_quantity": "number",
    "machine_name": "string",
    "operator": "string",
    "shift": "string",
    "target_completion": "datetime",
    "remarks": "string"
  }
  ```

### Quality Control Management
**Base Path**: `/api/android/qc`

#### Incoming QC
- **POST** `/incoming` - Record incoming QC inspection
  ```json
  {
    "partnumber": "string",
    "lotnumber": "string", 
    "quantity": "number",
    "supplier": "string",
    "inspector": "string",
    "inspection_result": "pass|fail|conditional",
    "notes": "string"
  }
  ```

#### Outgoing QC
- **POST** `/outgoing` - Record outgoing QC inspection
  ```json
  {
    "partnumber": "string",
    "lotnumber": "string",
    "quantity_total": "number",
    "quantity_ok": "number", 
    "quantity_ng": "number",
    "inspector": "string",
    "inspection_result": "pass|fail|conditional",
    "notes": "string"
  }
  ```

#### NG QC
- **POST** `/ng` - Record NG (Not Good) items
  ```json
  {
    "partnumber": "string",
    "lotnumber": "string",
    "quantity_ng": "number",
    "defect_type": "string",
    "defect_description": "string", 
    "inspector": "string",
    "action_taken": "string",
    "notes": "string"
  }
  ```

#### Return QC
- **POST** `/return` - Record return QC
  ```json
  {
    "partnumber": "string",
    "lotnumber": "string",
    "quantity_return": "number",
    "return_reason": "string",
    "return_from": "string",
    "inspector": "string",
    "action_plan": "string",
    "notes": "string"
  }
  ```

### Inventory Management
**Base Path**: `/api/android/inventory`

#### Stock Viewing (GET)
- **GET** `/wip` - View WIP inventory with pagination
- **GET** `/finished-goods` - View finished goods with pagination 
- **GET** `/summary` - Get inventory summary dashboard

#### Stock Operations (POST)
- **POST** `/wip-movement` - Record WIP movement
  ```json
  {
    "part_number": "string",
    "lot_number": "string",
    "from_location": "string",
    "to_location": "string", 
    "quantity": "number",
    "moved_by": "string",
    "reason": "string",
    "remarks": "string"
  }
  ```

- **POST** `/fg-input` - Input finished goods
  ```json
  {
    "part_number": "string",
    "lot_number": "string",
    "quantity": "number",
    "location": "string",
    "produced_by": "string",
    "quality_status": "approved|pending|rejected",
    "remarks": "string"
  }
  ```

- **POST** `/stock-adjustment` - Adjust stock levels
  ```json
  {
    "part_number": "string",
    "lot_number": "string", 
    "adjustment_type": "increase|decrease",
    "quantity": "number",
    "reason": "string",
    "adjusted_by": "string",
    "remarks": "string"
  }
  ```

### Warehouse Management  
**Base Path**: `/api/android/warehouse`

#### Delivery Management (GET)
- **GET** `/delivery-challans` - List delivery challans with pagination
- **GET** `/delivery-orders` - List delivery orders with pagination
- **GET** `/inventory-summary` - Get warehouse inventory summary

#### Delivery Operations (POST)
- **POST** `/delivery-challan` - Create delivery challan
  ```json
  {
    "customer": "string",
    "delivery_items": [
      {
        "partnumber": "string",
        "description": "string",
        "quantity": "number",
        "cartons": "number",
        "lot_number": "string",
        "remarks": "string"
      }
    ],
    "prepared_by": "string",
    "scheduled_date": "date",
    "destination_address": "string",
    "transport_mode": "string",
    "remarks": "string"
  }
  ```

- **POST** `/delivery-order` - Create delivery order
  ```json
  {
    "dc_id": "number",
    "vehicle_number": "string",
    "driver_name": "string",
    "driver_phone": "string",
    "delivered_by": "string", 
    "delivery_instructions": "string",
    "remarks": "string"
  }
  ```

- **POST** `/update-delivery-status` - Update delivery status
  ```json
  {
    "do_id": "number",
    "status": "IN_TRANSIT|DELIVERED|RETURNED|CANCELLED",
    "received_by": "string",
    "received_date": "datetime",
    "delivery_notes": "string",
    "proof_of_delivery": "base64_string"
  }
  ```

### Stock Viewing
**Base Path**: `/api/android/stock`

- **GET** `/wip` - View WIP stock with pagination & filters
- **GET** `/finished-goods` - View finished goods stock
- **GET** `/summary` - Get stock summary by location

---

## RESPONSE FORMAT

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_records": 100,
    "records_per_page": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## PAGINATION
Most GET endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 10-20)

## AUTHENTICATION
All endpoints require API key in header:
- **Website**: `x-api-key: website-admin-2025`
- **Android**: `x-api-key: android-topline-2025`

## STATUS ENDPOINTS
- **GET** `/api/website/status` - Website API health check
- **GET** `/api/android/status` - Android API health check

---

## DATABASE TABLES USED

### Master Data
- `billofmaterial` - BOM/Parts master data
- `users` - User management
- `userandroid` - Android users

### Production
- `outputmc` - Machine output records
- `machine_status` - Machine status tracking
- `production_batches` - Production batch management
- `production_outputs` - Production output tracking
- `transferqc` - QC transfer records
- `wip_second_process` - WIP second process

### Quality Control
- `iqc_records` - Incoming QC records
- `oqc_records` - Outgoing QC records  
- `ng_qc_records` - NG QC records
- `rqc_records` - Return QC records
- `quality_issues` - Quality issue tracking

### Inventory & Stock
- `wip` - WIP inventory
- `wip_inventory` - WIP stock management
- `finished_goods` - Finished goods inventory
- `stock_movements` - Stock movement logs

### Warehouse
- `delivery_challans` - Delivery challan headers
- `delivery_challan_items` - DC line items
- `delivery_orders` - Delivery orders
- `delivery_tracking` - Delivery status tracking

---

## DEVELOPMENT NOTES

### API Architecture
- **Backend**: Node.js Express with MySQL
- **Authentication**: API Key based
- **Database**: MySQL with connection pooling
- **Validation**: Input validation on all POST endpoints
- **Error Handling**: Comprehensive error responses
- **Logging**: Console logging for debugging

### Security Features
- API key authentication
- Input sanitization
- SQL injection prevention
- Password hashing (bcrypt)
- Request validation

### Performance Features
- Pagination on list endpoints
- Database connection pooling
- Efficient queries with proper indexing
- Response caching considerations

---

**Last Updated**: January 2025  
**API Version**: 1.0.0  
**Environment**: Production Ready
