// src/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../utils/authUtils');
// const { validateRequest } = require('../middleware/validation');
const multer = require('multer');
const path = require('path');
const expensesController = require('../controllers/expenses/expensesController');
const expenseCategoriesController = require('../controllers/expenses/expenseCategoriesController');

// Configure multer for receipt uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/receipts/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files and PDFs
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF) and PDFs are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         amount:
 *           type: number
 *           format: decimal
 *         currency:
 *           type: string
 *         expense_date:
 *           type: string
 *           format: date
 *         vendor:
 *           type: string
 *         receipt_path:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         notes:
 *           type: string
 *     ExpenseCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         color:
 *           type: string
 *         is_active:
 *           type: boolean
 */

// Validation rules
const createExpenseValidation = [
  body('projectId')
    .isInt({ min: 1 })
    .withMessage('Valid project ID is required'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters long'),
  body('expenseDate')
    .isISO8601()
    .withMessage('Valid expense date is required'),
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid integer'),
  body('description')
    .optional()
    .trim(),
  body('vendor')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
];

const updateExpenseValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid expense ID is required'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters long'),
  body('expenseDate')
    .isISO8601()
    .withMessage('Valid expense date is required'),
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid integer'),
  body('description')
    .optional()
    .trim(),
  body('vendor')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
];

const updateStatusValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid expense ID is required'),
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved or rejected'),
  body('notes')
    .optional()
    .trim()
];

const projectExpensesValidation = [
  param('projectId')
    .isInt({ min: 1 })
    .withMessage('Valid project ID is required'),
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Status must be pending, approved, or rejected'),
  query('category')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category must be a valid integer'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name is required and must be less than 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
];

/**
 * @swagger
 * /api/expenses/project/{projectId}:
 *   get:
 *     summary: Get all expenses for a project
 *     tags: [Expenses]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by expense status
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses until this date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of expenses with pagination
 *       403:
 *         description: Access denied to project
 *       500:
 *         description: Server error
 */
router.get('/project/:projectId',
  authenticateToken,
  projectExpensesValidation,
  expensesController.getProjectExpenses
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense details
 *       404:
 *         description: Expense not found
 *       403:
 *         description: Access denied
 */
router.get('/:id',
  authenticateToken,
  param('id').isInt({ min: 1 }).withMessage('Valid expense ID is required'),
  expensesController.getExpenseById
);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - title
 *               - amount
 *               - expenseDate
 *             properties:
 *               projectId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: USD
 *               expenseDate:
 *                 type: string
 *                 format: date
 *               vendor:
 *                 type: string
 *               notes:
 *                 type: string
 *               receipt:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Access denied to project
 */
router.post('/',
  authenticateToken,
  upload.single('receipt'),
  createExpenseValidation,
  expensesController.createExpense
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - amount
 *               - expenseDate
 *             properties:
 *               categoryId:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               expenseDate:
 *                 type: string
 *                 format: date
 *               vendor:
 *                 type: string
 *               notes:
 *                 type: string
 *               receipt:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       400:
 *         description: Invalid input data or cannot update approved expenses
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Expense not found
 */
router.put('/:id',
  authenticateToken,
  upload.single('receipt'),
  updateExpenseValidation,
  expensesController.updateExpense
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Expense not found
 */
router.delete('/:id',
  authenticateToken,
  param('id').isInt({ min: 1 }).withMessage('Valid expense ID is required'),
  expensesController.deleteExpense
);

/**
 * @swagger
 * /api/expenses/{id}/status:
 *   put:
 *     summary: Approve or reject expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Expense ID
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
 *                 enum: [approved, rejected]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense status updated successfully
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Only project admins/owners can approve expenses
 *       404:
 *         description: Expense not found
 */
router.put('/:id/status',
  authenticateToken,
  updateStatusValidation,
  expensesController.updateExpenseStatus
);

/**
 * @swagger
 * /api/expenses/project/{projectId}/stats:
 *   get:
 *     summary: Get expense statistics for a project
 *     tags: [Expenses]
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
 *         description: Expense statistics
 *       403:
 *         description: Access denied to project
 */
router.get('/project/:projectId/stats',
  authenticateToken,
  param('projectId').isInt({ min: 1 }).withMessage('Valid project ID is required'),
  expensesController.getProjectExpenseStats
);

// =====================
// EXPENSE CATEGORIES ROUTES
// =====================

/**
 * @swagger
 * /api/expenses/categories:
 *   get:
 *     summary: Get all expense categories
 *     tags: [Expense Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Return only active categories
 *     responses:
 *       200:
 *         description: List of expense categories
 */
router.get('/categories',
  authenticateToken,
  query('active_only')
    .optional()
    .isBoolean()
    .withMessage('active_only must be a boolean'),
  expenseCategoriesController.getAllCategories
);

/**
 * @swagger
 * /api/expenses/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Expense Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get('/categories/:id',
  authenticateToken,
  param('id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
  expenseCategoriesController.getCategoryById
);

/**
 * @swagger
 * /api/expenses/categories:
 *   post:
 *     summary: Create new expense category (Admin only)
 *     tags: [Expense Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-F]{6}$'
 *                 default: '#007bff'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Category name already exists or invalid data
 */
router.post('/categories',
  authenticateToken,
  categoryValidation,
  expenseCategoriesController.createCategory
);

/**
 * @swagger
 * /api/expenses/categories/{id}:
 *   put:
 *     summary: Update expense category (Admin only)
 *     tags: [Expense Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-F]{6}$'
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Category name already exists or invalid data
 *       404:
 *         description: Category not found
 */
router.put('/categories/:id',
  authenticateToken,
  param('id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
  categoryValidation,
  expenseCategoriesController.updateCategory
);

/**
 * @swagger
 * /api/expenses/categories/{id}:
 *   delete:
 *     summary: Delete (deactivate) expense category (Admin only)
 *     tags: [Expense Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deactivated successfully
 *       404:
 *         description: Category not found
 */
router.delete('/categories/:id',
  authenticateToken,
  param('id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
  expenseCategoriesController.deleteCategory
);

/**
 * @swagger
 * /api/expenses/categories/with-stats:
 *   get:
 *     summary: Get categories with expense counts
 *     tags: [Expense Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories with statistics
 */
router.get('/categories/with-stats',
  authenticateToken,
  expenseCategoriesController.getCategoriesWithStats
);

module.exports = router;