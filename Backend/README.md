# ShipSmart Backend API

Node.js Express backend with MySQL database for ShipSmart logistics management system.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd Backend
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the Backend directory:
   ```env
   PORT=5000
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=shipsmart_db
   
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   
   FRONTEND_URL=http://localhost:3000
   ```

3. **Create MySQL database:**
   ```sql
   CREATE DATABASE shipsmart_db;
   ```

4. **Create a default user (optional but recommended):**
   ```bash
   npm run create-user
   ```
   This will create an admin user:
   - Email: `admin@test.com`
   - Password: `admin123`
   - Role: `admin`

5. **Run the server:**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Test the API:**
   Open http://localhost:5000 in your browser or use:
   ```bash
   curl http://localhost:5000
   ```

## 📁 Project Structure

```
Backend/
├── config/
│   └── database.js       # MySQL connection configuration
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── shipments.js      # Shipment management routes
│   ├── routes.js         # Route planning routes
│   └── vehicles.js       # Vehicle management routes
├── server.js             # Main server file
├── package.json          # Dependencies
└── .env                  # Environment variables (create this)
```

## 🔌 API Endpoints

### Test Endpoints
- `GET /` - API status
- `GET /api/auth/test` - Test auth route
- `GET /api/shipments/test` - Test shipments route
- `GET /api/routes/test` - Test routes route
- `GET /api/vehicles/test` - Test vehicles route

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (mysql2)
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcryptjs, express-validator
- **Development:** nodemon

## 📝 Next Steps

1. Implement authentication middleware
2. Create database models/schemas
3. Implement CRUD operations for all routes
4. Add validation and error handling
5. Set up database migrations

