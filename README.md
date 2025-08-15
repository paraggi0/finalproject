# PT. Topline Evergreen Manufacturing System

Sistem manajemen produksi terintegrasi untuk PT. Topline Evergreen Manufacturing dengan fitur lengkap untuk produksi, quality control, inventory, dan warehouse management.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 atau lebih tinggi)
- MySQL 8.0
- XAMPP (untuk development)

### Installation

1. **Clone repository**
```bash
git clone https://github.com/paraggi0/finalproject.git
cd finalproject
```

2. **Setup Backend**
```bash
cd backend
npm install
node server.js
```

3. **Setup Database**
- Import file SQL dari folder `database/`
- Jalankan script secara berurutan (01, 02, 03, 04)

4. **Access Application**
- Backend API: `http://localhost:3001`
- Frontend: Buka `frontend/index.html`

## 📱 Features

### Production Management
- Machine Output Recording
- Machine Status Monitoring
- Transfer to QC Process
- WIP Level Management

### Quality Control
- Incoming QC (IQC)
- Outgoing QC (OQC)
- Not Good Items Tracking
- Return QC Processing

### Inventory Management
- WIP Inventory Tracking
- Finished Goods Management
- Stock Movement Recording
- Low Stock Alerts

### Warehouse Management
- Delivery Challan Management
- Delivery Order Processing
- Return Management

## 🔧 API Endpoints

### Website API (Key: `website-admin-2025`)
- `/api/website/masterdata/bom` - BOM Management
- `/api/website/stock/summary` - Stock Dashboard
- `/api/website/masterdata/users` - User Management

### Android API (Key: `android-topline-2025`)
- `/api/android/production/*` - Production APIs
- `/api/android/qc/*` - Quality Control APIs
- `/api/android/inventory/*` - Inventory APIs
- `/api/android/warehouse/*` - Warehouse APIs

## 📄 Documentation

Complete API documentation available in `API_DOCUMENTATION.md`

## 🏭 Production Deployment

Use `start_production.bat` to start the production server.

## 📞 Support

For technical support, contact the development team.
## Production Management System

### 🚀 Quick Start

**Start the system:**
```bash
start_production.bat
```

**Manual startup:**
```bash
cd backend
node server.js
```

### 📱 System Components

- **Backend API**: Node.js + Express + MySQL
- **Frontend Web**: HTML + JavaScript  
- **Android App**: Native Android application
- **Database**: MySQL (XAMPP required)

### 🔑 Login Credentials

| Username | Password | Role |
|----------|----------|------|
| production01 | admin123 | Production |
| qc01 | admin123 | Quality Control |
| wh01 | admin123 | Warehouse |

### 🌐 Access URLs

- **Web Interface**: http://localhost:3001
- **Android API**: http://localhost:3001/api/android
- **API Health**: http://localhost:3001/api/health

### 📋 Requirements

- **Node.js** (v16 or higher)
- **MySQL** (XAMPP recommended)
- **Android Studio** (for Android app development)

### ⚙️ Configuration

**Database:** Update `backend/config/databaseAdapter.js` if needed
**Android:** Update IP address in `android/app/src/main/java/com/bangor/system/utils/NetworkUtils.java`

---
**© 2025 PT. Topline Evergreen Manufacturing**
