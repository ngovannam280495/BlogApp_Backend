const User = require('../../model/User/User');
const bcrypt = require('bcryptjs');
const generateJWT = require('../../utils/generateJWT');
// !Register User
const registerUser = async (req, res) => {
  const { userName, email, password } = req?.body;
  try {
    const checkUserExists = await User.findOne({ email });
    if (checkUserExists) {
      if (checkUserExists.userName === userName) {
        throw new Error(`User ${userName} already exists and Email ${email} has already been registered`);
      }
      throw new Error(`Email ${email} has already been registered`);
    }
    const salt = await bcrypt.genSalt(15);
    const newUser = await new User({ userName: userName, email: email, password: password });
    newUser.password = await bcrypt.hash(password, salt);
    newUser.save();
    res.status(201).json({
      status: 'Register user successful',
      id: newUser?._id,
      newUser,
    });
  } catch (error) {
    res.status(404).json({
      status: '404 Not Found',
      message: error.message,
    });
  }
};
// !Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
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
  } catch (error) {
    res.status(401).json({ status: '401 Unauthorized', message: error.message });
  }
};
// ! Fetch user
const fetchUser = async (req, res) => {
  // * Await develop
  // const userLogin = req.userLogin;
  const idFetch = req?.params.id;
  try {
    const userFetching = await User.findById(idFetch);
    if (!userFetching) throw new Error('Could not find that user');
    res.status(200).json({
      status: 'Get User Success',
      userFetching,
    });
  } catch (error) {
    res.status(404).json({ status: '404 Not Found', message: error.message });
  }
};
module.exports = { registerUser, loginUser, fetchUser };
