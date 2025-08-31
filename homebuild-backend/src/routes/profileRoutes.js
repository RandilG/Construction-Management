const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middlewares/authMiddleware');

const getUserProfile = require('../controllers/profile/getUserProfileController');
// const updateProfile = require('../controllers/profile/updateProfileController');

/**
 * @swagger
 * /api/profile/{email}:
 *   get:
 *     summary: Get user profile by email
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email address
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 address:
 *                   type: string
 *                 profileImage:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:email', authenticateToken, getUserProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// router.put(
//   '/',
//   authenticateToken,
//   [
//     body('name').not().isEmpty().withMessage('Name is required'),
//     body('email').isEmail().withMessage('Valid email is required')
//   ],
//   // updateProfile
// );

module.exports = router;