# ShipSmart

A Provincial Goods Transfer Management System for Afghanistan, streamlining logistics operations between provinces and cities.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Role-Based Permissions](#role-based-permissions)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

### 📦 Shipment Management

- Create, track, and manage goods transfers between provinces
- Real-time status updates (Pending, In Transit, Delivered)
- Unique tracking numbers for each shipment

### 🗺️ Route Planning

- Optimize delivery routes between provinces
- Calculate distances and estimated delivery times
- Visualize route maps

### 🚛 Vehicle & Driver Management

- Manage fleet of vehicles and assign drivers
- Track vehicle capacity and maintenance schedules
- Monitor driver performance and availability

### ⏱️ Real-time Tracking

- Live shipment tracking with GPS integration
- Push notifications for status changes
- Delivery confirmation system

### 📊 Reports & Analytics

- Generate shipment reports by province, date, and status
- Analyze delivery performance metrics
- Export data in multiple formats

### 🔐 Role-Based Access Control

- **SuperAdmin**: Full system access
- **Admin**: Administrative privileges
- **User (Branch)**: Branch-specific operations
- Multi-language support (English, Dari, Pashto)
- Light/Dark theme support

## Technology Stack

### Frontend

- **React 18** - Modern UI library
- **Vite 5** - Fast build tool
- **TailwindCSS 3.4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **Sequelize** - ORM for database operations
- **JWT** - Authentication tokens
- **Bcrypt.js** - Password hashing

### Development Tools

- **Nodemon** - Auto-reload during development
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Project Structure

```
ShipSmart/
├── Backend/              # Express.js API
│   ├── config/           # DB and env configs
│   ├── middleware/       # Auth middleware
│   ├── models/           # Sequelize models
│   ├── routes/           # API endpoints
│   ├── scripts/          # DB setup and seeding
│   └── server.js         # Entry point
└── Frontend/             # React App (Vite)
    ├── src/components/   # UI components
    ├── src/pages/        # Page views
    ├── src/context/      # React context providers
    ├── src/i18n/         # Internationalization
    └── main.jsx          # App entry
```

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Backend Setup

```bash
cd Backend
npm install

# Create .env file (copy env.example.txt)
cp env.example.txt .env
# Edit .env with your database credentials

# Create MySQL database
CREATE DATABASE shipsmart_db;

# Run database migrations
npm run create-role-users

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd Frontend
npm install

# Start development server
npm run dev
```

### Default Login Credentials

- **SuperAdmin**: superadmin@shipsmart.com / superadmin123
- **Admin**: admin@shipsmart.com / admin123
- **Branch User**: user@shipsmart.com / user123

## Role-Based Permissions

This system implements a comprehensive role-based access control system:

### SuperAdmin 🔴

- Full access to all system features
- Manage all users (create, edit, delete)
- View and modify all shipments
- Access all system statistics and reports
- Configure system settings

### Admin 🟠

- Manage shipments (create, view, update status)
- View all users and their shipments
- Access system statistics
- Cannot modify SuperAdmin accounts

### User (Branch) 🟢

- View and manage shipments for their branch only
- Change status of shipments where destination is their branch
- Send products to other branches
- Cannot access other branches' data

For detailed implementation information, see [ROLE_BASED_PERMISSIONS.md](ROLE_BASED_PERMISSIONS.md)

## Screenshots

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Shipment Management

![Shipments](screenshots/shipments.png)

### User Profile

![Profile](screenshots/profile.png)

### Settings

![Settings](screenshots/settings.png)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
