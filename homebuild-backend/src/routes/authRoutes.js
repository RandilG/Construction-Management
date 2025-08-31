// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const userSignup = require('../controllers/auth/signupController');
const userSignin = require('../controllers/auth/signinController');
const verifyOtp = require('../controllers/auth/verifyOtpController');

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - nic
 *               - contact_number
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               nic:
 *                 type: string
 *               contact_number:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post(
  '/signup',
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('nic').not().isEmpty().withMessage('NIC is required'),
    body('contact_number').not().isEmpty().withMessage('Contact number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  userSignup
);

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Sign in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').not().isEmpty().withMessage('Password is required')
  ],
  userSignin
);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify user's email with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid OTP
 *       404:
 *         description: OTP not found
 *       408:
 *         description: OTP expired
 */
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('otp').not().isEmpty().withMessage('OTP is required')
  ],
  verifyOtp
);

module.exports = router;