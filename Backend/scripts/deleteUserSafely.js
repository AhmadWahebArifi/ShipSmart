const { sequelize } = require("../config/database");
const { User, Shipment, Notification } = require("../models");

async function deleteUserSafely(userId) {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      console.log(`❌ User with ID ${userId} not found`);
      await sequelize.close();
      return;
    }

    console.log(
      `Found user: ${user.username} (ID: ${user.id}, Role: ${user.role})`
    );

    // Count associated shipments
    const shipmentCount = await Shipment.count({
      where: {
        [sequelize.Op.or]: [{ sender_id: userId }, { receiver_id: userId }],
      },
    });

    if (shipmentCount > 0) {
      console.log(`ℹ️  User has ${shipmentCount} associated shipments`);

      // Count shipments where user is sender
      const senderShipmentCount = await Shipment.count({
        where: { sender_id: userId },
      });

      // Count shipments where user is receiver
      const receiverShipmentCount = await Shipment.count({
        where: { receiver_id: userId },
      });

      console.log(`  - Sent by user: ${senderShipmentCount}`);
      console.log(`  - Received by user: ${receiverShipmentCount}`);
    }

    // Count associated notifications
    const notificationCount = await Notification.count({
      where: { user_id: userId },
    });

    if (notificationCount > 0) {
      console.log(`ℹ️  User has ${notificationCount} associated notifications`);
    }

    // Confirm deletion
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `\n⚠️  Are you sure you want to delete user "${user.username}" (ID: ${userId})? This will also delete all their shipments. (yes/no): `,
      async (answer) => {
        if (answer.toLowerCase() !== "yes" && answer.toLowerCase() !== "y") {
          console.log("❌ Deletion cancelled");
          rl.close();
          await sequelize.close();
          return;
        }

        rl.close();

        try {
          // Delete user (this will cascade to shipments due to foreign key constraint)
          await user.destroy();
          console.log(`✅ User "${user.username}" deleted successfully`);
          console.log(
            `✅ All associated shipments and notifications have been deleted`
          );
        } catch (error) {
          console.error("❌ Error deleting user:", error.message);
          if (error.parent) {
            console.error("Database error details:", error.parent.message);
          }
        }

        await sequelize.close();
      }
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.parent) {
      console.error("Database error details:", error.parent.message);
    }
    await sequelize.close();
    process.exit(1);
  }
}

// Get user ID from command line arguments
const userId = process.argv[2];
if (!userId) {
  console.log("Usage: node deleteUserSafely.js <user_id>");
  console.log("Example: node deleteUserSafely.js 1");
  process.exit(1);
}

deleteUserSafely(userId);
