import { body, validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse.js';

// Common validation messages
const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please provide a valid email',
  PASSWORD_LENGTH: 'Password must be at least 8 characters',
  NAME_REQUIRED: 'Full name is required',
  PRICE_INVALID: 'Price must be a positive number',
  QUANTITY_INVALID: 'Quantity must be a non-negative integer',
  TOKEN_REQUIRED: 'Reset token is required'
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const simplifiedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: simplifiedErrors
    });
  }
  next();
};
// User registration validation
export const validateRegister = [
  body('email')
    .trim()
    .notEmpty().withMessage(VALIDATION_MESSAGES.EMAIL_REQUIRED)
    .isEmail().withMessage(VALIDATION_MESSAGES.EMAIL_INVALID)
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 }).withMessage(VALIDATION_MESSAGES.PASSWORD_LENGTH)
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),

  body('full_name')
    .trim()
    .notEmpty().withMessage(VALIDATION_MESSAGES.NAME_REQUIRED)
    .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),

  (req, res, next) => {
    handleValidationErrors(req, res, next);
  }
];

// Password change validation
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage(VALIDATION_MESSAGES.PASSWORD_LENGTH)
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  (req, res, next) => {
    handleValidationErrors(req, res, next);
  }
];

export const validateRole = [
  body('name').trim().notEmpty().withMessage('Role name is required'),
  body('description').optional().trim(),
  handleValidationErrors
];

// Password reset request validation
export const validateResetPasswordRequest = [
  body('email')
    .trim()
    .notEmpty().withMessage(VALIDATION_MESSAGES.EMAIL_REQUIRED)
    .isEmail().withMessage(VALIDATION_MESSAGES.EMAIL_INVALID)
    .normalizeEmail(),

  (req, res, next) => {
    handleValidationErrors(req, res, next);
  }
];

// Password reset validation (for actually setting new password)
export const validateResetPassword = [
  body('token')
    .notEmpty().withMessage(VALIDATION_MESSAGES.TOKEN_REQUIRED),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage(VALIDATION_MESSAGES.PASSWORD_LENGTH)
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),

  (req, res, next) => {
    handleValidationErrors(req, res, next);
  }
];

export const validateCreateUser = [
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role_id').isInt().withMessage('Valid role ID is required')
];

export const validateUpdateUser = [
  body('full_name')
    .optional()
    .trim()
    .notEmpty().withMessage(VALIDATION_MESSAGES.NAME_REQUIRED)
    .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),

  body('email')
    .optional()
    .trim()
    .notEmpty().withMessage(VALIDATION_MESSAGES.EMAIL_REQUIRED)
    .isEmail().withMessage(VALIDATION_MESSAGES.EMAIL_INVALID)
    .normalizeEmail(),

  body('role_id')
    .optional()
    .isInt().withMessage('Valid role ID is required'),

  (req, res, next) => {
    handleValidationErrors(req, res, next);
  }
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Inventory item validation
export const validateInventoryItem = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be positive'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be non-negative'),
  body('sku').optional().isString(),
  handleValidationErrors
];


export const validateInventoryUpdate = [
  body('name').optional().trim().notEmpty(),
  body('price').optional().isFloat({ gt: 0 }),
  body('quantity').optional().isInt({ min: 0 }),
  body('sku').optional().isString(),
  handleValidationErrors
];

export const validateCheckout = [
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.inventoryId').isInt().withMessage('Invalid inventory ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidationErrors
];

