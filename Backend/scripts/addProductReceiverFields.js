const { sequelize } = require("../config/database");
const dotenv = require("dotenv");

dotenv.config();

async function addProductReceiverFields() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    const queryInterface = sequelize.getQueryInterface();

    console.log("\n🔄 Adding receiver fields to products table...\n");

    // 1. Add receiver_name column
    try {
      await queryInterface.addColumn("products", "receiver_name", {
        type: require("sequelize").DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        comment: "Receiver's full name",
      });
      console.log('✅ Added "receiver_name" column to products table');
    } catch (error) {
      if (
        error.name === "SequelizeDatabaseError" &&
        error.message.includes("Duplicate column")
      ) {
        console.log('ℹ️  Column "receiver_name" already exists');
      } else {
        console.log(
          '⚠️  Warning adding "receiver_name" column:',
          error.message
        );
      }
    }

    // 2. Add receiver_phone column
    try {
      await queryInterface.addColumn("products", "receiver_phone", {
        type: require("sequelize").DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        comment: "Receiver's phone number",
      });
      console.log('✅ Added "receiver_phone" column to products table');
    } catch (error) {
      if (
        error.name === "SequelizeDatabaseError" &&
        error.message.includes("Duplicate column")
      ) {
        console.log('ℹ️  Column "receiver_phone" already exists');
      } else {
        console.log(
          '⚠️  Warning adding "receiver_phone" column:',
          error.message
        );
      }
    }

    // 3. Add receiver_email column
    try {
      await queryInterface.addColumn("products", "receiver_email", {
        type: require("sequelize").DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        comment: "Receiver's email address",
      });
      console.log('✅ Added "receiver_email" column to products table');
    } catch (error) {
      if (
        error.name === "SequelizeDatabaseError" &&
        error.message.includes("Duplicate column")
      ) {
        console.log('ℹ️  Column "receiver_email" already exists');
      } else {
        console.log(
          '⚠️  Warning adding "receiver_email" column:',
          error.message
        );
      }
    }

    // 4. Add receiver_address column
    try {
      await queryInterface.addColumn("products", "receiver_address", {
        type: require("sequelize").DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        comment: "Receiver's full address",
      });
      console.log('✅ Added "receiver_address" column to products table');
    } catch (error) {
      if (
        error.name === "SequelizeDatabaseError" &&
        error.message.includes("Duplicate column")
      ) {
        console.log('ℹ️  Column "receiver_address" already exists');
      } else {
        console.log(
          '⚠️  Warning adding "receiver_address" column:',
          error.message
        );
      }
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📋 Summary:");
    console.log("   - receiver_name: Receiver's full name");
    console.log("   - receiver_phone: Receiver's phone number");
    console.log("   - receiver_email: Receiver's email address");
    console.log("   - receiver_address: Receiver's full address");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
if (require.main === module) {
  addProductReceiverFields();
}

module.exports = addProductReceiverFields;
