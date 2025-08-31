// src/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../utils/authUtils');

const addNewProject = require('../controllers/projects/addNewProjectController');
const deleteProject = require('../controllers/projects/deleteProjectController');
const getAllProjects = require('../controllers/projects/getAllProjectsController');
const getProjectById = require('../controllers/projects/getProjectByIdController');

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
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
 *               - userId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               estimatedEndDate:
 *                 type: string
 *                 format: date
 *               userId:
 *                 type: integer
 *               imageUrl:
 *                 type: string
 *               currentStageId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authenticateToken,
  [
    body('name').not().isEmpty().withMessage('Project name is required'),
    body('userId').isInt().withMessage('Valid user ID is required')
  ],
  addNewProject
);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all projects
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, getAllProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, getProjectById);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, deleteProject);

module.exports = router;