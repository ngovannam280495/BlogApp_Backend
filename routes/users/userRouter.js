const express = require('express');

const userRouter = express.Router();

userRouter.post('/register', async (req, res) => {
  res.json('Register Successfully');
});

module.exports = userRouter;
