// src/controllers/timeline/timelineController.js
const { ProjectTimeline, TimelineStage, TimelineUpdate, Project, ProjectMember, User } = require('../../models');
const { Op, sequelize } = require('sequelize');

/**
 * @desc Get project timeline with all stages
 * @route GET /api/timeline/project/:projectId
 * @access Private
 */
exports.getProjectTimeline = async (req, res) => {
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

    const timeline = await ProjectTimeline.findOne({
      where: { 
        project_id: projectId,
        is_active: true 
      },
      include: [
        {
          model: TimelineStage,
          as: 'stages',
          include: [
            {
              model: User,
              as: 'assignedUser',
              attributes: ['id', 'name', 'email'],
              required: false
            }
          ],
          order: [['stage_order', 'ASC']]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'lastUpdater',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    if (!timeline) {
      return res.status(404).json({ error: "Timeline not found for this project" });
    }

    // Calculate overall progress based on stage progress and weights
    let totalWeightedProgress = 0;
    let totalStages = timeline.stages.length;
    
    timeline.stages.forEach(stage => {
      totalWeightedProgress += parseFloat(stage.progress_percentage || 0);
    });

    const overallProgress = totalStages > 0 ? (totalWeightedProgress / totalStages).toFixed(2) : 0;

    // Update timeline progress if it's different
    if (parseFloat(timeline.progress_percentage) !== parseFloat(overallProgress)) {
      await timeline.update({ progress_percentage: overallProgress });
    }

    // Format response
    const formattedTimeline = {
      id: timeline.id,
      project: timeline.project,
      title: timeline.title,
      description: timeline.description,
      planned_start_date: formatDate(timeline.planned_start_date),
      planned_end_date: formatDate(timeline.planned_end_date),
      actual_start_date: timeline.actual_start_date ? formatDate(timeline.actual_start_date) : null,
      actual_end_date: timeline.actual_end_date ? formatDate(timeline.actual_end_date) : null,
      status: timeline.status,
      total_duration_days: timeline.total_duration_days,
      progress_percentage: parseFloat(overallProgress),
      created_by: timeline.creator,
      last_updated_by: timeline.lastUpdater,
      notes: timeline.notes,
      created_at: timeline.created_at,
      updated_at: timeline.updated_at,
      stages: timeline.stages.map(stage => ({
        id: stage.id,
        stage_name: stage.stage_name,
        description: stage.description,
        stage_order: stage.stage_order,
        planned_start_date: formatDate(stage.planned_start_date),
        planned_end_date: formatDate(stage.planned_end_date),
        actual_start_date: stage.actual_start_date ? formatDate(stage.actual_start_date) : null,
        actual_end_date: stage.actual_end_date ? formatDate(stage.actual_end_date) : null,
        duration_days: stage.duration_days,
        status: stage.status,
        progress_percentage: parseFloat(stage.progress_percentage || 0),
        dependencies: stage.dependencies,
        assigned_to: stage.assignedUser,
        estimated_cost: stage.estimated_cost ? parseFloat(stage.estimated_cost) : null,
        actual_cost: stage.actual_cost ? parseFloat(stage.actual_cost) : null,
        materials_required: stage.materials_required,
        deliverables: stage.deliverables,
        risks: stage.risks,
        quality_checkpoints: stage.quality_checkpoints,
        weather_dependent: stage.weather_dependent,
        priority: stage.priority,
        is_milestone: stage.is_milestone,
        notes: stage.notes
      }))
    };

    return res.status(200).json(formattedTimeline);

  } catch (error) {
    console.error("Error fetching project timeline:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Create project timeline with stages
 * @route POST /api/timeline/project/:projectId
 * @access Private (Project Manager only)
 */
exports.createProjectTimeline = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      planned_start_date,
      planned_end_date,
      stages,
      notes
    } = req.body;
    const userId = req.user.id;

    // Check if user is project manager or admin
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: projectId,
        user_id: userId
      }
    });

    if (!projectMember || !['manager', 'admin', 'owner'].includes(projectMember.role)) {
      return res.status(403).json({ error: "Only project managers can create timelines" });
    }

    // Check if timeline already exists for this project
    const existingTimeline = await ProjectTimeline.findOne({
      where: { project_id: projectId }
    });

    if (existingTimeline) {
      return res.status(400).json({ error: "Timeline already exists for this project" });
    }

    // Validate required fields
    if (!title || !planned_start_date || !planned_end_date || !stages || stages.length === 0) {
      return res.status(400).json({ 
        error: "Title, start date, end date, and at least one stage are required" 
      });
    }

    // Create timeline
    const timeline = await ProjectTimeline.create({
      project_id: projectId,
      created_by: userId,
      title,
      description,
      planned_start_date,
      planned_end_date,
      notes,
      status: 'draft'
    }, { transaction });

    // Create stages
    const stagePromises = stages.map((stage, index) => {
      return TimelineStage.create({
        timeline_id: timeline.id,
        stage_name: stage.stage_name,
        description: stage.description,
        stage_order: stage.stage_order || (index + 1),
        planned_start_date: stage.planned_start_date,
        planned_end_date: stage.planned_end_date,
        assigned_to: stage.assigned_to || null,
        estimated_cost: stage.estimated_cost || null,
        materials_required: stage.materials_required || null,
        deliverables: stage.deliverables || null,
        risks: stage.risks || null,
        quality_checkpoints: stage.quality_checkpoints || null,
        weather_dependent: stage.weather_dependent || false,
        priority: stage.priority || 'medium',
        is_milestone: stage.is_milestone || false,
        dependencies: stage.dependencies || null,
        notes: stage.notes || null
      }, { transaction });
    });

    await Promise.all(stagePromises);

    await transaction.commit();

    // Create timeline update record
    await TimelineUpdate.create({
      timeline_id: timeline.id,
      updated_by: userId,
      update_type: 'general_update',
      new_value: { action: 'timeline_created' },
      update_message: 'Project timeline created',
      is_major_update: true
    });

    return res.status(201).json({
      message: "Timeline created successfully",
      timelineId: timeline.id
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error creating timeline:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Update timeline stage
 * @route PUT /api/timeline/stage/:stageId
 * @access Private (Project Manager only)
 */
exports.updateStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const {
      stage_name,
      description,
      planned_start_date,
      planned_end_date,
      actual_start_date,
      actual_end_date,
      progress_percentage,
      status,
      assigned_to,
      estimated_cost,
      actual_cost,
      materials_required,
      deliverables,
      risks,
      quality_checkpoints,
      weather_dependent,
      priority,
      notes
    } = req.body;
    const userId = req.user.id;

    // Find the stage and check permissions
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

    // Check if user has permission
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: stage.timeline.project.id,
        user_id: userId
      }
    });

    if (!projectMember || !['manager', 'admin', 'owner'].includes(projectMember.role)) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Store previous values for update history
    const previousValues = {
      status: stage.status,
      progress_percentage: stage.progress_percentage,
      actual_start_date: stage.actual_start_date,
      actual_end_date: stage.actual_end_date
    };

    // Update stage
    await stage.update({
      stage_name: stage_name || stage.stage_name,
      description: description !== undefined ? description : stage.description,
      planned_start_date: planned_start_date || stage.planned_start_date,
      planned_end_date: planned_end_date || stage.planned_end_date,
      actual_start_date: actual_start_date !== undefined ? actual_start_date : stage.actual_start_date,
      actual_end_date: actual_end_date !== undefined ? actual_end_date : stage.actual_end_date,
      progress_percentage: progress_percentage !== undefined ? progress_percentage : stage.progress_percentage,
      status: status || stage.status,
      assigned_to: assigned_to !== undefined ? assigned_to : stage.assigned_to,
      estimated_cost: estimated_cost !== undefined ? estimated_cost : stage.estimated_cost,
      actual_cost: actual_cost !== undefined ? actual_cost : stage.actual_cost,
      materials_required: materials_required !== undefined ? materials_required : stage.materials_required,
      deliverables: deliverables !== undefined ? deliverables : stage.deliverables,
      risks: risks !== undefined ? risks : stage.risks,
      quality_checkpoints: quality_checkpoints !== undefined ? quality_checkpoints : stage.quality_checkpoints,
      weather_dependent: weather_dependent !== undefined ? weather_dependent : stage.weather_dependent,
      priority: priority || stage.priority,
      notes: notes !== undefined ? notes : stage.notes
    });

    // Determine update type and create update record
    let updateType = 'general_update';
    let updateMessage = `Stage "${stage.stage_name}" updated`;
    let isMajor = false;

    if (status && status !== previousValues.status) {
      updateType = 'status_change';
      updateMessage = `Stage "${stage.stage_name}" status changed from ${previousValues.status} to ${status}`;
      isMajor = true;
    } else if (progress_percentage !== undefined && progress_percentage !== previousValues.progress_percentage) {
      updateType = 'progress_update';
      updateMessage = `Stage "${stage.stage_name}" progress updated to ${progress_percentage}%`;
      isMajor = progress_percentage == 100;
    }

    await TimelineUpdate.create({
      timeline_id: stage.timeline_id,
      stage_id: stageId,
      updated_by: userId,
      update_type: updateType,
      previous_value: previousValues,
      new_value: {
        status,
        progress_percentage,
        actual_start_date,
        actual_end_date
      },
      update_message: updateMessage,
      is_major_update: isMajor
    });

    // Update timeline last_updated_by
    await stage.timeline.update({
      last_updated_by: userId
    });

    return res.status(200).json({
      message: "Stage updated successfully"
    });

  } catch (error) {
    console.error("Error updating stage:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Get timeline updates history
 * @route GET /api/timeline/:timelineId/updates
 * @access Private
 */
exports.getTimelineUpdates = async (req, res) => {
  try {
    const { timelineId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // Check access permission
    const timeline = await ProjectTimeline.findByPk(timelineId, {
      include: [{
        model: Project,
        as: 'project'
      }]
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

    const offset = (page - 1) * limit;

    const { count, rows: updates } = await TimelineUpdate.findAndCountAll({
      where: { timeline_id: timelineId },
      include: [
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'name', 'email']
        },
        {
          model: TimelineStage,
          as: 'stage',
          attributes: ['id', 'stage_name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      updates: updates.map(update => ({
        id: update.id,
        update_type: update.update_type,
        update_message: update.update_message,
        impact_description: update.impact_description,
        is_major_update: update.is_major_update,
        stage: update.stage,
        updated_by: update.updater,
        created_at: update.created_at,
        attachments: update.attachments
      })),
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error fetching timeline updates:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Get timeline analytics
 * @route GET /api/timeline/:timelineId/analytics
 * @access Private
 */
exports.getTimelineAnalytics = async (req, res) => {
  try {
    const { timelineId } = req.params;
    const userId = req.user.id;

    // Check access permission
    const timeline = await ProjectTimeline.findByPk(timelineId, {
      include: [
        {
          model: Project,
          as: 'project'
        },
        {
          model: TimelineStage,
          as: 'stages'
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

    const stages = timeline.stages;
    const today = new Date();

    // Calculate analytics
    const totalStages = stages.length;
    const completedStages = stages.filter(s => s.status === 'completed').length;
    const inProgressStages = stages.filter(s => s.status === 'in_progress').length;
    const delayedStages = stages.filter(s => s.status === 'delayed').length;
    const notStartedStages = stages.filter(s => s.status === 'not_started').length;

    // Calculate cost analytics
    const totalEstimatedCost = stages.reduce((sum, s) => sum + parseFloat(s.estimated_cost || 0), 0);
    const totalActualCost = stages.reduce((sum, s) => sum + parseFloat(s.actual_cost || 0), 0);

    // Calculate schedule analytics
    const plannedStartDate = new Date(timeline.planned_start_date);
    const plannedEndDate = new Date(timeline.planned_end_date);
    const totalPlannedDays = Math.ceil((plannedEndDate - plannedStartDate) / (1000 * 60 * 60 * 24));
    
    let daysElapsed = 0;
    if (timeline.actual_start_date) {
      const startDate = new Date(timeline.actual_start_date);
      daysElapsed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
    }

    // Critical path analysis - stages with no buffer time
    const criticalStages = stages.filter(stage => {
      const plannedStart = new Date(stage.planned_start_date);
      const plannedEnd = new Date(stage.planned_end_date);
      return today > plannedEnd && stage.status !== 'completed';
    });

    // Upcoming milestones
    const upcomingMilestones = stages.filter(stage => {
      const plannedEnd = new Date(stage.planned_end_date);
      const daysUntilEnd = Math.ceil((plannedEnd - today) / (1000 * 60 * 60 * 24));
      return stage.is_milestone && daysUntilEnd >= 0 && daysUntilEnd <= 30 && stage.status !== 'completed';
    });

    return res.status(200).json({
      project_overview: {
        total_stages: totalStages,
        completed_stages: completedStages,
        in_progress_stages: inProgressStages,
        delayed_stages: delayedStages,
        not_started_stages: notStartedStages,
        overall_progress: parseFloat(timeline.progress_percentage || 0)
      },
      schedule_analytics: {
        planned_start_date: formatDate(timeline.planned_start_date),
        planned_end_date: formatDate(timeline.planned_end_date),
        actual_start_date: timeline.actual_start_date ? formatDate(timeline.actual_start_date) : null,
        actual_end_date: timeline.actual_end_date ? formatDate(timeline.actual_end_date) : null,
        total_planned_days: totalPlannedDays,
        days_elapsed: daysElapsed,
        days_remaining: Math.max(0, totalPlannedDays - daysElapsed),
        is_on_schedule: delayedStages === 0,
        schedule_variance_days: daysElapsed - (totalPlannedDays * (parseFloat(timeline.progress_percentage || 0) / 100))
      },
      cost_analytics: {
        total_estimated_cost: parseFloat(totalEstimatedCost.toFixed(2)),
        total_actual_cost: parseFloat(totalActualCost.toFixed(2)),
        cost_variance: parseFloat((totalActualCost - totalEstimatedCost).toFixed(2)),
        cost_variance_percentage: totalEstimatedCost > 0 ? parseFloat(((totalActualCost - totalEstimatedCost) / totalEstimatedCost * 100).toFixed(2)) : 0
      },
      critical_items: {
        critical_stages: criticalStages.map(stage => ({
          id: stage.id,
          stage_name: stage.stage_name,
          planned_end_date: formatDate(stage.planned_end_date),
          days_overdue: Math.ceil((today - new Date(stage.planned_end_date)) / (1000 * 60 * 60 * 24)),
          status: stage.status
        })),
        upcoming_milestones: upcomingMilestones.map(stage => ({
          id: stage.id,
          stage_name: stage.stage_name,
          planned_end_date: formatDate(stage.planned_end_date),
          days_until_due: Math.ceil((new Date(stage.planned_end_date) - today) / (1000 * 60 * 60 * 24)),
          progress_percentage: parseFloat(stage.progress_percentage || 0)
        }))
      },
      stage_breakdown: {
        by_status: {
          not_started: notStartedStages,
          in_progress: inProgressStages,
          completed: completedStages,
          delayed: delayedStages,
          on_hold: stages.filter(s => s.status === 'on_hold').length,
          cancelled: stages.filter(s => s.status === 'cancelled').length
        },
        by_priority: {
          critical: stages.filter(s => s.priority === 'critical').length,
          high: stages.filter(s => s.priority === 'high').length,
          medium: stages.filter(s => s.priority === 'medium').length,
          low: stages.filter(s => s.priority === 'low').length
        }
      }
    });

  } catch (error) {
    console.error("Error fetching timeline analytics:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Update timeline status
 * @route PUT /api/timeline/:timelineId/status
 * @access Private (Project Manager only)
 */
exports.updateTimelineStatus = async (req, res) => {
  try {
    const { timelineId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    if (!['draft', 'active', 'completed', 'on_hold', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const timeline = await ProjectTimeline.findByPk(timelineId, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!timeline) {
      return res.status(404).json({ error: "Timeline not found" });
    }

    // Check permissions
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: timeline.project.id,
        user_id: userId
      }
    });

    if (!projectMember || !['manager', 'admin', 'owner'].includes(projectMember.role)) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const previousStatus = timeline.status;
    
    // Update timeline
    await timeline.update({
      status,
      notes: notes || timeline.notes,
      last_updated_by: userId,
      actual_start_date: status === 'active' && !timeline.actual_start_date ? new Date() : timeline.actual_start_date,
      actual_end_date: status === 'completed' && !timeline.actual_end_date ? new Date() : timeline.actual_end_date
    });

    // Create update record
    await TimelineUpdate.create({
      timeline_id: timelineId,
      updated_by: userId,
      update_type: 'status_change',
      previous_value: { status: previousStatus },
      new_value: { status },
      update_message: `Timeline status changed from ${previousStatus} to ${status}`,
      impact_description: notes,
      is_major_update: true
    });

    return res.status(200).json({
      message: "Timeline status updated successfully"
    });

  } catch (error) {
    console.error("Error updating timeline status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Add stage to existing timeline
 * @route POST /api/timeline/:timelineId/stage
 * @access Private (Project Manager only)
 */
exports.addStageToTimeline = async (req, res) => {
  try {
    const { timelineId } = req.params;
    const {
      stage_name,
      description,
      stage_order,
      planned_start_date,
      planned_end_date,
      assigned_to,
      estimated_cost,
      materials_required,
      deliverables,
      risks,
      quality_checkpoints,
      weather_dependent,
      priority,
      is_milestone,
      dependencies,
      notes
    } = req.body;
    const userId = req.user.id;

    const timeline = await ProjectTimeline.findByPk(timelineId, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!timeline) {
      return res.status(404).json({ error: "Timeline not found" });
    }

    // Check permissions
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: timeline.project.id,
        user_id: userId
      }
    });

    if (!projectMember || !['manager', 'admin', 'owner'].includes(projectMember.role)) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Validate required fields
    if (!stage_name || !planned_start_date || !planned_end_date) {
      return res.status(400).json({ 
        error: "Stage name, start date, and end date are required" 
      });
    }

    // If stage_order not provided, get the next order number
    let nextOrder = stage_order;
    if (!nextOrder) {
      const maxOrder = await TimelineStage.max('stage_order', {
        where: { timeline_id: timelineId }
      });
      nextOrder = (maxOrder || 0) + 1;
    }

    // Create new stage
    const newStage = await TimelineStage.create({
      timeline_id: timelineId,
      stage_name,
      description,
      stage_order: nextOrder,
      planned_start_date,
      planned_end_date,
      assigned_to: assigned_to || null,
      estimated_cost: estimated_cost || null,
      materials_required: materials_required || null,
      deliverables: deliverables || null,
      risks: risks || null,
      quality_checkpoints: quality_checkpoints || null,
      weather_dependent: weather_dependent || false,
      priority: priority || 'medium',
      is_milestone: is_milestone || false,
      dependencies: dependencies || null,
      notes: notes || null
    });

    // Update timeline last_updated_by
    await timeline.update({
      last_updated_by: userId
    });

    // Create update record
    await TimelineUpdate.create({
      timeline_id: timelineId,
      stage_id: newStage.id,
      updated_by: userId,
      update_type: 'general_update',
      new_value: { action: 'stage_added', stage_name },
      update_message: `New stage "${stage_name}" added to timeline`,
      is_major_update: true
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
 * @desc Delete stage from timeline
 * @route DELETE /api/timeline/stage/:stageId
 * @access Private (Project Manager only)
 */
exports.deleteStage = async (req, res) => {
  try {
    const { stageId } = req.params;
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

    // Check permissions
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: stage.timeline.project.id,
        user_id: userId
      }
    });

    if (!projectMember || !['manager', 'admin', 'owner'].includes(projectMember.role)) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Don't allow deletion of completed stages
    if (stage.status === 'completed') {
      return res.status(400).json({ error: "Cannot delete completed stages" });
    }

    const stageName = stage.stage_name;
    const timelineId = stage.timeline_id;

    // Delete the stage
    await stage.destroy();

    // Update timeline last_updated_by
    await stage.timeline.update({
      last_updated_by: userId
    });

    // Create update record
    await TimelineUpdate.create({
      timeline_id: timelineId,
      updated_by: userId,
      update_type: 'general_update',
      new_value: { action: 'stage_deleted', stage_name: stageName },
      update_message: `Stage "${stageName}" removed from timeline`,
      is_major_update: true
    });

    return res.status(200).json({
      message: "Stage deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting stage:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc Get project timeline summary for homeowner dashboard
 * @route GET /api/timeline/project/:projectId/summary
 * @access Private (Homeowner view)
 */
exports.getTimelineSummary = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check access
    const projectMember = await ProjectMember.findOne({
      where: {
        project_id: projectId,
        user_id: userId
      }
    });

    if (!projectMember) {
      return res.status(403).json({ error: "Access denied to this project" });
    }

    const timeline = await ProjectTimeline.findOne({
      where: { 
        project_id: projectId,
        is_active: true 
      },
      include: [
        {
          model: TimelineStage,
          as: 'stages',
          where: { is_milestone: true },
          required: false,
          order: [['stage_order', 'ASC']]
        }
      ]
    });

    if (!timeline) {
      return res.status(404).json({ error: "No active timeline found for this project" });
    }

    const today = new Date();
    const plannedEnd = new Date(timeline.planned_end_date);
    const daysRemaining = Math.ceil((plannedEnd - today) / (1000 * 60 * 60 * 24));

    // Get recent major updates (last 7 days)
    const recentUpdates = await TimelineUpdate.findAll({
      where: {
        timeline_id: timeline.id,
        is_major_update: true,
        created_at: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: [
        {
          model: User,
          as: 'updater',
          attributes: ['name']
        },
        {
          model: TimelineStage,
          as: 'stage',
          attributes: ['stage_name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    return res.status(200).json({
      timeline_overview: {
        title: timeline.title,
        status: timeline.status,
        progress_percentage: parseFloat(timeline.progress_percentage || 0),
        planned_start_date: formatDate(timeline.planned_start_date),
        planned_end_date: formatDate(timeline.planned_end_date),
        actual_start_date: timeline.actual_start_date ? formatDate(timeline.actual_start_date) : null,
        days_remaining: Math.max(0, daysRemaining),
        is_on_schedule: daysRemaining >= 0 && timeline.status !== 'delayed'
      },
      milestones: timeline.stages.map(stage => ({
        id: stage.id,
        name: stage.stage_name,
        planned_date: formatDate(stage.planned_end_date),
        actual_date: stage.actual_end_date ? formatDate(stage.actual_end_date) : null,
        status: stage.status,
        progress: parseFloat(stage.progress_percentage || 0)
      })),
      recent_updates: recentUpdates.map(update => ({
        message: update.update_message,
        date: formatDate(update.created_at),
        updated_by: update.updater.name,
        stage: update.stage ? update.stage.stage_name : null
      }))
    });

  } catch (error) {
    console.error("Error fetching timeline summary:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}