// src/routes/stageRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../utils/authUtils');
const stagesController = require('../controllers/stages/stagesController');

/**
 * @swagger
 * /api/stages:
 *   get:
 *     summary: Get all stages
 *     tags: [Stages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all stages
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, stagesController.getAllStages);

/**
 * @swagger
 * /api/stages/{id}:
 *   get:
 *     summary: Get stage by ID
 *     tags: [Stages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stage ID
 *     responses:
 *       200:
 *         description: Stage details
 *       404:
 *         description: Stage not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, stagesController.getStageById);

/**
 * @swagger
 * /api/stages:
 *   post:
 *     summary: Create a new stage
 *     tags: [Stages]
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
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Stage created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authenticateToken,
  [
    body('name').not().isEmpty().withMessage('Stage name is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required')
  ],
  stagesController.addStage
);

/**
 * @swagger
 * /api/stages/{id}:
 *   put:
 *     summary: Update a stage
 *     tags: [Stages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stage ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Stage updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Stage not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  authenticateToken,
  [
    body('name').not().isEmpty().withMessage('Stage name is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required')
  ],
  stagesController.updateStage
);

/**
 * @swagger
 * /api/stages/{id}:
 *   delete:
 *     summary: Delete a stage
 *     tags: [Stages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stage ID
 *     responses:
 *       200:
 *         description: Stage deleted successfully
 *       404:
 *         description: Stage not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, stagesController.deleteStage);

module.exports = router;