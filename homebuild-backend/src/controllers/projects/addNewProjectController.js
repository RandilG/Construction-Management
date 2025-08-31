// src/controllers/projects/addNewProjectController.js
const { Project, ProjectMember } = require('../../models');

/**
 * @desc Create a new project
 * @route POST /api/projects
 * @access Private
 */
const addNewProject = async (req, res) => {
  try {
    console.log('Received project data:', req.body);
    const { name, description, startDate, estimatedEndDate, userId, imageUrl, currentStageId } = req.body;
    
    if (!name || !userId) {
      return res.status(400).json({ error: "Name and userId are required" });
    }
    
    // Create project with Sequelize
    const newProject = await Project.create({
      name,
      description: description || null,
      start_date: startDate || null,
      estimated_end_date: estimatedEndDate || null,
      user_id: userId,
      image_url: imageUrl || null,
      current_stage_id: currentStageId || null
    });

    // Add the creator as project owner
    await ProjectMember.create({
      project_id: newProject.id,
      user_id: userId,
      role: 'owner'
    });
    
    return res.status(201).json({
      id: newProject.id,
      message: "Project created successfully"
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = addNewProject;