// src/controllers/projects/getProjectByIdController.js
const { Project, User, ProjectMember } = require('../../models');

/**
 * @desc Get project by ID
 * @route GET /api/projects/:id
 * @access Private
 */
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          through: {
            model: ProjectMember,
            attributes: ['role']
          }
        }
      ]
    });
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    return res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getProjectById;