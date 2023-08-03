const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtPrivateKey = process.env.JWT_PRIVATE;

const generateJWT = async (user) => {
  const newToken = jwt.sign(user, jwtPrivateKey, {
    expiresIn: '3600000',
  });
  return newToken;
};

module.exports = generateJWT;
