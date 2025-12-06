const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbUrl = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/blogs';
    const conn = await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;