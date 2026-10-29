import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [emailRegex, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Exclude from find queries by default to avoid accidental leaks
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'user'
    },
    passwordChangedAt: {
      type: Date
    }
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      }
    }
  }
);

// Hash password before saving to the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Salt work factor: 10 rounds
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // If password was changed after user creation, record passwordChangedAt timestamp
  if (!this.isNew) {
    // Subtract 1000ms so token generated right after will have iat >= passwordChangedAt
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
  next();
});

// Instance method to compare plain password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Safe object representation excluding sensitive fields
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const User = mongoose.model('User', userSchema);

export default User;
