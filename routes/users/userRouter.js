const express = require('express');
const {
  registerUser,
  loginUser,
  fetchUser,
  blockUser,
  unBlockUser,
  followUser,
  viewsProfile,
  unFollowUser,
  getViewers,
  sendMailVerify,
  verifyUser,
  sendMailResetPassword,
  resetPassword,
} = require('../../controller/users/userController');
const authUserLogin = require('../../middlewares/AuthUserLogin');
const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/profile/:id', authUserLogin, fetchUser);

userRouter.put('/block/:id', authUserLogin, blockUser);
userRouter.put('/unblock/:id', authUserLogin, unBlockUser);

userRouter.put('/updateviews/:id', authUserLogin, viewsProfile);
userRouter.get('/getviewers', authUserLogin, getViewers);
userRouter.put('/follow/:id', authUserLogin, followUser);
userRouter.put('/unfollow/:id', authUserLogin, unFollowUser);

// Verify account
userRouter.put('/send-mail-verify', authUserLogin, sendMailVerify);
userRouter.put('/verify-user/:tokenVerify', authUserLogin, verifyUser);

// Reset password
userRouter.put('/mailing-reset-password', sendMailResetPassword);
userRouter.put('/reset-password/:token', resetPassword);

module.exports = userRouter;
