# ShipSmart Backend

## Role-Based Permissions System

This system implements three distinct user roles with specific permissions:

### 1. SuperAdmin 🔴

- **Permissions**: Full access to all system features
- **Capabilities**:
  - Manage all users (create, edit, delete)
  - View and modify all shipments
  - Access all system statistics and reports
  - Configure system settings

### 2. Admin 🟠

- **Permissions**: Administrative access with some limitations
- **Capabilities**:
  - Manage shipments (create, view, update status)
  - View all users and their shipments
  - Access system statistics
  - Cannot modify SuperAdmin accounts

### 3. User (Branch) 🟢

- **Permissions**: Limited to branch-specific operations
- **Capabilities**:
  - View and manage shipments for their branch only
  - Change status of shipments where destination is their branch
  - Send products to other branches
  - Cannot access other branches' data

## Setup Instructions

### 1. Create Role-Based Users

```bash
npm run create-role-users
```

This creates:

- SuperAdmin: superadmin@shipsmart.com / superadmin123
- Admin: admin@shipsmart.com / admin123
- Branch Users: user@shipsmart.com / user123, user2@shipsmart.com / user123

### 2. Update User Branches

```bash
npm run update-user-branches
```

This assigns branch information to existing users.

### 3. Create Sample Shipments

```bash
npm run create-sample-shipments
```

This creates sample shipments for testing the role-based permissions.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/profile` - Update user profile

### Shipments

- `GET /api/shipments` - Get all shipments (filtered by role)
- `GET /api/shipments/:id` - Get specific shipment
- `POST /api/shipments` - Create new shipment
- `PUT /api/shipments/:id/status` - Update shipment status
- `GET /api/shipments/stats/overview` - Get shipment statistics (Admin only)

### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get specific user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## Role-Based Access Control Logic

### Shipment Creation

- SuperAdmin/Admin: Can create shipments from any province
- User: Can only create shipments from their branch's province

### Shipment Status Updates

- SuperAdmin: Can update any shipment status
- Admin: Can update any shipment status
- User:
  - Can mark shipments as "in progress" if they sent it or if it originates from their branch
  - Can mark shipments as "delivered" if they are the receiver or if destination is their branch
  - Can reset to "pending" only for shipments they sent

### Data Visibility

- SuperAdmin: Can see all shipments and users
- Admin: Can see all shipments and users
- User: Can only see shipments they sent or received
