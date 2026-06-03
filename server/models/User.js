import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    googleId: {
      type: String,
      default: null,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 300,
      default: '',
    },
    favoriteGenres: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;