// src/controllers/projects/getAllProjectsController.js
const { Project, User } = require('../../models');

/**
 * @desc Get all projects
 * @route GET /api/projects
 * @access Private
 */
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'] // Include related user info
        }
      ]
    });
    
    return res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getAllProjects;