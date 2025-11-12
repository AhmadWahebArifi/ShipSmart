# Role-Based Permissions Implementation

This document summarizes the implementation of role-based permissions in the ShipSmart application.

## Overview

We've implemented a three-tier role-based permission system:

1. **SuperAdmin** - Full system access
2. **Admin** - Administrative access with limitations
3. **User (Branch)** - Limited to branch-specific operations

## Backend Changes

### 1. User Model Updates

- Added new roles: `superadmin`, `user`
- Added new fields: `branch`, `province`
- Updated ENUM values for the `role` field

### 2. Database Schema Updates

- Modified `users` table to include new role options
- Added `branch` and `province` columns to `users` table
- Updated ENUM values for the `role` column

### 3. New Scripts

- `createRoleUsers.js` - Creates users with specific roles
- `updateUserBranches.js` - Updates existing users with branch information
- `createSampleShipments.js` - Creates sample shipments for testing

### 4. New Middleware

- `rolePermission.js` - Implements role-based access control
  - `requireRole()` - Checks if user has specific role
  - `canModifyShipment()` - Checks if user can modify shipment based on destination
  - `canSendToBranch()` - Checks if user can send products to other branches

### 5. Updated Routes

- `shipments.js` - Added role-based permissions to shipment operations
- `users.js` - Created new API endpoints for user management
- `server.js` - Registered new routes

### 6. New API Endpoints

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get specific user (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## Frontend Changes

### 1. New Pages

- `UserManagement.jsx` - User management interface for Admin/SuperAdmin users

### 2. Updated Components

- `Sidebar.jsx` - Added dynamic menu items based on user role
- `App.jsx` - Added route for User Management page

### 3. Updated Pages

- `Shipments.jsx` - Updated to use proper theme and sidebar integration

## Role Permissions Summary

### SuperAdmin 🔴

- Can do everything
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

## Setup Instructions

### 1. Create Role-Based Users

```bash
cd Backend
npm run create-role-users
```

### 2. Update User Branches

```bash
npm run update-user-branches
```

### 3. Create Sample Shipments

```bash
npm run create-sample-shipments
```

## Testing the Implementation

### Login Credentials

1. **SuperAdmin**

   - Email: superadmin@shipsmart.com
   - Password: superadmin123

2. **Admin**

   - Email: admin@shipsmart.com
   - Password: admin123

3. **Branch Users**
   - Email: user@shipsmart.com
   - Password: user123

### Testing Scenarios

1. **SuperAdmin Login**

   - Should see all menu items including User Management
   - Can create, edit, and delete any user
   - Can modify any shipment status

2. **Admin Login**

   - Should see all menu items except User Management
   - Can view all shipments
   - Can modify any shipment status

3. **Branch User Login**
   - Should see limited menu items
   - Can only view their own shipments
   - Can only modify shipment status for shipments related to their branch

## Security Considerations

1. **Role Validation**

   - All API endpoints validate user roles
   - Non-admin users cannot access admin-only endpoints

2. **Branch Restrictions**

   - Regular users can only modify shipments for their branch
   - Shipment creation is restricted based on user's branch

3. **Data Isolation**
   - Users can only see data relevant to their role
   - Proper filtering is applied at the database level

## Future Enhancements

1. **More Granular Permissions**

   - Implement permission-based access instead of role-based only
   - Allow custom permission sets for specific users

2. **Audit Logging**

   - Log all user actions for security auditing
   - Track changes to user permissions and roles

3. **Role Hierarchy**

   - Implement a more complex role hierarchy
   - Allow inheritance of permissions from parent roles

4. **Multi-Branch Support**
   - Allow users to belong to multiple branches
   - Implement branch-level permissions
