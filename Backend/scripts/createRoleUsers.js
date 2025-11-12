const { sequelize } = require("../config/database");
const { User } = require("../models");
const { Op } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

async function createRoleUsers() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log("✅ Database models synchronized");

    // Create Admin user
    const adminExists = await User.findOne({
      where: {
        [Op.or]: [{ email: "admin@shipsmart.com" }, { username: "admin" }],
      },
    });

    if (!adminExists) {
      const admin = await User.create({
        username: "admin",
        email: "admin@shipsmart.com",
        password: "admin123",
        role: "admin",
        name: "System Administrator",
        branch: "Headquarters",
      });
      console.log("✅ Admin user created successfully!");
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: admin123`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Branch: ${admin.branch}`);
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    // Create SuperAdmin user
    const superAdminExists = await User.findOne({
      where: {
        [Op.or]: [
          { email: "superadmin@shipsmart.com" },
          { username: "superadmin" },
        ],
      },
    });

    if (!superAdminExists) {
      const superAdmin = await User.create({
        username: "superadmin",
        email: "superadmin@shipsmart.com",
        password: "superadmin123",
        role: "superadmin",
        name: "Super Administrator",
        branch: "Central Office",
      });
      console.log("\n✅ SuperAdmin user created successfully!");
      console.log(`   Username: ${superAdmin.username}`);
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Password: superadmin123`);
      console.log(`   Role: ${superAdmin.role}`);
      console.log(`   Branch: ${superAdmin.branch}`);
    } else {
      console.log("ℹ️  SuperAdmin user already exists");
    }

    // Create regular User (branch user)
    const userExists = await User.findOne({
      where: {
        email: "user@shipsmart.com",
      },
    });

    if (!userExists) {
      const user = await User.create({
        username: "branchuser",
        email: "user@shipsmart.com",
        password: "user123",
        role: "user",
        name: "Branch User",
        branch: "New York Branch",
      });
      console.log("\n✅ Branch User created successfully!");
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: user123`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Branch: ${user.branch}`);
    } else {
      console.log("ℹ️  Branch User already exists");
    }

    // Create another branch user for testing
    const user2Exists = await User.findOne({
      where: {
        email: "user2@shipsmart.com",
      },
    });

    if (!user2Exists) {
      const user2 = await User.create({
        username: "branchuser2",
        email: "user2@shipsmart.com",
        password: "user123",
        role: "user",
        name: "Branch User 2",
        branch: "Los Angeles Branch",
      });
      console.log("\n✅ Second Branch User created successfully!");
      console.log(`   Username: ${user2.username}`);
      console.log(`   Email: ${user2.email}`);
      console.log(`   Password: user123`);
      console.log(`   Role: ${user2.role}`);
      console.log(`   Branch: ${user2.branch}`);
    } else {
      console.log("ℹ️  Second Branch User already exists");
    }

    await sequelize.close();
    console.log("\n✅ All users created successfully!");
  } catch (error) {
    console.error("❌ Error creating users:", error.message);
    console.error("Error name:", error.name);

    if (error.name === "SequelizeConnectionError") {
      console.log(
        "\n💡 Tip: Make sure MySQL is running and your database credentials are correct in .env file."
      );
    } else if (error.name === "SequelizeValidationError") {
      console.log(
        "\n💡 Tip: Validation error - check the data being inserted."
      );
    }

    await sequelize.close();
    process.exit(1);
  }
}

createRoleUsers();
