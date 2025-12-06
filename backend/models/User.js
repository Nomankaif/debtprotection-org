const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  image: {
    type: String
  },
  emailVerified: {
    type: Date
  },
  role: {
    type: String,
    enum: ['admin', 'author', 'user'],
    default: 'user'
  },
  passwordHash: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

userSchema.pre('save', function(next) {
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.name = `${this.firstName} ${this.lastName}`.trim();
  }
  next();
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);