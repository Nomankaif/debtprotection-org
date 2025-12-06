const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdmin() {
  try {
    const mongoUri = process.env.MONGO_DB_URL || 'mongodb+srv://krishna_db_user:krishna@debtprotectionblogs.se78cvg.mongodb.net/blogs?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if any admin exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log('Existing admin count:', adminCount);

    // Check if user already exists
    let user = await User.findOne({ email: 'admin@test.com' });
    
    if (user) {
      console.log('User already exists:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      });
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('testpassword123', 12);
      
      user = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        passwordHash: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      
      console.log('Admin user created successfully:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();