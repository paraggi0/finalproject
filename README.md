# PT. Topline Evergreen Manufacturing - Production Management System

## 🏭 Overview
Comprehensive web-based production management system for PT. Topline Evergreen Manufacturing, featuring real-time monitoring of production processes, WIP (Work in Progress) tracking, and quality control workflows.

## ✨ Features

### 🎯 Core Functionality
- **Production Dashboard**: Real-time monitoring of all production processes
- **Output MC Tracking**: Machine output monitoring and quality grade tracking
- **WIP Second Process**: Secondary operations workflow management
- **WIP Stock Production**: Work-in-progress inventory management
- **Quality Control Transfer**: QC workflow and batch tracking

### 🔍 Advanced Features
- **Individual Section Search**: Granular search functionality for each production section
- **Interactive Data Views**: Click on any row to view detailed information in modal
- **Real-time Updates**: Live data monitoring with connection status indicators
- **Responsive Design**: Mobile-friendly interface with modern UI/UX
- **Data Export**: Production reports and analytics export functionality

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup with modern structure
- **CSS3**: Advanced styling with gradients, animations, and responsive design
- **JavaScript ES6+**: Modern JavaScript with async/await, fetch API
- **Modular Architecture**: Separated CSS and JS files for maintainability

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MySQL2**: Database connectivity with connection pooling
- **RESTful API**: Standard HTTP methods and status codes

### Database
- **MySQL 8.0**: Relational database via XAMPP
- **Optimized Schema**: Indexed tables for performance
- **UTF8MB4**: Full Unicode support

## 📁 Project Structure

```
PT. Topline Evergreen Manufacturing/
├── frontend/
│   ├── pages/
│   │   └── Produksi/
│   │       └── dashboard-produksi.html
│   └── assets/
│       ├── css-produksi/
│       │   └── dashboard-produksi.css
│       └── js-produksi/
│           └── dashboard-produksi.js
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── production.js
│   │   └── stats.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── database_setup.sql
│   ├── start-system.bat
│   └── API_DOCUMENTATION.md
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **XAMPP** (for MySQL database)
- **Modern Web Browser** (Chrome, Firefox, Edge)

### Installation

1. **Clone/Download the Project**
   ```bash
   git clone [repository-url]
   cd finalproject
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Start the System**
   ```bash
   # Run the automated setup script
   .\start-system.bat
   ```

   **OR Manual Setup:**
   
   ```bash
   # Start XAMPP MySQL service
   # Then run:
   node server.js
   ```

4. **Access the Application**
   - **Frontend Dashboard**: Open `frontend/pages/Produksi/dashboard-produksi.html`
   - **Backend API**: http://localhost:3001
   - **API Documentation**: http://localhost:3001/api/health

### Alternative Setup (Demo Mode)

If you don't have XAMPP or want to see the interface quickly:

1. Open `frontend/assets/js-produksi/dashboard-produksi.js`
2. Change `USE_DEMO_DATA = false` to `USE_DEMO_DATA = true`
3. Open `frontend/pages/Produksi/dashboard-produksi.html` in browser

## 🎮 Usage Guide

### Production Dashboard
1. **Main Dashboard**: View overview statistics and real-time metrics
2. **Section Search**: Use individual search boxes for each production section
3. **View Details**: Click on any table row to see detailed information
4. **Edit Records**: Use the edit button (✏️) to modify entries
5. **Add New Records**: Click the "Add" buttons to create new entries

### API Integration
The system provides a comprehensive RESTful API:

- **GET** `/api/v1/production` - Retrieve all production data
- **GET** `/api/v1/production/{type}` - Get specific production type
- **POST** `/api/v1/production/{type}` - Add new production data
- **GET** `/api/v1/stats` - Get production statistics

See `backend/API_DOCUMENTATION.md` for complete API reference.

## 📊 Database Schema

### Production Tables
- **output_mc**: Machine output tracking
- **wip_second_process**: Secondary operations
- **wip_stock_produksi**: WIP inventory management
- **transaksi_produksi_to_qc**: Quality control transfers

Each table includes:
- Primary key and foreign key relationships
- Timestamps for audit trails
- Indexed columns for performance
- Status tracking and workflow states

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=topline_manufacturing
DB_USER=root
DB_PASSWORD=
```

### Frontend Configuration
```javascript
// In dashboard-produksi.js
const API_BASE_URL = 'http://localhost:3001/api/v1';
const USE_DEMO_DATA = false; // Toggle demo/live data
```

## 🎨 UI/UX Features

### Modern Design Elements
- **Gradient Backgrounds**: Professional corporate look
- **Card-based Layout**: Organized information display
- **Responsive Grid**: Adapts to different screen sizes
- **Interactive Elements**: Hover effects and smooth transitions
- **Status Indicators**: Color-coded badges for different states

### User Experience
- **Intuitive Navigation**: Clear section organization
- **Search Functionality**: Real-time filtering
- **Modal Details**: Non-intrusive detail viewing
- **Loading States**: Connection status feedback
- **Error Handling**: Graceful fallback to demo data

## 🧪 Testing

### Manual Testing
1. **Backend Health**: Visit http://localhost:3001/api/health
2. **Database Connection**: Visit http://localhost:3001/api/db-test
3. **API Endpoints**: Test with Postman or browser
4. **Frontend Integration**: Check browser console for connection status

### Sample Data
The system includes comprehensive sample data:
- 5 Output MC records
- 5 WIP Second Process records
- 5 WIP Stock records
- 5 To QC records

## 📈 Performance Optimizations

### Frontend
- **Modular CSS/JS**: Separated by functionality
- **Efficient DOM Updates**: Targeted element updates
- **Responsive Images**: Optimized loading
- **Cached API Responses**: Reduced server requests

### Backend
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Indexed database queries
- **Rate Limiting**: API protection
- **Compression**: Reduced response sizes

### Database
- **Indexed Columns**: Fast search and filtering
- **Normalized Schema**: Efficient data storage
- **UTF8MB4**: Full Unicode support
- **Timestamp Tracking**: Audit trails

## 🛡️ Security Features

- **CORS Protection**: Cross-origin request handling
- **Rate Limiting**: API abuse prevention
- **Input Validation**: SQL injection protection
- **Error Handling**: Secure error messages
- **Environment Variables**: Sensitive data protection

## 🔮 Future Enhancements

### Planned Features
- **User Authentication**: Role-based access control
- **Real-time WebSocket**: Live data updates
- **Advanced Analytics**: Trend analysis and forecasting
- **Mobile App**: Native mobile application
- **Integration APIs**: ERP system connectivity

### Scalability Considerations
- **Microservices Architecture**: Service separation
- **Container Deployment**: Docker containerization
- **Load Balancing**: High availability setup
- **Database Sharding**: Large-scale data handling

## 🤝 Contributing

### Development Guidelines
1. Follow existing code structure and naming conventions
2. Add comments for complex functionality
3. Test both frontend and backend changes
4. Update documentation for new features
5. Ensure responsive design compatibility

### Code Style
- **JavaScript**: ES6+ features, async/await
- **CSS**: BEM methodology, mobile-first approach
- **SQL**: Proper indexing and normalization
- **API**: RESTful conventions, consistent responses

## 📞 Support

### Troubleshooting
- **Database Connection Issues**: Check XAMPP MySQL service
- **Port Conflicts**: Ensure port 3001 is available
- **CORS Errors**: Verify backend is running
- **Demo Data**: Toggle USE_DEMO_DATA for testing

### Common Issues
1. **MySQL Not Starting**: Check XAMPP control panel
2. **Node Modules Missing**: Run `npm install` in backend directory
3. **API Not Responding**: Verify server.js is running
4. **Frontend Not Loading Data**: Check browser console for errors

## 📄 License

This project is developed for PT. Topline Evergreen Manufacturing internal use.

## 🙏 Acknowledgments

- **PT. Topline Evergreen Manufacturing**: Project requirements and specifications
- **Node.js Community**: Backend framework and libraries
- **MySQL Team**: Database technology
- **Modern Web Standards**: HTML5, CSS3, ES6+ features

---

**Version**: 1.0.0  
**Last Updated**: January 27, 2025  
**Developed for**: PT. Topline Evergreen Manufacturing  

🏭 **Building the Future of Manufacturing Excellence** 🏭
