const { sequelize } = require('../config/database');
const { User, Shipment, Notification } = require('../models');
const dotenv = require('dotenv');

dotenv.config();

// Afghanistan provinces list
const PROVINCES = [
  'Kabul', 'Herat', 'Kandahar', 'Balkh', 'Nangarhar', 'Badghis', 'Badakhshan', 
  'Baghlan', 'Bamyan', 'Daykundi', 'Farah', 'Faryab', 'Ghazni', 'Ghor', 
  'Helmand', 'Jowzjan', 'Kapisa', 'Khost', 'Kunar', 'Kunduz', 'Laghman', 
  'Logar', 'Nimruz', 'Nuristan', 'Paktia', 'Paktika', 'Panjshir', 'Parwan', 
  'Samangan', 'Sar-e Pol', 'Takhar', 'Uruzgan', 'Wardak', 'Zabul'
];

async function seedDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Drop all tables and recreate (fresh migration)
    console.log('\n🔄 Dropping all tables and recreating...');
    await sequelize.sync({ force: true });
    console.log('✅ Database tables recreated successfully');

    // Seed Admin User (in Kabul)
    console.log('\n👤 Creating admin user...');
    const admin = await User.create({
      username: 'admin',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      name: 'Admin User',
      address: 'Kabul, Afghanistan',
      province: 'Kabul'
    });
    console.log(`✅ Admin created: ${admin.username} (ID: ${admin.id})`);

    // Seed Normal Users in different provinces
    console.log('\n👥 Creating normal users in provinces...');
    const provinceUsers = [
      { username: 'herat_user', email: 'herat@test.com', name: 'Herat User', province: 'Herat' },
      { username: 'kandahar_user', email: 'kandahar@test.com', name: 'Kandahar User', province: 'Kandahar' },
      { username: 'balkh_user', email: 'balkh@test.com', name: 'Balkh User', province: 'Balkh' },
      { username: 'nangarhar_user', email: 'nangarhar@test.com', name: 'Nangarhar User', province: 'Nangarhar' },
      { username: 'kabul_user', email: 'kabul@test.com', name: 'Kabul Province User', province: 'Kabul' },
    ];

    const users = [admin];
    for (const userData of provinceUsers) {
      const user = await User.create({
        ...userData,
        password: 'user123',
        role: 'client',
        address: `${userData.province}, Afghanistan`
      });
      users.push(user);
      console.log(`✅ User created: ${user.username} (${user.province})`);
    }

    // Seed Sample Shipments
    console.log('\n📦 Creating sample shipments...');
    
    // Find users for shipments
    const heratUser = users.find(u => u.province === 'Herat');
    const kandaharUser = users.find(u => u.province === 'Kandahar');
    const balkhUser = users.find(u => u.province === 'Balkh');
    const nangarharUser = users.find(u => u.province === 'Nangarhar');
    const kabulProvinceUser = users.find(u => u.province === 'Kabul' && u.role === 'client');

    // Shipment 1: Kabul to Herat (Pending)
    const shipment1 = await Shipment.create({
      from_province: 'Kabul',
      to_province: 'Herat',
      description: 'Electronics shipment from Kabul to Herat',
      sender_id: admin.id,
      receiver_id: heratUser.id,
      status: 'pending'
    });
    console.log(`✅ Shipment created: ${shipment1.tracking_number} (${shipment1.from_province} → ${shipment1.to_province}) - ${shipment1.status}`);

    // Shipment 2: Kabul to Kandahar (In Progress)
    const shipment2 = await Shipment.create({
      from_province: 'Kabul',
      to_province: 'Kandahar',
      description: 'Food supplies from Kabul to Kandahar',
      sender_id: admin.id,
      receiver_id: kandaharUser.id,
      status: 'in_progress',
      shipped_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    });
    console.log(`✅ Shipment created: ${shipment2.tracking_number} (${shipment2.from_province} → ${shipment2.to_province}) - ${shipment2.status}`);

    // Shipment 3: Kabul to Balkh (Delivered)
    const shipment3 = await Shipment.create({
      from_province: 'Kabul',
      to_province: 'Balkh',
      description: 'Medical supplies from Kabul to Balkh',
      sender_id: admin.id,
      receiver_id: balkhUser.id,
      status: 'delivered',
      shipped_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      delivered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    });
    console.log(`✅ Shipment created: ${shipment3.tracking_number} (${shipment3.from_province} → ${shipment3.to_province}) - ${shipment3.status}`);

    // Shipment 4: Herat to Nangarhar (Pending)
    const shipment4 = await Shipment.create({
      from_province: 'Herat',
      to_province: 'Nangarhar',
      description: 'Textiles from Herat to Nangarhar',
      sender_id: heratUser.id,
      receiver_id: nangarharUser.id,
      status: 'pending'
    });
    console.log(`✅ Shipment created: ${shipment4.tracking_number} (${shipment4.from_province} → ${shipment4.to_province}) - ${shipment4.status}`);

    // Shipment 5: Kabul Province User to Herat (In Progress)
    if (kabulProvinceUser) {
      const shipment5 = await Shipment.create({
        from_province: 'Kabul',
        to_province: 'Herat',
        description: 'Local goods from Kabul province to Herat',
        sender_id: kabulProvinceUser.id,
        receiver_id: heratUser.id,
        status: 'in_progress',
        shipped_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      });
      console.log(`✅ Shipment created: ${shipment5.tracking_number} (${shipment5.from_province} → ${shipment5.to_province}) - ${shipment5.status}`);
    }

    // Seed Notifications
    console.log('\n🔔 Creating sample notifications...');
    
    // Notification for Herat user about pending shipment
    await Notification.create({
      user_id: heratUser.id,
      shipment_id: shipment1.id,
      title: 'New Shipment Arriving',
      message: `A shipment from Kabul to Herat is on its way. Status: Pending`,
      type: 'shipment_created',
      is_read: false
    });
    console.log(`✅ Notification created for Herat user (shipment pending)`);

    // Notification for Kandahar user about in-progress shipment
    await Notification.create({
      user_id: kandaharUser.id,
      shipment_id: shipment2.id,
      title: 'Shipment In Progress',
      message: `Your shipment from Kabul to Kandahar is currently in transit.`,
      type: 'shipment_in_progress',
      is_read: false
    });
    console.log(`✅ Notification created for Kandahar user (shipment in progress)`);

    // Notification for admin about delivered shipment
    await Notification.create({
      user_id: admin.id,
      shipment_id: shipment3.id,
      title: 'Shipment Delivered',
      message: `Your shipment ${shipment3.tracking_number} from Kabul to Balkh has been delivered.`,
      type: 'shipment_delivered',
      is_read: true
    });
    console.log(`✅ Notification created for admin (shipment delivered)`);

    // Notification for Nangarhar user about pending shipment
    await Notification.create({
      user_id: nangarharUser.id,
      shipment_id: shipment4.id,
      title: 'New Shipment Arriving',
      message: `A shipment from Herat to Nangarhar is on its way. Status: Pending`,
      type: 'shipment_created',
      is_read: false
    });
    console.log(`✅ Notification created for Nangarhar user (shipment pending)`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DATABASE SEED SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Users created: ${users.length}`);
    console.log(`   - Admin: 1 (Kabul)`);
    console.log(`   - Normal users: ${users.length - 1}`);
    console.log(`✅ Shipments created: 5`);
    console.log(`   - Pending: 2`);
    console.log(`   - In Progress: 2`);
    console.log(`   - Delivered: 1`);
    console.log(`✅ Notifications created: 4`);
    console.log('\n📝 Login Credentials:');
    console.log('   Admin:');
    console.log('   - Email: admin@test.com');
    console.log('   - Password: admin123');
    console.log('\n   Normal Users:');
    provinceUsers.forEach(u => {
      console.log(`   - ${u.username}: ${u.email} / user123 (${u.province})`);
    });
    console.log('='.repeat(60));

    await sequelize.close();
    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('\n💡 Tip: Make sure MySQL is running and your database credentials are correct in .env file.');
    } else if (error.name === 'SequelizeValidationError') {
      console.log('\n💡 Tip: Validation error - check the data being inserted.');
    }
    
    await sequelize.close();
    process.exit(1);
  }
}

// Run seed
seedDatabase();

