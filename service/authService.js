import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
//import User from '../models/User.js';

export const generateAuthToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};