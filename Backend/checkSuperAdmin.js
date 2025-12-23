const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function checkSuperAdmin() {
  try {
    console.log('Checking Super Admin user...');
    
    const superAdmin = await User.findOne({ 
      where: { email: 'superadmin@shipsmart.com' } 
    });
    
    if (superAdmin) {
      console.log('Super Admin found:');
      console.log('ID:', superAdmin.id);
      console.log('Username:', superAdmin.username);
      console.log('Email:', superAdmin.email);
      console.log('Role:', superAdmin.role);
      console.log('Name:', superAdmin.name);
      console.log('Password hash exists:', !!superAdmin.password);
      console.log('Password hash length:', superAdmin.password ? superAdmin.password.length : 0);
      console.log('Created at:', superAdmin.created_at);
      
      // Test password check
      const isValid = await bcrypt.compare('SuperAdmin123!', superAdmin.password);
      console.log('Password check result:', isValid);
      
      // Also test with admin password to see if there's confusion
      const adminPasswordValid = await bcrypt.compare('admin123', superAdmin.password);
      console.log('Admin password check result:', adminPasswordValid);
      
    } else {
      console.log('Super Admin user NOT found in database');
    }
    
    // Also check all users to see what we have
    console.log('\nAll users in database:');
    const allUsers = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'name']
    });
    
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Role: ${user.role}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSuperAdmin();
