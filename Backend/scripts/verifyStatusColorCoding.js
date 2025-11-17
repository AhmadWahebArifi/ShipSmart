const { sequelize } = require('../config/database');
const { Product, Shipment } = require('../models');

async function verifyStatusColorCoding() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Get all products with their shipment information
    const products = await Product.findAll({
      include: [{
        model: Shipment,
        as: 'shipment',
        attributes: ['tracking_number', 'status']
      }],
      order: [['id', 'ASC']]
    });

    console.log('\n=== Products with Shipment Statuses (for Color Coding Verification) ===');
    
    // Define the color mapping (same as in frontend)
    const colorMap = {
      'delivered': 'Green',
      'canceled': 'Red',
      'on_route': 'Blue',
      'in_progress': 'Yellow',
      'pending': 'Gray'
    };

    products.forEach((product, index) => {
      const shipmentStatus = product.shipment ? product.shipment.status : 'unknown';
      const color = colorMap[shipmentStatus] || 'Gray (default)';
      
      console.log(`${index + 1}. Product: ${product.name}`);
      console.log(`   Shipment: ${product.shipment_tracking_number}`);
      console.log(`   Status: ${shipmentStatus}`);
      console.log(`   Color: ${color}`);
      console.log('');
    });

    // Summary by status
    console.log('=== Summary by Status ===');
    const statusCounts = {};
    products.forEach(product => {
      const status = product.shipment ? product.shipment.status : 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    Object.keys(statusCounts).forEach(status => {
      const color = colorMap[status] || 'Gray (default)';
      console.log(`${status}: ${statusCounts[status]} products (${color} color)`);
    });

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

verifyStatusColorCoding();