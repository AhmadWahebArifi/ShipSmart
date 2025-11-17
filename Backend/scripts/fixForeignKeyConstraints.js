const { sequelize } = require("../config/database");

async function fixForeignKeyConstraints() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Check current constraints
    console.log("\n=== Current Foreign Key Constraints ===");
    let constraints = await sequelize.query(
      `
      SELECT 
        rc.CONSTRAINT_NAME,
        rc.TABLE_NAME,
        kcu.COLUMN_NAME,
        rc.REFERENCED_TABLE_NAME,
        kcu.REFERENCED_COLUMN_NAME,
        rc.UPDATE_RULE,
        rc.DELETE_RULE
      FROM
        INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
      JOIN
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
      ON
        rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE
        rc.CONSTRAINT_SCHEMA = 'shipsmart_db'
        AND rc.TABLE_NAME = 'shipments'
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    constraints.forEach((constraint) => {
      console.log(`Constraint: ${constraint.CONSTRAINT_NAME}`);
      console.log(
        `  Table: ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME}`
      );
      console.log(
        `  References: ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`
      );
      console.log(`  On Update: ${constraint.UPDATE_RULE}`);
      console.log(`  On Delete: ${constraint.DELETE_RULE}`);
      console.log("");
    });

    // Drop existing constraints and recreate with correct rules
    console.log("=== Fixing Foreign Key Constraints ===");

    // Drop existing constraints
    try {
      await sequelize.query(`
        ALTER TABLE shipments 
        DROP FOREIGN KEY shipments_ibfk_1
      `);
      console.log("✅ Dropped shipments_ibfk_1 constraint");
    } catch (error) {
      console.log(
        "ℹ️  Constraint shipments_ibfk_1 does not exist or already dropped"
      );
    }

    try {
      await sequelize.query(`
        ALTER TABLE shipments 
        DROP FOREIGN KEY shipments_ibfk_2
      `);
      console.log("✅ Dropped shipments_ibfk_2 constraint");
    } catch (error) {
      console.log(
        "ℹ️  Constraint shipments_ibfk_2 does not exist or already dropped"
      );
    }

    // Recreate constraints with correct rules
    try {
      await sequelize.query(`
        ALTER TABLE shipments 
        ADD CONSTRAINT shipments_ibfk_1 
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log("✅ Recreated shipments_ibfk_1 with CASCADE delete");
    } catch (error) {
      console.error("❌ Failed to recreate shipments_ibfk_1:", error.message);
    }

    try {
      await sequelize.query(`
        ALTER TABLE shipments 
        ADD CONSTRAINT shipments_ibfk_2 
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log("✅ Recreated shipments_ibfk_2 with SET NULL delete");
    } catch (error) {
      console.error("❌ Failed to recreate shipments_ibfk_2:", error.message);
    }

    // Verify the new constraints
    console.log("\n=== Updated Foreign Key Constraints ===");
    constraints = await sequelize.query(
      `
      SELECT 
        rc.CONSTRAINT_NAME,
        rc.TABLE_NAME,
        kcu.COLUMN_NAME,
        rc.REFERENCED_TABLE_NAME,
        kcu.REFERENCED_COLUMN_NAME,
        rc.UPDATE_RULE,
        rc.DELETE_RULE
      FROM
        INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
      JOIN
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
      ON
        rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE
        rc.CONSTRAINT_SCHEMA = 'shipsmart_db'
        AND rc.TABLE_NAME = 'shipments'
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    constraints.forEach((constraint) => {
      console.log(`Constraint: ${constraint.CONSTRAINT_NAME}`);
      console.log(
        `  Table: ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME}`
      );
      console.log(
        `  References: ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`
      );
      console.log(`  On Update: ${constraint.UPDATE_RULE}`);
      console.log(`  On Delete: ${constraint.DELETE_RULE}`);
      console.log("");
    });

    console.log("✅ Foreign key constraints fixed successfully!");
    await sequelize.close();
  } catch (error) {
    console.error("❌ Error fixing constraints:", error.message);
    if (error.parent) {
      console.error("Database error details:", error.parent.message);
    }
    await sequelize.close();
    process.exit(1);
  }
}

fixForeignKeyConstraints();
