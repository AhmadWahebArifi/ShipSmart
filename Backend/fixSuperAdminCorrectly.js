const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function fixSuperAdminPasswordCorrectly() {
  try {
    console.log('Fixing Super Admin password correctly...');

    // Find the Super Admin user
    const user = await User.findOne({ where: { email: 'superadmin@shipsmart.com' } });

    if (!user) {
      console.log('Super Admin not found. Creating new one...');

      // Create Super Admin with raw SQL to avoid double hashing
      const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);
      
      await User.create({
        username: 'superadmin',
        email: 'superadmin@shipsmart.com',
        password: hashedPassword, // This will be hashed again by hook, so we need to use raw
        role: 'superadmin',
        name: 'Super Admin',
        address: 'Kabul, Afghanistan',
        province: 'Kabul'
      }, { hooks: false }); // Disable hooks for creation

      console.log('Super Admin created successfully!');
    } else {
      console.log('Super Admin found. Testing current password...');
      
      // Test current password
      const currentPasswordValid = await user.checkPassword('SuperAdmin123!');
      console.log('Current password valid:', currentPasswordValid);
      
      if (!currentPasswordValid) {
        console.log('Current password is invalid. Updating with hooks disabled...');
        
        // Generate a proper hash
        const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);
        console.log('New hash generated:', hashedPassword.substring(0, 20) + '...');
        
        // Update password with hooks disabled to avoid double hashing
        await user.update({ password: hashedPassword }, { hooks: false });
        
        console.log('Super Admin password updated successfully!');
        
        // Test the new password
        const newPasswordValid = await user.checkPassword('SuperAdmin123!');
        console.log('New password validation:', newPasswordValid);
      } else {
        console.log('Current password is already valid!');
      }
    }

    // Final verification
    console.log('\nFinal verification:');
    const testUser = await User.findOne({ where: { email: 'superadmin@shipsmart.com' } });
    const finalTest = await testUser.checkPassword('SuperAdmin123!');
    console.log('Final password test:', finalTest);
    console.log('Email: superadmin@shipsmart.com');
    console.log('Password: SuperAdmin123!');
    console.log('Role: superadmin');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixSuperAdminPasswordCorrectly();
