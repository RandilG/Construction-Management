// src/controllers/expenses/expenseCategoriesController.js
const { ExpenseCategory } = require('../../models');

/**
 * @desc Get all expense categories
 * @route GET /api/expense-categories
 * @access Private
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { active_only = true } = req.query;
    
    const whereClause = {};
    if (active_only === 'true') {
      whereClause.is_active = true;
    }

    const categories = await ExpenseCategory.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching expense categories:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Get category by ID
 * @route GET /api/expense-categories/:id
 * @access Private
 */
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await ExpenseCategory.findByPk(id);
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    return res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Create new expense category
 * @route POST /api/expense-categories
 * @access Private (Admin only)
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }
    
    // Check if category with same name already exists
    const existingCategory = await ExpenseCategory.findOne({
      where: { name }
    });
    
    if (existingCategory) {
      return res.status(400).json({ error: "Category with this name already exists" });
    }
    
    const newCategory = await ExpenseCategory.create({
      name,
      description,
      color: color || '#007bff'
    });
    
    return res.status(201).json({
      message: "Category created successfully",
      category: newCategory
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Update expense category
 * @route PUT /api/expense-categories/:id
 * @access Private (Admin only)
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, is_active } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }
    
    // Find existing category
    const existingCategory = await ExpenseCategory.findByPk(id);
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // Check if another category with same name exists
    if (name !== existingCategory.name) {
      const duplicateCategory = await ExpenseCategory.findOne({
        where: { name }
      });
      
      if (duplicateCategory) {
        return res.status(400).json({ error: "Category with this name already exists" });
      }
    }
    
    // Update category
    await existingCategory.update({
      name,
      description,
      color: color || existingCategory.color,
      is_active: is_active !== undefined ? is_active : existingCategory.is_active
    });
    
    return res.status(200).json({ 
      message: "Category updated successfully",
      category: existingCategory
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Delete expense category
 * @route DELETE /api/expense-categories/:id
 * @access Private (Admin only)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find existing category
    const existingCategory = await ExpenseCategory.findByPk(id);
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // Instead of hard delete, we'll soft delete by setting is_active to false
    // This preserves data integrity for existing expenses
    await existingCategory.update({ is_active: false });
    
    return res.status(200).json({ message: "Category deactivated successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Get categories with expense counts
 * @route GET /api/expense-categories/with-stats
 * @access Private
 */
exports.getCategoriesWithStats = async (req, res) => {
  try {
    const categories = await ExpenseCategory.findAll({
      include: [{
        model: 'Expense',
        as: 'expenses',
        attributes: []
      }],
      attributes: [
        'id',
        'name',
        'description',
        'color',
        'is_active',
        [sequelize.fn('COUNT', sequelize.col('expenses.id')), 'expense_count']
      ],
      group: ['ExpenseCategory.id'],
      order: [['name', 'ASC']]
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories with stats:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};