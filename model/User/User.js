const mongoose = require('mongoose');
const crypto = require('crypto');

// Schema

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now(),
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    accountLevel: {
      type: String,
      enum: ['bronze', 'silver', 'gold'],
      default: 'bronze',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    bio: String,
    location: String,
    notificationPreferences: {
      email: {
        type: String,
        default: true,
      },
      // *Other notifications (sms)
    },
    profileViewers: [
      {
        userID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timeView: Date,
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: Date,
    accountVerificationToken: String,
    accountVerificationExpries: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);
// ! Defined methods generate token verification
userSchema.methods.generateTokenVerification = function () {
  const token = crypto.randomBytes(16).toString('hex');
  this.accountVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.accountVerificationExpries = Date.now() + 10 * 60 * 1000; // after 10 minutes expried
  return token;
};

// ! Defined methods generate token forgot password
userSchema.methods.generateTokenResetPassword = function () {
  const token = crypto.randomBytes(16).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // after 10 minutes expried
  return token;
};

// ! Complie schema to model

const User = mongoose.model('User', userSchema);
module.exports = User;
