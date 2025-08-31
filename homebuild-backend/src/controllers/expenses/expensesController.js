// src/controllers/expenses/expensesController.js
const { Expense, ExpenseCategory, User, Project, ProjectMember } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * @desc Get all expenses for a project
 * @route GET /api/expenses/project/:projectId
 * @access Private
 */
exports.getProjectExpenses = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, category, startDate, endDate, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    // Check if user has access to the project
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: projectId,
        user_id: userId
      }
    });

    if (!projectMember) {
      return res.status(403).json({ error: "Access denied to this project" });
    }

    // Build where clause
    const whereClause = { project_id: projectId };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (category) {
      whereClause.category_id = category;
    }
    
    if (startDate && endDate) {
      whereClause.expense_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: ExpenseCategory,
          as: 'category',
          attributes: ['id', 'name', 'color']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['expense_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Format expenses for response
    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      title: expense.title,
      description: expense.description,
      amount: parseFloat(expense.amount),
      currency: expense.currency,
      expense_date: formatDate(expense.expense_date),
      vendor: expense.vendor,
      receipt_path: expense.receipt_path,
      status: expense.status,
      notes: expense.notes,
      created_by: expense.user,
      category: expense.category,
      approved_by: expense.approver,
      approved_at: expense.approved_at ? formatDate(expense.approved_at) : null,
      created_at: expense.created_at,
      updated_at: expense.updated_at
    }));

    return res.status(200).json({
      expenses: formattedExpenses,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error fetching project expenses:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Get expense by ID
 * @route GET /api/expenses/:id
 * @access Private
 */
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await Expense.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: ExpenseCategory,
          as: 'category',
          attributes: ['id', 'name', 'color']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Check if user has access to the project
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: expense.project_id,
        user_id: userId
      }
    });

    if (!projectMember) {
      return res.status(403).json({ error: "Access denied to this expense" });
    }

    const formattedExpense = {
      id: expense.id,
      title: expense.title,
      description: expense.description,
      amount: parseFloat(expense.amount),
      currency: expense.currency,
      expense_date: formatDate(expense.expense_date),
      vendor: expense.vendor,
      receipt_path: expense.receipt_path,
      status: expense.status,
      notes: expense.notes,
      project: expense.project,
      created_by: expense.user,
      category: expense.category,
      approved_by: expense.approver,
      approved_at: expense.approved_at ? formatDate(expense.approved_at) : null,
      created_at: expense.created_at,
      updated_at: expense.updated_at
    };

    return res.status(200).json(formattedExpense);

  } catch (error) {
    console.error("Error fetching expense:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Create new expense
 * @route POST /api/expenses
 * @access Private
 */
exports.createExpense = async (req, res) => {
  try {
    const {
      projectId,
      categoryId,
      title,
      description,
      amount,
      currency = 'USD',
      expenseDate,
      vendor,
      notes
    } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!projectId || !title || !amount || !expenseDate) {
      return res.status(400).json({ 
        error: "Project ID, title, amount, and expense date are required" 
      });
    }

    // Check if user has access to the project
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: projectId,
        user_id: userId
      }
    });

    if (!projectMember) {
      return res.status(403).json({ error: "Access denied to this project" });
    }

    // Validate category if provided
    if (categoryId) {
      const category = await ExpenseCategory.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ error: "Invalid category ID" });
      }
    }

    let receiptPath = null;
    
    // Handle receipt upload if exists
    if (req.file) {
      receiptPath = `/uploads/receipts/${req.file.filename}`;
    }

    // Create expense
    const newExpense = await Expense.create({
      project_id: projectId,
      user_id: userId,
      category_id: categoryId || null,
      title,
      description,
      amount,
      currency,
      expense_date: expenseDate,
      vendor,
      receipt_path: receiptPath,
      notes
    });

    return res.status(201).json({
      message: "Expense created successfully",
      expenseId: newExpense.id
    });

  } catch (error) {
    console.error("Error creating expense:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Update expense
 * @route PUT /api/expenses/:id
 * @access Private
 */
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      title,
      description,
      amount,
      currency,
      expenseDate,
      vendor,
      notes
    } = req.body;
    const userId = req.user.id;

    // Find existing expense
    const existingExpense = await Expense.findByPk(id);
    if (!existingExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Check if user has permission to update (only creator or project admin/owner)
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: existingExpense.project_id,
        user_id: userId
      }
    });

    if (!projectMember || 
        (existingExpense.user_id !== userId && 
         !['admin', 'owner'].includes(projectMember.role))) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Don't allow updates to approved expenses unless admin/owner
    if (existingExpense.status === 'approved' && 
        !['admin', 'owner'].includes(projectMember.role)) {
      return res.status(400).json({ error: "Cannot update approved expenses" });
    }

    // Validate required fields
    if (!title || !amount || !expenseDate) {
      return res.status(400).json({ 
        error: "Title, amount, and expense date are required" 
      });
    }

    let receiptPath = existingExpense.receipt_path;
    
    // Handle receipt update if new file uploaded
    if (req.file) {
      // Delete old receipt if exists
      if (receiptPath && fs.existsSync(path.join(__dirname, `../../../public${receiptPath}`))) {
        fs.unlinkSync(path.join(__dirname, `../../../public${receiptPath}`));
      }
      receiptPath = `/uploads/receipts/${req.file.filename}`;
    }

    // Update expense
    await existingExpense.update({
      category_id: categoryId || null,
      title,
      description,
      amount,
      currency: currency || existingExpense.currency,
      expense_date: expenseDate,
      vendor,
      receipt_path: receiptPath,
      notes,
      status: 'pending' // Reset to pending when updated
    });

    return res.status(200).json({ message: "Expense updated successfully" });

  } catch (error) {
    console.error("Error updating expense:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Delete expense
 * @route DELETE /api/expenses/:id
 * @access Private
 */
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find existing expense
    const existingExpense = await Expense.findByPk(id);
    if (!existingExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Check if user has permission to delete
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: existingExpense.project_id,
        user_id: userId
      }
    });

    if (!projectMember || 
        (existingExpense.user_id !== userId && 
         !['admin', 'owner'].includes(projectMember.role))) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Delete associated receipt if exists
    const receiptPath = existingExpense.receipt_path;
    if (receiptPath && fs.existsSync(path.join(__dirname, `../../../public${receiptPath}`))) {
      fs.unlinkSync(path.join(__dirname, `../../../public${receiptPath}`));
    }

    // Delete the expense
    await existingExpense.destroy();

    return res.status(200).json({ message: "Expense deleted successfully" });

  } catch (error) {
    console.error("Error deleting expense:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Approve/Reject expense
 * @route PUT /api/expenses/:id/status
 * @access Private
 */
exports.updateExpenseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    }

    // Find existing expense
    const existingExpense = await Expense.findByPk(id);
    if (!existingExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Check if user has permission to approve/reject (admin/owner only)
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: existingExpense.project_id,
        user_id: userId
      }
    });

    if (!projectMember || !['admin', 'owner'].includes(projectMember.role)) {
      return res.status(403).json({ error: "Only project admins/owners can approve expenses" });
    }

    // Update expense status
    await existingExpense.update({
      status,
      approved_by: userId,
      approved_at: new Date(),
      notes: notes || existingExpense.notes
    });

    return res.status(200).json({ 
      message: `Expense ${status} successfully` 
    });

  } catch (error) {
    console.error("Error updating expense status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Get expense statistics for a project
 * @route GET /api/expenses/project/:projectId/stats
 * @access Private
 */
exports.getProjectExpenseStats = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user has access to the project
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: projectId,
        user_id: userId
      }
    });

    if (!projectMember) {
      return res.status(403).json({ error: "Access denied to this project" });
    }

    // Get total expenses by status
    const statusStats = await Expense.findAll({
      where: { project_id: projectId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      group: ['status'],
      raw: true
    });

    // Get expenses by category
    const categoryStats = await Expense.findAll({
      where: { project_id: projectId },
      include: [{
        model: ExpenseCategory,
        as: 'category',
        attributes: ['name', 'color']
      }],
      attributes: [
        'category_id',
        [sequelize.fn('COUNT', sequelize.col('Expense.id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      group: ['category_id', 'category.name', 'category.color'],
      raw: true
    });

    return res.status(200).json({
      status_breakdown: statusStats,
      category_breakdown: categoryStats
    });

  } catch (error) {
    console.error("Error fetching expense stats:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}