const { User } = require('../models/db/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class userService {
  static createUser = async (data) => {
    try {
      const user = new User(data);
      return user.save();
    } catch (error) {
      throw error;
    }
  };
  static validatePasswordHash = (password, hash) => {
    return bcrypt.compareSync(password, hash);
  };

  static hashPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  };

  static generateToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET);
    
  };

  static verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
  };
}

module.exports = userService;
