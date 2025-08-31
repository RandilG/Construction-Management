// src/routes/projectMemberRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../utils/authUtils');
const projectMembersController = require('../controllers/projectMembers/projectMembersController');

/**
 * @swagger
 * /api/project-members/{id}:
 *   get:
 *     summary: Get all members of a project
 *     tags: [Project Members]
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
 *         description: List of project members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   role:
 *                     type: string
 *                   joined_at:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, projectMembersController.getProjectMembers);

/**
 * @swagger
 * /api/project-members/{id}:
 *   post:
 *     summary: Add members to a project
 *     tags: [Project Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of user IDs to add as members
 *     responses:
 *       201:
 *         description: Members added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 added:
 *                   type: integer
 *                 errors:
 *                   type: integer
 *                 duplicates:
 *                   type: integer
 *                 total:
 *                   type: integer
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.post(
  '/:id',
  authenticateToken,
  [
    body('userIds')
      .isArray({ min: 1 })
      .withMessage('userIds must be a non-empty array')
      .custom((userIds) => {
        if (!userIds.every(id => Number.isInteger(id) && id > 0)) {
          throw new Error('All userIds must be positive integers');
        }
        return true;
      })
  ],
  projectMembersController.addProjectMembers
);

/**
 * @swagger
 * /api/project-members/{id}/remove/{userId}:
 *   delete:
 *     summary: Remove a member from project
 *     tags: [Project Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       400:
 *         description: Cannot remove project owner
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Member not found in project
 *       500:
 *         description: Server error
 */
router.delete('/:id/remove/:userId', authenticateToken, projectMembersController.removeProjectMember);

/**
 * @swagger
 * /api/project-members/{id}/role/{userId}:
 *   put:
 *     summary: Update member role in project
 *     tags: [Project Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID whose role to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [member, admin, owner]
 *                 description: New role for the member
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *       400:
 *         description: Invalid role
 *       403:
 *         description: Permission denied (only owner can change roles)
 *       404:
 *         description: Member not found in project
 *       500:
 *         description: Server error
 */
router.put(
  '/:id/role/:userId',
  authenticateToken,
  [
    body('role')
      .isIn(['member', 'admin', 'owner'])
      .withMessage('Role must be one of: member, admin, owner')
  ],
  projectMembersController.updateMemberRole
);

module.exports = router;