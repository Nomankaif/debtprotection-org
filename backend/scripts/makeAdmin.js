const mongoose = require('mongoose');
const User = require('../models/User');

async function makeUserAdmin() {
  try {
    // Connect to MongoDB using the same connection string from the main app
    const mongoUri = process.env.MONGO_DB_URL || 'mongodb+srv://krishna_db_user:krishna@debtprotectionblogs.se78cvg.mongodb.net/blogs?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find user by email and update role to admin
    const user = await User.findOneAndUpdate(
      { email: 'admin@test.com' },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`User ${user.email} updated to admin role`);
      console.log('User details:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } else {
      console.log('User not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

makeUserAdmin();