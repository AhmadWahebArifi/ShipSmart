# Database Foreign Key Constraint Fix

## Issue Description

The MySQL error occurred because of a mismatch between the defined foreign key constraints in the database schema and the actual constraints in the database:

```
#1452 - Cannot add or update a child row: a foreign key constraint fails
(`shipsmart_db`.`shipments`, CONSTRAINT `shipments_ibfk_1` FOREIGN KEY (`sender_id`)
REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE)
```

## Root Cause

1. The database schema in `config/database.sql` defined the foreign key with `ON DELETE CASCADE`
2. However, the actual constraint in the database had `ON DELETE NO ACTION`
3. This prevented deletion of users who had associated shipments

## Solution Applied

1. **Fixed Foreign Key Constraints**: Ran a script to drop and recreate the foreign key constraints with the correct rules:

   - `shipments_ibfk_1` (sender_id): `ON DELETE CASCADE` `ON UPDATE CASCADE`
   - `shipments_ibfk_2` (receiver_id): `ON DELETE SET NULL` `ON UPDATE CASCADE`

2. **Updated Database Schema**: Modified `config/database.sql` to match the correct foreign key definitions

## Scripts Available

### 1. Diagnose Database Issues

```bash
node scripts/diagnoseDatabase.js
```

Checks for orphaned shipments and displays database structure.

### 2. Fix Foreign Key Constraints

```bash
node scripts/fixForeignKeyConstraints.js
```

Automatically fixes the foreign key constraint issues.

### 3. Safe User Deletion

```bash
node scripts/deleteUserSafely.js <user_id>
```

Safely deletes a user with confirmation and displays associated records.

## How It Works Now

- When a user is deleted, all their shipments are automatically deleted due to the CASCADE rule
- When a user is deleted, any references to them as a receiver in shipments are set to NULL due to the SET NULL rule
- This prevents the foreign key constraint violation error

## Prevention

To avoid this issue in the future:

1. Always run the database schema update scripts when deploying
2. Use the provided diagnostic scripts to check for issues
3. Never manually modify foreign key constraints in the database
