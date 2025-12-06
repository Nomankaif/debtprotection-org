const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function fixPassword() {
  try {
    const mongoUri = process.env.MONGO_DB_URL || 'mongodb+srv://krishna_db_user:krishna@debtprotectionblogs.se78cvg.mongodb.net/blogs?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Hash the password "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('Generated password hash');

    // Update user with correct password hash and admin role
    const user = await User.findOneAndUpdate(
      { email: 'admin@test.com' },
      { 
        passwordHash: hashedPassword,
        role: 'admin',
        status: 'active'
      },
      { new: true }
    );

    if (user) {
      console.log(`User ${user.email} updated successfully`);
      console.log('User details:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        hasPasswordHash: !!user.passwordHash
      });
      
      // Verify password works
      const passwordMatches = await bcrypt.compare('admin123', user.passwordHash);
      console.log('Password verification:', passwordMatches);
    } else {
      console.log('User not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixPassword();