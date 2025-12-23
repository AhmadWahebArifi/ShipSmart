const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function fixSuperAdminPassword() {
  try {
    console.log('Fixing Super Admin password...');
    
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
      console.log('Email: superadmin@shipsmart.com');
      console.log('Password: SuperAdmin123!');
      console.log('Role: superadmin');
    } else {
      console.log('Super Admin found. Updating password...');
      
      // Update password with proper hash
      const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);
      await user.update({ password: hashedPassword });
      
      console.log('Super Admin password updated successfully!');
      console.log('Email: superadmin@shipsmart.com');
      console.log('Password: SuperAdmin123!');
      console.log('Role: superadmin');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixSuperAdminPassword();
