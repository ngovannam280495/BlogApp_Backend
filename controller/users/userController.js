const User = require('../../model/User/User');
const bcrypt = require('bcryptjs');
const generateJWT = require('../../utils/generateJWT');
const asyncHandler = require('express-async-handler');
const senderEmail = require('../../utils/sendMail');
const crypto = require('crypto');

// !Register User
exports.registerUser = asyncHandler(async (req, res) => {
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
exports.loginUser = asyncHandler(async (req, res) => {
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
exports.fetchUser = asyncHandler(async (req, res) => {
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

// ! Block User
exports.blockUser = asyncHandler(async (req, res) => {
  const idUserWillBlock = req?.params.id;
  const userLogin = req.userLogin;
  const idUserLogin = userLogin.id;
  const userWillBlock = await User.findById(idUserWillBlock);
  // ? Check User
  if (!userWillBlock) throw new Error('The User not found');
  //? Check
  if (idUserLogin.toString() === idUserWillBlock.toString()) throw new Error('You cannot block yourself');
  // ? Check have you blocked this user
  const checkBlockedUser = userLogin.blockedUsers.includes(idUserWillBlock);
  if (checkBlockedUser) throw new Error('You already have blocked this user');
  // Block
  userLogin.blockedUsers.push(idUserWillBlock);
  userLogin.save();
  res.json({
    status: 'success',
    message: 'Blocked User Completed',
  });
});
// ! Unblock User
exports.unBlockUser = asyncHandler(async (req, res) => {
  const idUserWillunBlock = req.params.id;
  const userWillunBlock = await User.findById(idUserWillunBlock);
  const userLogin = req.userLogin;
  const idUserLogin = userLogin.id;
  if (!userWillunBlock) throw new Error('The user not found');
  // ? Check have you blocked this user
  const checkBlockedUser = userLogin.blockedUsers.includes(idUserWillunBlock);
  if (!checkBlockedUser) throw new Error('You have not blocked this user');
  // Unblock User
  await User.findByIdAndUpdate(idUserLogin, { $pull: { blockedUsers: idUserWillunBlock } }, { new: true, upsert: true });
  res.json({
    status: 'success',
    message: 'unblocked user successfully',
  });
});

// ! View profile

exports.viewsProfile = asyncHandler(async (req, res) => {
  const userLogin = req.userLogin;
  const idUserLogin = userLogin.id;
  const idUserViewing = req?.params.id;
  const userViewing = await User.findByIdAndUpdate(idUserViewing);
  if (!userViewing) throw new Error('The user not found');
  if (idUserViewing.toString() === idUserLogin.toString()) throw new Error('You just always follow yourself');
  const newViewer = {
    userID: idUserLogin,
    timeView: Date.now(),
  };
  const userExists = userViewing.profileViewers.find((viewer) => {
    const idViewerExists = viewer.userID.toString();
    const idCheckLogin = idUserLogin.toString();
    return idCheckLogin === idViewerExists;
  });
  if (userExists) {
    userViewing.profileViewers = userViewing.profileViewers.filter((viewer) => viewer.toString() !== userExists.toString());
    await userViewing.save();
  }
  userViewing.profileViewers.push(newViewer);
  userViewing.save();
  res.json({
    status: 'success',
    message: 'You just view that user',
  });
});

// ! Get User just view your Profile
exports.getViewers = asyncHandler(async (req, res) => {
  const userLogin = req?.userLogin;
  const viewers = userLogin.profileViewers;
  res.json({
    status: 'success',
    viewersHistory: viewers,
  });
});

// ! Follow user

exports.followUser = asyncHandler(async (req, res) => {
  const userLogin = req?.userLogin;
  const idUserLogin = userLogin.id;
  const idUserFollow = req?.params.id;
  const userFollow = await User.findById(idUserFollow);
  if (!userFollow) throw new Error('User not found');
  if (idUserLogin.toString() === idUserFollow.toString()) throw new Error('You always follow yourself');
  const checkUserFollowingExist = userLogin.followings.includes(idUserFollow);
  if (checkUserFollowingExist) throw new Error('You have already followed this user');
  // Update followings
  userLogin.followings.push(idUserFollow);
  await userLogin.save();
  // Update Follower
  userFollow.followers.push(idUserLogin);
  await userFollow.save();
  res.status(201).json({
    status: 'success',
    message: 'You just follow this user',
  });
});

// ! unFollow user

exports.unFollowUser = asyncHandler(async (req, res) => {
  const userLogin = req?.userLogin;
  const idUserLogin = userLogin.id;
  const idUserUnFollow = req?.params.id;
  const userUnFollow = await User.findById(idUserUnFollow);
  if (!userUnFollow) throw new Error('User not found');
  const checkUserFollowingExist = userLogin.followings.includes(idUserUnFollow);
  if (!checkUserFollowingExist) throw new Error('You do not follow this user');
  // Update followings
  await User.findByIdAndUpdate(idUserLogin, { $pull: { followings: idUserUnFollow } }, { new: true, upsert: true });
  // Update Follower
  await User.findByIdAndUpdate(idUserUnFollow, { $pull: { followers: idUserLogin } });
  res.status(201).json({
    status: 'success',
    message: 'You just unfollow this user',
  });
});

// ! Send mail verify

exports.sendMailVerify = asyncHandler(async (req, res) => {
  // * Define token for User
  const userLogin = req?.userLogin;
  const emailUserLogin = userLogin.email;
  const token = userLogin.generateTokenVerification();
  await userLogin.save();
  // * Send email to User
  // email
  const linkVerify = `http://localhost:8000/api/v1/users/verify-user/${token.toString()}`;
  const content = `
  <h3>Dear ${userLogin.userName.toString()}</h3>
  <p>Please click or copy below link to verify your account, that link is valid for 10 minutes</p>
  <a href=${linkVerify}>${linkVerify}</a>
  `;
  const subject = 'Verify Your Email';
  await senderEmail(content, emailUserLogin, subject);
  // * Response status
  res.status(200).json({ status: 'success', message: 'Email is sending ...' });
});

// ! Verify User

exports.verifyUser = asyncHandler(async (req, res) => {
  const tokenVerifyUser = req?.params.tokenVerify;
  const verificationToken = crypto.createHash('sha256').update(tokenVerifyUser).digest('hex');
  const checkVerify = await User.findOne({
    accountVerificationToken: verificationToken,
    accountVerificationExpries: { $gt: Date.now() },
  });
  console.log(checkVerify);
  if (!checkVerify) throw new Error('Token is not valid or has expired');
  // Update:
  checkVerify.isVerified = true;
  checkVerify.accountVerificationToken = undefined;
  checkVerify.accountVerificationExpries = undefined;
  await checkVerify.save();
  res.json(`${checkVerify.userName} is verified`);
});

// ! Reset password
// Send mail to reset password
exports.sendMailResetPassword = asyncHandler(async (req, res) => {
  // * Define token for User
  const { email: emailReceiver } = req?.body;
  const userForgetPassword = await User.findOne({ email: emailReceiver });
  if (!userForgetPassword) throw new Error('User not found');
  const token = userForgetPassword.generateTokenResetPassword();
  await userForgetPassword.save();
  // * Send email to User
  const linkResetPassword = `http://localhost:8000/api/v1/users/reset-password/${token}`;
  const content = `
  <h3>Dear ${userForgetPassword.userName.toString()}</h3>
  <p>Please click or copy below link to reset password your account, that link is valid for 10 minutes</p>
  <a href=${linkResetPassword}>${linkResetPassword}</a>
  `;
  const subject = 'Reset password your account';
  const info = await senderEmail(content, emailReceiver, subject);

  // * Response status
  res.status(200).json({ status: 'success', message: 'Email reset password is sending ...' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req?.params;
  const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  const checkUser = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  console.log(checkUser);
  if (!checkUser) throw new Error('Token is not valid or expried');
  const { password, verifyPassword } = req?.body;
  if (!password || password !== verifyPassword) throw new Error('please check your input, password and verify password must be the same');
  const salt = await bcrypt.genSalt(15);
  checkUser.password = await bcrypt.hash(password, salt);
  checkUser.passwordResetExpires = undefined;
  checkUser.passwordResetToken = undefined;
  await checkUser.save();
  res.json('Resetpass wordsuccessfully');
});
