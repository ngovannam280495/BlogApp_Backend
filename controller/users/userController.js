const User = require('../../model/User/User');
const bcrypt = require('bcryptjs');
const generateJWT = require('../../utils/generateJWT');
const asyncHandler = require('express-async-handler');
// !Register User
const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req?.body;

  const checkUserExists = await User.findOne({ email });
  if (checkUserExists) {
    throw new Error(`User is already registered`);
  }
  const salt = await bcrypt.genSalt(15);
  const newUser = await new User({ userName: userName, email: email, password: password });
  newUser.password = await bcrypt.hash(password, salt);
  await newUser.save();
  res.status(201).json({
    status: 'Register user successful',
    newUser,
  });
});
// !Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const userCheck = await User.findOne({ email });
  if (!userCheck) {
    throw new Error('User not found');
  }
  const checkPassword = await bcrypt.compare(password, userCheck.password);
  if (!checkPassword) throw new Error('Password mismatch');
  const newToken = await generateJWT({ email, password, id: userCheck._id });
  res.status(202).json({
    status: 'Login successful',
    userName: userCheck.userName,
    email: userCheck.email,
    role: userCheck.role,
    id: userCheck._id,
    token: newToken,
  });
});
// ! Fetch user
const fetchUser = asyncHandler(async (req, res) => {
  // * Await develop
  // const userLogin = req.userLogin;
  const idFetch = req?.params.id;

  const userFetching = await User.findById(idFetch);
  if (!userFetching) throw new Error('Could not find that user');
  res.status(200).json({
    status: 'Get User Success',
    userFetching,
  });
});
module.exports = { registerUser, loginUser, fetchUser };
