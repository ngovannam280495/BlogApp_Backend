const express = require('express');
const { registerUser, loginUser, fetchUser } = require('../../controller/users/userController');
const authUserLogin = require('../../middlewares/AuthUserLogin');
const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/profile/:id', authUserLogin, fetchUser);
module.exports = userRouter;
