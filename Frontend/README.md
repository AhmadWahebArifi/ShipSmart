# ShipSmart Frontend

React frontend for the ShipSmart logistics management system.

## Role-Based Permissions System

This frontend implements a role-based permissions system that works with the backend API:

### 1. SuperAdmin 🔴

- Full access to all features
- User management capabilities
- System-wide analytics and reporting

### 2. Admin 🟠

- Manage shipments and routes
- View all users and their shipments
- Access system statistics

### 3. User (Branch) 🟢

- Manage shipments for their branch only
- Change status of shipments where destination is their branch
- Send products to other branches

## Key Features

### Authentication

- Login/logout functionality
- Role-based access control
- JWT token management

### Dashboard

- Overview of shipment statistics
- Recent activity feed
- Quick access to common actions

### Shipment Management

- Create and track shipments
- Update shipment status
- View shipment history

### User Management (Admin/SuperAdmin only)

- Create, edit, and delete users
- Assign roles and permissions
- Manage branch assignments

### Profile Management

- Update personal information
- Change profile picture
- Update contact details

### Settings

- Language selection (English, Dari, Pashto)
- Theme switching (Light/Dark mode)

## Setup Instructions

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Access the application at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Folder Structure

```
src/
├── components/     # Reusable UI components
├── config/         # Configuration files (axios, etc.)
├── context/        # React context providers
├── i18n/           # Internationalization files
├── pages/          # Page components
└── main.jsx        # Application entry point
```

## Role-Based Navigation

The sidebar navigation dynamically adjusts based on the user's role:

- SuperAdmin/Admin: See all menu items including User Management
- User (Branch): Limited menu items relevant to their role

## Theme Support

The application supports both light and dark themes:

- Theme preference is saved in localStorage
- Respects system preference by default
- Toggle available in sidebar

## Internationalization

The application supports multiple languages:

- English (default)
- Dari (prs)
- Pashto (pbt)

Language preference is saved in localStorage.
