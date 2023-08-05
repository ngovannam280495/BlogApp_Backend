const express = require('express');
const { registerUser, loginUser, fetchUser, blockUser, unBlockUser } = require('../../controller/users/userController');
const authUserLogin = require('../../middlewares/AuthUserLogin');
const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/profile/:id', authUserLogin, fetchUser);

userRouter.put('/block/:id', authUserLogin, blockUser);
userRouter.put('/unblock/:id', authUserLogin, unBlockUser);

module.exports = userRouter;
