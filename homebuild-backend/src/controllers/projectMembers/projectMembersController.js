// src/controllers/projectMembers/projectMembersController.js
const { User, Project, ProjectMember } = require('../../models');

/**
 * @desc Add members to a project
 * @route POST /api/project-members/:id
 * @access Private
 */
exports.addProjectMembers = async (req, res) => {
  try {
    const { id } = req.params; // project_id
    const { userIds } = req.body;
    const userId = req.user.id; // From authentication middleware
    
    // Validate input
    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ message: 'No users specified' });
    }
    
    // Check if user has permission to add members
    const userPermission = await ProjectMember.findOne({
      where: {
        project_id: id,
        user_id: userId
      }
    });
    
    if (!userPermission || (userPermission.role !== 'owner' && userPermission.role !== 'admin')) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    // Check if project exists
    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    let addedCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    
    // Process each user ID
    for (const targetUserId of userIds) {
      try {
        // Check if user exists
        const userExists = await User.findByPk(targetUserId);
        if (!userExists) {
          errorCount++;
          continue;
        }
        
        // Check if user is already a member
        const existingMember = await ProjectMember.findOne({
          where: {
            project_id: id,
            user_id: targetUserId
          }
        });
        
        if (existingMember) {
          duplicateCount++;
          continue;
        }
        
        // Add member
        await ProjectMember.create({
          project_id: id,
          user_id: targetUserId,
          role: 'member'
        });
        
        addedCount++;
      } catch (error) {
        console.error(`Error adding member ${targetUserId}:`, error);
        errorCount++;
      }
    }
    
    return res.status(201).json({ 
      message: 'Members processed successfully',
      added: addedCount,
      errors: errorCount,
      duplicates: duplicateCount,
      total: userIds.length
    });
    
  } catch (error) {
    console.error("Error adding project members:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Get all members of a project
 * @route GET /api/project-members/:id
 * @access Private
 */
exports.getProjectMembers = async (req, res) => {
  try {
    const { id } = req.params; // project_id
    
    // Check if project exists
    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Get project members with user details
    const members = await ProjectMember.findAll({
      where: {
        project_id: id
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar']
      }],
      attributes: ['role', 'created_at'],
      order: [['created_at', 'ASC']]
    });
    
    // Format the response
    const formattedMembers = members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatar: member.user.avatar,
      role: member.role,
      joined_at: member.created_at
    }));
    
    return res.status(200).json(formattedMembers);
    
  } catch (error) {
    console.error("Error fetching project members:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Remove a member from project
 * @route DELETE /api/project-members/:id/remove/:userId
 * @access Private
 */
exports.removeProjectMember = async (req, res) => {
  try {
    const { id, userId: targetUserId } = req.params;
    const userId = req.user.id; // From authentication middleware
    
    // Check if user has permission to remove members
    const userPermission = await ProjectMember.findOne({
      where: {
        project_id: id,
        user_id: userId
      }
    });
    
    if (!userPermission || (userPermission.role !== 'owner' && userPermission.role !== 'admin')) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    // Check if target member exists
    const targetMember = await ProjectMember.findOne({
      where: {
        project_id: id,
        user_id: targetUserId
      }
    });
    
    if (!targetMember) {
      return res.status(404).json({ error: "Member not found in this project" });
    }
    
    // Prevent removing the project owner
    if (targetMember.role === 'owner') {
      return res.status(400).json({ message: "Cannot remove project owner" });
    }
    
    // Remove the member
    await targetMember.destroy();
    
    return res.status(200).json({ message: "Member removed successfully" });
    
  } catch (error) {
    console.error("Error removing project member:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Update member role
 * @route PUT /api/project-members/:id/role/:userId
 * @access Private
 */
exports.updateMemberRole = async (req, res) => {
  try {
    const { id, userId: targetUserId } = req.params;
    const { role } = req.body;
    const userId = req.user.id; // From authentication middleware
    
    // Validate role
    const validRoles = ['member', 'admin', 'owner'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be: member, admin, or owner' });
    }
    
    // Check if user has permission (only owner can change roles)
    const userPermission = await ProjectMember.findOne({
      where: {
        project_id: id,
        user_id: userId
      }
    });
    
    if (!userPermission || userPermission.role !== 'owner') {
      return res.status(403).json({ message: 'Only project owner can change member roles' });
    }
    
    // Check if target member exists
    const targetMember = await ProjectMember.findOne({
      where: {
        project_id: id,
        user_id: targetUserId
      }
    });
    
    if (!targetMember) {
      return res.status(404).json({ error: "Member not found in this project" });
    }
    
    // Update the role
    await targetMember.update({ role });
    
    return res.status(200).json({ message: "Member role updated successfully" });
    
  } catch (error) {
    console.error("Error updating member role:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};