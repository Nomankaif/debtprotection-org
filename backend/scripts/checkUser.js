const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function checkUser() {
  try {
    const mongoUri = process.env.MONGO_DB_URL || 'mongodb+srv://krishna_db_user:krishna@debtprotectionblogs.se78cvg.mongodb.net/blogs?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'admin@test.com' });
    
    if (user) {
      console.log('User found:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasPasswordHash: !!user.passwordHash,
        status: user.status
      });
      
      // Check if password matches (the expected password is "admin123")
      if (user.passwordHash) {
        const passwordMatches = await bcrypt.compare('admin123', user.passwordHash);
        console.log('Password matches:', passwordMatches);
      } else {
        console.log('No password hash found - need to set one');
        // Set password hash for admin123
        const hashedPassword = await bcrypt.hash('admin123', 12);
        await User.updateOne(
          { email: 'admin@test.com' },
          { passwordHash: hashedPassword }
        );
        console.log('Password hash set for user');
      }
    } else {
      console.log('User not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();