// src/controllers/stages/stagesController.js
const { Stage } = require('../../models');
const fs = require('fs');
const path = require('path');

/**
 * @desc Get all stages
 * @route GET /api/stages
 * @access Private
 */
exports.getAllStages = async (req, res) => {
  try {
    const stages = await Stage.findAll({
      order: [['start_date', 'ASC']]
    });
    
    // Format dates for frontend display
    const formattedStages = stages.map(stage => {
      const stageObj = stage.toJSON();
      return {
        ...stageObj,
        start_date: formatDate(stageObj.start_date),
        end_date: formatDate(stageObj.end_date)
      };
    });
    
    return res.status(200).json(formattedStages);
  } catch (error) {
    console.error("Error fetching stages:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Get single stage by ID
 * @route GET /api/stages/:id
 * @access Private
 */
exports.getStageById = async (req, res) => {
  try {
    const { id } = req.params;
    const stage = await Stage.findByPk(id);
    
    if (!stage) {
      return res.status(404).json({ error: "Stage not found" });
    }
    
    const stageObj = stage.toJSON();
    // Format dates for frontend display
    stageObj.start_date = formatDate(stageObj.start_date);
    stageObj.end_date = formatDate(stageObj.end_date);
    
    return res.status(200).json(stageObj);
  } catch (error) {
    console.error("Error fetching stage:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Add new stage
 * @route POST /api/stages
 * @access Private
 */
exports.addStage = async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    let imagePath = null;
    
    // Validate required fields
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: "Name, start date and end date are required" });
    }
    
    // Handle image upload if exists
    if (req.file) {
      imagePath = `/uploads/stages/${req.file.filename}`;
    }
    
    // Create stage with Sequelize
    const newStage = await Stage.create({
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      image_path: imagePath
    });
    
    return res.status(201).json({
      message: "Stage added successfully",
      stageId: newStage.id
    });
  } catch (error) {
    console.error("Error adding stage:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Update existing stage
 * @route PUT /api/stages/:id
 * @access Private
 */
exports.updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate } = req.body;
    
    // Validate required fields
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: "Name, start date and end date are required" });
    }
    
    // Check if stage exists
    const existingStage = await Stage.findByPk(id);
    
    if (!existingStage) {
      return res.status(404).json({ error: "Stage not found" });
    }
    
    let imagePath = existingStage.image_path;
    
    // Handle image update if a new file is uploaded
    if (req.file) {
      // Delete old image if exists
      if (imagePath && fs.existsSync(path.join(__dirname, `../../../public${imagePath}`))) {
        fs.unlinkSync(path.join(__dirname, `../../../public${imagePath}`));
      }
      imagePath = `/uploads/stages/${req.file.filename}`;
    }
    
    // Update stage with Sequelize
    await existingStage.update({
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      image_path: imagePath
    });
    
    return res.status(200).json({ message: "Stage updated successfully" });
  } catch (error) {
    console.error("Error updating stage:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Delete a stage
 * @route DELETE /api/stages/:id
 * @access Private
 */
exports.deleteStage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if stage exists
    const existingStage = await Stage.findByPk(id);
    
    if (!existingStage) {
      return res.status(404).json({ error: "Stage not found" });
    }
    
    // Delete associated image if exists
    const imagePath = existingStage.image_path;
    if (imagePath && fs.existsSync(path.join(__dirname, `../../../public${imagePath}`))) {
      fs.unlinkSync(path.join(__dirname, `../../../public${imagePath}`));
    }
    
    // Delete the stage with Sequelize
    await existingStage.destroy();
    
    return res.status(200).json({ message: "Stage deleted successfully" });
  } catch (error) {
    console.error("Error deleting stage:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}