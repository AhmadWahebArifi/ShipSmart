const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function fixSuperAdminPasswordAgain() {
  try {
    console.log('Fixing Super Admin password again...');

    // Find the Super Admin user
    const user = await User.findOne({ where: { email: 'superadmin@shipsmart.com' } });

    if (!user) {
      console.log('Super Admin not found. Creating new one...');

      // Create Super Admin with hashed password
      const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);

      const superAdmin = await User.create({
        username: 'superadmin',
        email: 'superadmin@shipsmart.com',
        password: hashedPassword,
        role: 'superadmin',
        name: 'Super Admin',
        address: 'Kabul, Afghanistan',
        province: 'Kabul'
      });

      console.log('Super Admin created successfully!');
    } else {
      console.log('Super Admin found. Testing current password...');
      
      // Test current password
      const currentPasswordValid = await bcrypt.compare('SuperAdmin123!', user.password);
      console.log('Current password valid:', currentPasswordValid);
      
      if (!currentPasswordValid) {
        console.log('Current password is invalid. Re-hashing...');
        
        // Generate a proper hash
        const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);
        console.log('New hash generated:', hashedPassword.substring(0, 20) + '...');
        
        // Update password with proper hash
        await user.update({ password: hashedPassword });
        
        console.log('Super Admin password updated successfully!');
        
        // Test the new password
        const newPasswordValid = await bcrypt.compare('SuperAdmin123!', user.password);
        console.log('New password validation:', newPasswordValid);
      } else {
        console.log('Current password is already valid!');
      }
    }

    // Final verification
    console.log('\nFinal verification:');
    const testUser = await User.findOne({ where: { email: 'superadmin@shipsmart.com' } });
    const finalTest = await bcrypt.compare('SuperAdmin123!', testUser.password);
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

fixSuperAdminPasswordAgain();
