import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const generateRandomPassword = (length = 16) => {
  return crypto.randomBytes(length)
    .toString('base64')
    .replace(/[+/]/g, '')
    .slice(0, length);
};

export const sanitizeUser = (user) => {
  const { password, ...userData } = user;
  return userData;
};