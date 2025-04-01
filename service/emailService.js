import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendWelcomeEmail = async (email, tempPassword) => {
  try {
    await transporter.sendMail({
      from: `"Project X" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Welcome to Project X',
      html: `
        <h1>Your account is ready!</h1>
        <p>Use this temporary password to login: <strong>${tempPassword}</strong></p>
        <p>Please change it after your first login.</p>
      `
    });
    logger.info(`Welcome email sent to ${email}`);
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
    throw error;
  }
};