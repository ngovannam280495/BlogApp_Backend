const jwt = require('jsonwebtoken');
const User = require('../model/User/User');
require('dotenv').config();

const jwtPrivatekey = process.env.JWT_PRIVATE;

const authUserLogin = async (req, res, next) => {
  // Defined token for User Authentication
  const tokenLogin = req?.headers.authorization.split(' ')[1];
  try {
    const decodedToken = await jwt.verify(tokenLogin, jwtPrivatekey);
    if (!decodedToken) throw new Error('This token is expired');
    const idUserLogin = decodedToken.id;
    const userLogin = await User.findOne({ _id: idUserLogin });
    //  Defined User Login
    req.userLogin = userLogin;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'Invalid token',
      message: error.message,
    });
  }
};

module.exports = authUserLogin;
