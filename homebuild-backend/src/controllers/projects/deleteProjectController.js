// src/controllers/projects/deleteProjectController.js
const { Project, ProjectMember } = require('../../models');

/**
 * @desc Delete a project
 * @route DELETE /api/projects/:id
 * @access Private
 */
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Assuming authentication middleware sets req.user
    
    // Check if user is project owner
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: id,
        user_id: userId
      }
    });
    
    if (!projectMember || projectMember.role !== 'owner') {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    // Delete the project (cascading deletes should be set up in migrations)
    const deleteResult = await Project.destroy({
      where: {
        id: id
      }
    });
    
    if (deleteResult === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    return res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = deleteProject;