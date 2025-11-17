const { sequelize } = require('../config/database');
const { Shipment, User } = require('../models');

async function createTestShipments() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Get the first user (admin) to use as sender
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found in database');
      await sequelize.close();
      return;
    }

    console.log(`Using user: ${user.username} (ID: ${user.id}) as sender`);

    // Create test shipments with different statuses
    const testShipments = [
      {
        tracking_number: 'TEST001',
        from_province: 'Kabul',
        to_province: 'Herat',
        description: 'Test shipment - In Progress',
        status: 'in_progress',
        sender_id: user.id
      },
      {
        tracking_number: 'TEST002',
        from_province: 'Kandahar',
        to_province: 'Balkh',
        description: 'Test shipment - On Route',
        status: 'on_route',
        sender_id: user.id
      },
      {
        tracking_number: 'TEST003',
        from_province: 'Badakhshan',
        to_province: 'Nangarhar',
        description: 'Test shipment - Canceled',
        status: 'canceled',
        sender_id: user.id
      }
    ];

    console.log('\n=== Creating Test Shipments ===');
    for (const shipmentData of testShipments) {
      try {
        const shipment = await Shipment.create(shipmentData);
        console.log(`✅ Created shipment ${shipment.tracking_number} with status: ${shipment.status}`);
      } catch (error) {
        console.error(`❌ Failed to create shipment ${shipmentData.tracking_number}:`, error.message);
      }
    }

    // Verify all shipments and their statuses
    console.log('\n=== All Shipments After Creating Test Data ===');
    const shipments = await Shipment.findAll({
      attributes: ['id', 'tracking_number', 'status', 'from_province', 'to_province']
    });

    shipments.forEach(shipment => {
      console.log(`Shipment: ${shipment.tracking_number} - Status: ${shipment.status}`);
    });

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

createTestShipments();