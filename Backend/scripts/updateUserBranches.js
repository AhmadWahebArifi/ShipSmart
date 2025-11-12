const { sequelize } = require("../config/database");
const { User } = require("../models");
const dotenv = require("dotenv");

dotenv.config();

async function updateUserBranches() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log("✅ Database models synchronized");

    // Update existing users with branch information
    console.log("\n🔄 Updating existing users with branch information...");

    // Update admin user
    const adminUser = await User.findOne({
      where: {
        email: "admin@test.com",
      },
    });

    if (adminUser) {
      await adminUser.update({
        role: "admin",
        branch: "Headquarters",
        name: adminUser.name || "System Administrator",
      });
      console.log("✅ Updated admin user with branch information");
    }

    // Update any existing users with role 'admin'
    const adminUsers = await User.findAll({
      where: {
        role: "admin",
      },
    });

    for (const user of adminUsers) {
      if (!user.branch) {
        await user.update({
          branch: "Headquarters",
          name: user.name || "System Administrator",
        });
        console.log(`✅ Updated user ${user.username} with branch information`);
      }
    }

    // Update any existing users with role 'driver'
    const driverUsers = await User.findAll({
      where: {
        role: "driver",
      },
    });

    for (const user of driverUsers) {
      if (!user.branch) {
        await user.update({
          branch: "Transport Department",
          name: user.name || "Driver",
        });
        console.log(
          `✅ Updated driver ${user.username} with branch information`
        );
      }
    }

    // Create sample branch users if they don't exist
    const branchUsers = [
      {
        username: "kabul_branch",
        email: "kabul@shipsmart.com",
        password: "branch123",
        role: "user",
        name: "Kabul Branch Manager",
        branch: "Kabul Branch",
        province: "Kabul",
      },
      {
        username: "herat_branch",
        email: "herat@shipsmart.com",
        password: "branch123",
        role: "user",
        name: "Herat Branch Manager",
        branch: "Herat Branch",
        province: "Herat",
      },
      {
        username: "kandahar_branch",
        email: "kandahar@shipsmart.com",
        password: "branch123",
        role: "user",
        name: "Kandahar Branch Manager",
        branch: "Kandahar Branch",
        province: "Kandahar",
      },
    ];

    for (const userData of branchUsers) {
      const existingUser = await User.findOne({
        where: {
          email: userData.email,
        },
      });

      if (!existingUser) {
        const user = await User.create(userData);
        console.log(
          `✅ Created branch user: ${user.username} (${user.branch})`
        );
      } else {
        console.log(`ℹ️  Branch user already exists: ${existingUser.username}`);
      }
    }

    console.log("\n✅ User branch information updated successfully!");
    await sequelize.close();
  } catch (error) {
    console.error("❌ Error updating user branches:", error.message);
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

updateUserBranches();
