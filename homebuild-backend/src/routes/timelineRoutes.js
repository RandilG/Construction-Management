// src/routes/timelineRoutes.js
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../utils/authUtils');
const { validateRequest } = require('../middleware/validation');
const multer = require('multer');
const path = require('path');
const timelineController = require('../controllers/timeline/timelineController');

// Configure multer for timeline attachments (progress photos, documents)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/timeline/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and documents
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/(jpeg|jpg|png|gif)|application\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files and documents (PDF, DOC, DOCX) are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectTimeline:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         planned_start_date:
 *           type: string
 *           format: date
 *         planned_end_date:
 *           type: string
 *           format: date
 *         actual_start_date:
 *           type: string
 *           format: date
 *         actual_end_date:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [draft, active, completed, on_hold, cancelled]
 *         progress_percentage:
 *           type: number
 *           format: decimal
 *         total_duration_days:
 *           type: integer
 *     TimelineStage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         stage_name:
 *           type: string
 *         description:
 *           type: string
 *         stage_order:
 *           type: integer
 *         planned_start_date:
 *           type: string
 *           format: date
 *         planned_end_date:
 *           type: string
 *           format: date
 *         actual_start_date:
 *           type: string
 *           format: date
 *         actual_end_date:
 *           type: string
 *           format: date
 *         duration_days:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, completed, delayed, on_hold, cancelled]
 *         progress_percentage:
 *           type: number
 *           format: decimal
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         is_milestone:
 *           type: boolean
 *         weather_dependent:
 *           type: boolean
 *         estimated_cost:
 *           type: number
 *           format: decimal
 *         actual_cost:
 *           type: number
 *           format: decimal
 *     TimelineUpdate:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         update_type:
 *           type: string
 *           enum: [status_change, progress_update, date_change, cost_update, general_update, delay_reported, milestone_reached]
 *         update_message:
 *           type: string
 *         impact_description:
 *           type: string
 *         is_major_update:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 */

// Validation rules
const createTimelineValidation = [
  param('projectId')
    .isInt({ min: 1 })
    .withMessage('Valid project ID is required'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('planned_start_date')
    .isISO8601()
    .withMessage('Valid planned start date is required'),
  body('planned_end_date')
    .isISO8601()
    .withMessage('Valid planned end date is required'),
  body('stages')
    .isArray({ min: 1 })
    .withMessage('At least one stage is required'),
  body('stages.*.stage_name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Stage name is required'),
  body('stages.*.planned_start_date')
    .isISO8601()
    .withMessage('Valid stage start date is required'),
  body('stages.*.planned_end_date')
    .isISO8601()
    .withMessage('Valid stage end date is required'),
  body('notes')
    .optional()
    .trim()
];

const updateStageValidation = [
  param('stageId')
    .isInt({ min: 1 })
    .withMessage('Valid stage ID is required'),
  body('stage_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Stage name must be less than 255 characters'),
  body('planned_start_date')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('planned_end_date')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('actual_start_date')
    .optional()
    .isISO8601()
    .withMessage('Valid actual start date is required'),
  body('actual_end_date')
    .optional()
    .isISO8601()
    .withMessage('Valid actual end date is required'),
  body('progress_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  body('status')
    .optional()
    .isIn(['not_started', 'in_progress', 'completed', 'delayed', 'on_hold', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('estimated_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated cost must be positive'),
  body('actual_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual cost must be positive'),
  body('weather_dependent')
    .optional()
    .isBoolean()
    .withMessage('Weather dependent must be boolean')
];

const addStageValidation = [
  param('timelineId')
    .isInt({ min: 1 })
    .withMessage('Valid timeline ID is required'),
  body('stage_name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Stage name is required'),
  body('planned_start_date')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('planned_end_date')
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('stage_order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Stage order must be positive integer'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('estimated_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated cost must be positive'),
  body('weather_dependent')
    .optional()
    .isBoolean()
    .withMessage('Weather dependent must be boolean'),
  body('is_milestone')
    .optional()
    .isBoolean()
    .withMessage('Is milestone must be boolean')
];

const timelineStatusValidation = [
  param('timelineId')
    .isInt({ min: 1 })
    .withMessage('Valid timeline ID is required'),
  body('status')
    .isIn(['draft', 'active', 'completed', 'on_hold', 'cancelled'])
    .withMessage('Invalid timeline status'),
  body('notes')
    .optional()
    .trim()
];

/**
 * @swagger
 * /api/timeline/project/{projectId}:
 *   get:
 *     summary: Get project timeline with all stages
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project timeline with stages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 stages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TimelineStage'
 *       403:
 *         description: Access denied to project
 *       404:
 *         description: Timeline not found
 */
router.get('/project/:projectId',
  authenticateToken,
  param('projectId').isInt({ min: 1 }).withMessage('Valid project ID is required'),
  validateRequest,
  timelineController.getProjectTimeline
);

/**
 * @swagger
 * /api/timeline/project/{projectId}:
 *   post:
 *     summary: Create project timeline with stages (Project Manager only)
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *               - title
 *               - planned_start_date
 *               - planned_end_date
 *               - stages
 *             properties:
 *               title:
 *                 type: string
 *                 example: "House Construction Timeline"
 *               description:
 *                 type: string
 *               planned_start_date:
 *                 type: string
 *                 format: date
 *               planned_end_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *               stages:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - stage_name
 *                     - planned_start_date
 *                     - planned_end_date
 *                   properties:
 *                     stage_name:
 *                       type: string
 *                       example: "Foundation"
 *                     description:
 *                       type: string
 *                     stage_order:
 *                       type: integer
 *                     planned_start_date:
 *                       type: string
 *                       format: date
 *                     planned_end_date:
 *                       type: string
 *                       format: date
 *                     assigned_to:
 *                       type: integer
 *                     estimated_cost:
 *                       type: number
 *                     materials_required:
 *                       type: array
 *                       items:
 *                         type: string
 *                     deliverables:
 *                       type: array
 *                       items:
 *                         type: string
 *                     risks:
 *                       type: string
 *                     weather_dependent:
 *                       type: boolean
 *                     priority:
 *                       type: string
 *                       enum: [low, medium, high, critical]
 *                     is_milestone:
 *                       type: boolean
 *                     dependencies:
 *                       type: array
 *                       items:
 *                         type: integer
 *                     notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Timeline created successfully
 *       400:
 *         description: Timeline already exists or invalid data
 *       403:
 *         description: Only project managers can create timelines
 */
router.post('/stage/:stageId/progress',
  authenticateToken,
  upload.array('attachments', 5), // Allow up to 5 files
  [
    param('stageId').isInt({ min: 1 }).withMessage('Valid stage ID is required'),
    body('progress_percentage').isFloat({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
    body('update_message').trim().isLength({ min: 1 }).withMessage('Update message is required'),
    body('impact_description').optional().trim(),
    body('is_major_update').optional().isBoolean().withMessage('Is major update must be boolean')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { stageId } = req.params;
      const { progress_percentage, update_message, impact_description, is_major_update } = req.body;
      const userId = req.user.id;

      // Find stage and check permissions
      const stage = await TimelineStage.findByPk(stageId, {
        include: [{
          model: ProjectTimeline,
          as: 'timeline',
          include: [{
            model: Project,
            as: 'project'
          }]
        }]
      });

      if (!stage) {
        return res.status(404).json({ error: "Stage not found" });
      }

      const projectMember = await ProjectMember.findOne({
        where: {
          project_id: stage.timeline.project.id,
          user_id: userId
        }
      });

      if (!projectMember) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Process uploaded files
      const attachments = req.files ? req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/timeline/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      })) : null;

      const previousProgress = stage.progress_percentage;

      // Update stage progress
      await stage.update({
        progress_percentage,
        status: progress_percentage == 100 ? 'completed' : 
                progress_percentage > 0 ? 'in_progress' : stage.status
      });

      // Create timeline update
      await TimelineUpdate.create({
        timeline_id: stage.timeline_id,
        stage_id: stageId,
        updated_by: userId,
        update_type: 'progress_update',
        previous_value: { progress_percentage: previousProgress },
        new_value: { progress_percentage },
        update_message,
        impact_description,
        is_major_update: is_major_update || progress_percentage == 100,
        attachments
      });

      // Update timeline last_updated_by
      await stage.timeline.update({
        last_updated_by: userId
      });

      return res.status(201).json({
        message: "Progress update added successfully",
        attachments: attachments ? attachments.length : 0
      });

    } catch (error) {
      console.error("Error adding progress update:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/**
 * @swagger
 * /api/timeline/stage/{stageId}/delay:
 *   post:
 *     summary: Report delay for a stage
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stageId
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
 *               - new_planned_end_date
 *               - delay_reason
 *             properties:
 *               new_planned_end_date:
 *                 type: string
 *                 format: date
 *               delay_reason:
 *                 type: string
 *               impact_description:
 *                 type: string
 *               mitigation_plan:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delay reported successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Stage not found
 */
router.post('/stage/:stageId/delay',
  authenticateToken,
  [
    param('stageId').isInt({ min: 1 }).withMessage('Valid stage ID is required'),
    body('new_planned_end_date').isISO8601().withMessage('Valid new end date is required'),
    body('delay_reason').trim().isLength({ min: 1 }).withMessage('Delay reason is required'),
    body('impact_description').optional().trim(),
    body('mitigation_plan').optional().trim()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { stageId } = req.params;
      const { new_planned_end_date, delay_reason, impact_description, mitigation_plan } = req.body;
      const userId = req.user.id;

      const stage = await TimelineStage.findByPk(stageId, {
        include: [{
          model: ProjectTimeline,
          as: 'timeline',
          include: [{
            model: Project,
            as: 'project'
          }]
        }]
      });

      if (!stage) {
        return res.status(404).json({ error: "Stage not found" });
      }

      const projectMember = await ProjectMember.findOne({
        where: {
          project_id: stage.timeline.project.id,
          user_id: userId
        }
      });

      if (!projectMember || !['manager', 'admin', 'owner', 'contractor'].includes(projectMember.role)) {
        return res.status(403).json({ error: "Permission denied" });
      }

      const previousEndDate = stage.planned_end_date;

      // Update stage with new end date and delayed status
      await stage.update({
        planned_end_date: new_planned_end_date,
        status: 'delayed'
      });

      // Create delay update record
      await TimelineUpdate.create({
        timeline_id: stage.timeline_id,
        stage_id: stageId,
        updated_by: userId,
        update_type: 'delay_reported',
        previous_value: { planned_end_date: previousEndDate },
        new_value: { 
          planned_end_date: new_planned_end_date,
          delay_reason,
          mitigation_plan
        },
        update_message: `Stage "${stage.stage_name}" delayed - ${delay_reason}`,
        impact_description: impact_description || `New completion date: ${new_planned_end_date}`,
        is_major_update: true
      });

      // Update timeline last_updated_by
      await stage.timeline.update({
        last_updated_by: userId
      });

      return res.status(200).json({
        message: "Delay reported successfully"
      });

    } catch (error) {
      console.error("Error reporting delay:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/**
 * @swagger
 * /api/timeline/stage/{stageId}/milestone:
 *   post:
 *     summary: Mark milestone as reached
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stage ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - completion_message
 *             properties:
 *               completion_message:
 *                 type: string
 *               quality_notes:
 *                 type: string
 *               actual_completion_date:
 *                 type: string
 *                 format: date
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Completion photos or documents
 *     responses:
 *       200:
 *         description: Milestone marked as reached
 *       400:
 *         description: Stage is not a milestone or already completed
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Stage not found
 */
router.post('/stage/:stageId/milestone',
  authenticateToken,
  upload.array('attachments', 10),
  [
    param('stageId').isInt({ min: 1 }).withMessage('Valid stage ID is required'),
    body('completion_message').trim().isLength({ min: 1 }).withMessage('Completion message is required'),
    body('quality_notes').optional().trim(),
    body('actual_completion_date').optional().isISO8601().withMessage('Valid completion date required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { stageId } = req.params;
      const { completion_message, quality_notes, actual_completion_date } = req.body;
      const userId = req.user.id;

      const stage = await TimelineStage.findByPk(stageId, {
        include: [{
          model: ProjectTimeline,
          as: 'timeline',
          include: [{
            model: Project,
            as: 'project'
          }]
        }]
      });

      if (!stage) {
        return res.status(404).json({ error: "Stage not found" });
      }

      if (!stage.is_milestone) {
        return res.status(400).json({ error: "This stage is not marked as a milestone" });
      }

      if (stage.status === 'completed') {
        return res.status(400).json({ error: "Milestone already completed" });
      }

      const projectMember = await ProjectMember.findOne({
        where: {
          project_id: stage.timeline.project.id,
          user_id: userId
        }
      });

      if (!projectMember) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Process uploaded files
      const attachments = req.files ? req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/timeline/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      })) : null;

      // Update stage as completed
      await stage.update({
        status: 'completed',
        progress_percentage: 100,
        actual_end_date: actual_completion_date || new Date(),
        notes: quality_notes ? `${stage.notes || ''}\n\nCompletion Notes: ${quality_notes}` : stage.notes
      });

      // Create milestone update
      await TimelineUpdate.create({
        timeline_id: stage.timeline_id,
        stage_id: stageId,
        updated_by: userId,
        update_type: 'milestone_reached',
        previous_value: { status: stage.status, progress_percentage: stage.progress_percentage },
        new_value: { 
          status: 'completed', 
          progress_percentage: 100,
          completion_message,
          quality_notes
        },
        update_message: `Milestone "${stage.stage_name}" completed - ${completion_message}`,
        impact_description: quality_notes,
        is_major_update: true,
        attachments
      });

      // Update timeline last_updated_by
      await stage.timeline.update({
        last_updated_by: userId
      });

      return res.status(200).json({
        message: "Milestone marked as completed successfully",
        attachments: attachments ? attachments.length : 0
      });

    } catch (error) {
      console.error("Error marking milestone:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/**
 * @swagger
 * /api/timeline/{timelineId}/gantt:
 *   get:
 *     summary: Get timeline data formatted for Gantt chart
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timelineId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Timeline ID
 *     responses:
 *       200:
 *         description: Gantt chart data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timeline_info:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     start_date:
 *                       type: string
 *                       format: date
 *                     end_date:
 *                       type: string
 *                       format: date
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       start:
 *                         type: string
 *                         format: date
 *                       end:
 *                         type: string
 *                         format: date
 *                       progress:
 *                         type: number
 *                       dependencies:
 *                         type: string
 *                       type:
 *                         type: string
 *                       styles:
 *                         type: object
 *       403:
 *         description: Access denied
 *       404:
 *         description: Timeline not found
 */
router.get('/:timelineId/gantt',
  authenticateToken,
  param('timelineId').isInt({ min: 1 }).withMessage('Valid timeline ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      const { timelineId } = req.params;
      const userId = req.user.id;

      const timeline = await ProjectTimeline.findByPk(timelineId, {
        include: [
          {
            model: Project,
            as: 'project'
          },
          {
            model: TimelineStage,
            as: 'stages',
            include: [{
              model: User,
              as: 'assignedUser',
              attributes: ['name'],
              required: false
            }],
            order: [['stage_order', 'ASC']]
          }
        ]
      });

      if (!timeline) {
        return res.status(404).json({ error: "Timeline not found" });
      }

      const projectMember = await ProjectMember.findOne({
        where: {
          project_id: timeline.project.id,
          user_id: userId
        }
      });

      if (!projectMember) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Format data for Gantt chart
      const ganttData = {
        timeline_info: {
          title: timeline.title,
          start_date: timeline.planned_start_date,
          end_date: timeline.planned_end_date,
          status: timeline.status
        },
        tasks: timeline.stages.map(stage => {
          const statusColors = {
            'not_started': '#6B7280',
            'in_progress': '#3B82F6',
            'completed': '#10B981',
            'delayed': '#EF4444',
            'on_hold': '#F59E0B',
            'cancelled': '#8B5CF6'
          };

          return {
            id: `stage-${stage.id}`,
            name: stage.stage_name,
            start: stage.actual_start_date || stage.planned_start_date,
            end: stage.actual_end_date || stage.planned_end_date,
            progress: parseFloat(stage.progress_percentage || 0),
            dependencies: stage.dependencies ? stage.dependencies.map(dep => `stage-${dep}`).join(',') : '',
            type: stage.is_milestone ? 'milestone' : 'task',
            assigned_to: stage.assignedUser ? stage.assignedUser.name : null,
            priority: stage.priority,
            weather_dependent: stage.weather_dependent,
            estimated_cost: stage.estimated_cost,
            actual_cost: stage.actual_cost,
            styles: {
              backgroundColor: statusColors[stage.status] || '#6B7280',
              progressColor: stage.status === 'completed' ? '#10B981' : '#60A5FA',
              textColor: '#FFFFFF'
            }
          };
        })
      };

      return res.status(200).json(ganttData);

    } catch (error) {
      console.error("Error fetching Gantt data:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/**
 * @swagger
 * /api/timeline/project/{projectId}/export:
 *   get:
 *     summary: Export timeline data (PDF or Excel format)
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel]
 *           default: pdf
 *         description: Export format
 *       - in: query
 *         name: include_updates
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include update history in export
 *     responses:
 *       200:
 *         description: Timeline export file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Access denied
 *       404:
 *         description: Timeline not found
 */
router.get('/project/:projectId/export',
  authenticateToken,
  [
    param('projectId').isInt({ min: 1 }).withMessage('Valid project ID is required'),
    query('format').optional().isIn(['pdf', 'excel']).withMessage('Format must be pdf or excel'),
    query('include_updates').optional().isBoolean().withMessage('Include updates must be boolean')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const { format = 'pdf', include_updates = false } = req.query;
      const userId = req.user.id;

      // Check access
      const projectMember = await ProjectMember.findOne({
        where: {
          project_id: projectId,
          user_id: userId
        }
      });

      if (!projectMember) {
        return res.status(403).json({ error: "Access denied" });
      }

      // For now, return a simple JSON export
      // In production, you would implement PDF/Excel generation
      const timeline = await ProjectTimeline.findOne({
        where: { project_id: projectId },
        include: [
          {
            model: TimelineStage,
            as: 'stages',
            order: [['stage_order', 'ASC']]
          },
          {
            model: Project,
            as: 'project',
            attributes: ['name', 'description']
          }
        ]
      });

      if (!timeline) {
        return res.status(404).json({ error: "Timeline not found" });
      }

      const exportData = {
        project: timeline.project,
        timeline: {
          title: timeline.title,
          description: timeline.description,
          planned_start_date: timeline.planned_start_date,
          planned_end_date: timeline.planned_end_date,
          status: timeline.status,
          progress_percentage: timeline.progress_percentage
        },
        stages: timeline.stages.map(stage => ({
          order: stage.stage_order,
          name: stage.stage_name,
          description: stage.description,
          planned_start: stage.planned_start_date,
          planned_end: stage.planned_end_date,
          actual_start: stage.actual_start_date,
          actual_end: stage.actual_end_date,
          status: stage.status,
          progress: stage.progress_percentage,
          estimated_cost: stage.estimated_cost,
          actual_cost: stage.actual_cost,
          is_milestone: stage.is_milestone,
          priority: stage.priority
        })),
        export_info: {
          format,
          exported_by: req.user.name,
          exported_at: new Date(),
          include_updates
        }
      };

      // Set appropriate headers for download
      if (format === 'excel') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="timeline-${projectId}-${Date.now()}.xlsx"`);
      } else {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="timeline-${projectId}-${Date.now()}.pdf"`);
      }

      // For now, return JSON (implement actual PDF/Excel generation as needed)
      return res.status(200).json(exportData);

    } catch (error) {
      console.error("Error exporting timeline:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/**
 * @swagger
 * /api/timeline/upcoming-deadlines:
 *   get:
 *     summary: Get upcoming deadlines across all user's projects
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days_ahead
 *         schema:
 *           type: integer
 *           default: 7
 *           minimum: 1
 *           maximum: 30
 *         description: Number of days to look ahead
 *     responses:
 *       200:
 *         description: Upcoming deadlines
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deadlines:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       stage_id:
 *                         type: integer
 *                       stage_name:
 *                         type: string
 *                       project_name:
 *                         type: string
 *                       planned_end_date:
 *                         type: string
 *                         format: date
 *                       days_until_deadline:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       progress_percentage:
 *                         type: number
 *                       priority:
 *                         type: string
 *                       is_milestone:
 *                         type: boolean
 */
router.get('/upcoming-deadlines',
  authenticateToken,
  [
    query('days_ahead').optional().isInt({ min: 1, max: 30 }).withMessage('Days ahead must be between 1 and 30')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { days_ahead = 7 } = req.query;
      const userId = req.user.id;

      // Get all projects user has access to
      const userProjects = await ProjectMember.findAll({
        where: { user_id: userId },
        attributes: ['project_id']
      });

      const projectIds = userProjects.map(pm => pm.project_id);

      if (projectIds.length === 0) {
        return res.status(200).json({ deadlines: [] });
      }

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(days_ahead));

      // Find upcoming deadlines
      const upcomingStages = await TimelineStage.findAll({
        include: [
          {
            model: ProjectTimeline,
            as: 'timeline',
            where: {
              project_id: { [Op.in]: projectIds },
              is_active: true
            },
            include: [{
              model: Project,
              as: 'project',
              attributes: ['name']
            }]
          }
        ],
        where: {
          planned_end_date: {
            [Op.between]: [new Date(), futureDate]
          },
          status: {
            [Op.in]: ['not_started', 'in_progress', 'delayed']
          }
        },
        order: [['planned_end_date', 'ASC']]
      });

      const deadlines = upcomingStages.map(stage => {
        const daysUntil = Math.ceil((new Date(stage.planned_end_date) - new Date()) / (1000 * 60 * 60 * 24));
        
        return {
          stage_id: stage.id,
          stage_name: stage.stage_name,
          project_name: stage.timeline.project.name,
          planned_end_date: stage.planned_end_date,
          days_until_deadline: daysUntil,
          status: stage.status,
          progress_percentage: parseFloat(stage.progress_percentage || 0),
          priority: stage.priority,
          is_milestone: stage.is_milestone,
          weather_dependent: stage.weather_dependent
        };
      });

      return res.status(200).json({
        deadlines,
        summary: {
          total_upcoming: deadlines.length,
          critical_priority: deadlines.filter(d => d.priority === 'critical').length,
          milestones: deadlines.filter(d => d.is_milestone).length,
          weather_dependent: deadlines.filter(d => d.weather_dependent).length
        }
      });

    } catch (error) {
      console.error("Error fetching upcoming deadlines:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;('/project/:projectId',
  authenticateToken,
  createTimelineValidation,
  validateRequest,
  timelineController.createProjectTimeline
);

/**
 * @swagger
 * /api/timeline/stage/{stageId}:
 *   put:
 *     summary: Update timeline stage (Project Manager only)
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stageId
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
 *             properties:
 *               stage_name:
 *                 type: string
 *               description:
 *                 type: string
 *               planned_start_date:
 *                 type: string
 *                 format: date
 *               planned_end_date:
 *                 type: string
 *                 format: date
 *               actual_start_date:
 *                 type: string
 *                 format: date
 *               actual_end_date:
 *                 type: string
 *                 format: date
 *               progress_percentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               status:
 *                 type: string
 *                 enum: [not_started, in_progress, completed, delayed, on_hold, cancelled]
 *               assigned_to:
 *                 type: integer
 *               estimated_cost:
 *                 type: number
 *               actual_cost:
 *                 type: number
 *               materials_required:
 *                 type: array
 *                 items:
 *                   type: string
 *               deliverables:
 *                 type: array
 *                 items:
 *                   type: string
 *               risks:
 *                 type: string
 *               quality_checkpoints:
 *                 type: array
 *                 items:
 *                   type: string
 *               weather_dependent:
 *                 type: boolean
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stage updated successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Stage not found
 */
router.put('/stage/:stageId',
  authenticateToken,
  updateStageValidation,
  validateRequest,
  timelineController.updateStage
);

/**
 * @swagger
 * /api/timeline/{timelineId}/updates:
 *   get:
 *     summary: Get timeline updates history
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timelineId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Timeline ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Timeline updates with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TimelineUpdate'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current_page:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     total_items:
 *                       type: integer
 *                     items_per_page:
 *                       type: integer
 *       403:
 *         description: Access denied
 *       404:
 *         description: Timeline not found
 */
router.get('/:timelineId/updates',
  authenticateToken,
  param('timelineId').isInt({ min: 1 }).withMessage('Valid timeline ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validateRequest,
  timelineController.getTimelineUpdates
);

/**
 * @swagger
 * /api/timeline/{timelineId}/analytics:
 *   get:
 *     summary: Get timeline analytics and insights
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timelineId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Timeline ID
 *     responses:
 *       200:
 *         description: Timeline analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project_overview:
 *                   type: object
 *                   properties:
 *                     total_stages:
 *                       type: integer
 *                     completed_stages:
 *                       type: integer
 *                     in_progress_stages:
 *                       type: integer
 *                     delayed_stages:
 *                       type: integer
 *                     overall_progress:
 *                       type: number
 *                 schedule_analytics:
 *                   type: object
 *                   properties:
 *                     planned_start_date:
 *                       type: string
 *                       format: date
 *                     planned_end_date:
 *                       type: string
 *                       format: date
 *                     days_remaining:
 *                       type: integer
 *                     is_on_schedule:
 *                       type: boolean
 *                 cost_analytics:
 *                   type: object
 *                   properties:
 *                     total_estimated_cost:
 *                       type: number
 *                     total_actual_cost:
 *                       type: number
 *                     cost_variance:
 *                       type: number
 *                 critical_items:
 *                   type: object
 *                   properties:
 *                     critical_stages:
 *                       type: array
 *                       items:
 *                         type: object
 *                     upcoming_milestones:
 *                       type: array
 *                       items:
 *                         type: object
 *       403:
 *         description: Access denied
 *       404:
 *         description: Timeline not found
 */
router.get('/:timelineId/analytics',
  authenticateToken,
  param('timelineId').isInt({ min: 1 }).withMessage('Valid timeline ID is required'),
  validateRequest,
  timelineController.getTimelineAnalytics
);

/**
 * @swagger
 * /api/timeline/{timelineId}/status:
 *   put:
 *     summary: Update timeline status (Project Manager only)
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timelineId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Timeline ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, active, completed, on_hold, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Timeline status updated successfully
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Timeline not found
 */
router.put('/:timelineId/status',
  authenticateToken,
  timelineStatusValidation,
  validateRequest,
  timelineController.updateTimelineStatus
);

/**
 * @swagger
 * /api/timeline/{timelineId}/stage:
 *   post:
 *     summary: Add new stage to existing timeline (Project Manager only)
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timelineId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Timeline ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stage_name
 *               - planned_start_date
 *               - planned_end_date
 *             properties:
 *               stage_name:
 *                 type: string
 *                 example: "Electrical Rough-in"
 *               description:
 *                 type: string
 *               stage_order:
 *                 type: integer
 *                 description: Order position (auto-assigned if not provided)
 *               planned_start_date:
 *                 type: string
 *                 format: date
 *               planned_end_date:
 *                 type: string
 *                 format: date
 *               assigned_to:
 *                 type: integer
 *                 description: User ID of assigned team member
 *               estimated_cost:
 *                 type: number
 *                 minimum: 0
 *               materials_required:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Electrical wire", "Outlets", "Circuit breakers"]
 *               deliverables:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Wiring installation", "Electrical panel setup"]
 *               risks:
 *                 type: string
 *                 example: "Weather delays may affect outdoor electrical work"
 *               quality_checkpoints:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Electrical inspection", "Code compliance check"]
 *               weather_dependent:
 *                 type: boolean
 *                 default: false
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 default: medium
 *               is_milestone:
 *                 type: boolean
 *                 default: false
 *               dependencies:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of stage IDs that must be completed first
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Stage added successfully
 *       400:
 *         description: Invalid data provided
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Timeline not found
 */
router.post('/:timelineId/stage',
  authenticateToken,
  addStageValidation,
  validateRequest,
  timelineController.addStageToTimeline
);

/**
 * @swagger
 * /api/timeline/stage/{stageId}:
 *   delete:
 *     summary: Delete stage from timeline (Project Manager only)
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stage ID
 *     responses:
 *       200:
 *         description: Stage deleted successfully
 *       400:
 *         description: Cannot delete completed stages
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Stage not found
 */
router.delete('/stage/:stageId',
  authenticateToken,
  param('stageId').isInt({ min: 1 }).withMessage('Valid stage ID is required'),
  validateRequest,
  timelineController.deleteStage
);

/**
 * @swagger
 * /api/timeline/project/{projectId}/summary:
 *   get:
 *     summary: Get timeline summary for homeowner dashboard
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Timeline summary with milestones and recent updates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timeline_overview:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     status:
 *                       type: string
 *                     progress_percentage:
 *                       type: number
 *                     planned_start_date:
 *                       type: string
 *                       format: date
 *                     planned_end_date:
 *                       type: string
 *                       format: date
 *                     days_remaining:
 *                       type: integer
 *                     is_on_schedule:
 *                       type: boolean
 *                 milestones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       planned_date:
 *                         type: string
 *                         format: date
 *                       actual_date:
 *                         type: string
 *                         format: date
 *                       status:
 *                         type: string
 *                       progress:
 *                         type: number
 *                 recent_updates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       updated_by:
 *                         type: string
 *                       stage:
 *                         type: string
 *       403:
 *         description: Access denied
 *       404:
 *         description: Timeline not found
 */
router.get('/project/:projectId/summary',
  authenticateToken,
  param('projectId').isInt({ min: 1 }).withMessage('Valid project ID is required'),
  validateRequest,
  timelineController.getTimelineSummary
);

/**
 * @swagger
 * /api/timeline/stage/{stageId}/progress:
 *   post:
 *     summary: Add progress update with optional attachments
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stage ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - progress_percentage
 *               - update_message
 *             properties:
 *               progress_percentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               update_message:
 *                 type: string
 *               impact_description:
 *                 type: string
 *               is_major_update:
 *                 type: boolean
 *                 default: false
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Progress photos or documents
 *     responses:
 *       201:
 *         description: Progress update added successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Stage not found
 */
router.post