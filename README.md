# 🚚 ShipSmart – Provincial Goods Transfer Management System

**ShipSmart** is a modern logistics and transport management system designed to streamline goods transfer between provinces and cities.  
It helps companies manage shipments, routes, vehicles, and delivery tracking efficiently with real-time visibility.

---

## 🌐 Features

- 📦 **Shipment Management** – Create, assign, and track shipments easily  
- 🗺️ **Route Planning** – Manage delivery routes between provinces or cities  
- 🚛 **Vehicle & Driver Management** – Keep records of fleet and drivers  
- ⏱️ **Real-time Tracking** – Monitor shipment status live  
- 📊 **Reports & Analytics** – Generate delivery and performance reports  
- 🔐 **Role-Based Access** – Separate dashboards for Admins, Drivers, and Clients  

---

## 🧰 Tech Stack

**Frontend:** React, Vite, TailwindCSS, Axios, React Router DOM  
**Backend:** Node.js, Express.js  
**Database:** MySQL  
**Authentication:** JWT (jsonwebtoken)  
**Security:** bcryptjs, express-validator  

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `Backend` directory:
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
   
   *(Copy `Backend/config/env.example.txt` to `Backend/.env` and update the values)*

4. **Create MySQL database:**
   ```bash
   mysql -u root -p < Backend/config/database.sql
   ```
   
   Or manually:
   ```sql
   CREATE DATABASE shipsmart_db;
   ```

5. **Create a default user (optional but recommended):**
   ```bash
   cd Backend
   npm run create-user
   ```
   
   This creates an admin user you can use to login:
   - **Email:** `admin@test.com`
   - **Password:** `admin123`
   - **Role:** `admin`

6. **Run the backend server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```
   
   The API will be available at `http://localhost:5000`

**Note:** If you skipped step 5, you can create a user by calling the register API endpoint or running `npm run create-user` in the Backend directory.

### Frontend Setup

1. **Navigate to Frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The app will automatically open at `http://localhost:3000`

### Running Both Servers

You'll need to run both servers simultaneously:

**Terminal 1 (Backend):**
```bash
cd Backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd Frontend
npm run dev
```

---

## 📁 Project Structure

```
ShipSmart/
├── Backend/              # Node.js Express API
│   ├── config/           # Database & configuration
│   ├── routes/           # API routes
│   ├── server.js         # Main server file
│   └── package.json
├── Frontend/             # React application (Vite)
│   ├── src/              # React components
│   ├── index.html        # HTML entry point
│   ├── vite.config.js    # Vite configuration
│   └── package.json
└── README.md
```

For detailed documentation, see:
- [Backend README](Backend/README.md)
- [Frontend README](Frontend/README.md)
