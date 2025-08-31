// src/models/index.js
const sequelize = require('../config/database');
const User = require('./User');
const Otp = require('./Otp');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Stage = require('./Stage');
const ProjectTimeline = require('./ProjectTimeline');
const TimelineStage = require('./TimelineStage');
const TimelineUpdate = require('./TimelineUpdate');
const Expense = require('./Expense');
const ExpenseCategory = require('./ExpenseCategory');

// Define associations

// User and OTP associations
User.hasMany(Otp, { foreignKey: 'email', sourceKey: 'email' });
Otp.belongsTo(User, { foreignKey: 'email', targetKey: 'email' });

// Project associations
User.hasMany(Project, { foreignKey: 'user_id' });
Project.belongsTo(User, { foreignKey: 'user_id' });

// Project members associations
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'user_id' });
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'project_id' });

// ProjectMember direct associations (for accessing role and other ProjectMember fields)
ProjectMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ProjectMember.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
User.hasMany(ProjectMember, { foreignKey: 'user_id', as: 'projectMemberships' });
Project.hasMany(ProjectMember, { foreignKey: 'project_id', as: 'members' });

// Stage associations
Project.hasMany(Stage, { foreignKey: 'project_id', as: 'stages' });
Stage.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Current stage association
Project.belongsTo(Stage, { foreignKey: 'current_stage_id', as: 'currentStage' });

// ProjectTimeline associations
Project.hasOne(ProjectTimeline, { foreignKey: 'project_id', as: 'timeline' });
ProjectTimeline.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Timeline creator and updater associations
User.hasMany(ProjectTimeline, { foreignKey: 'created_by', as: 'createdTimelines' });
ProjectTimeline.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(ProjectTimeline, { foreignKey: 'last_updated_by', as: 'updatedTimelines' });
ProjectTimeline.belongsTo(User, { foreignKey: 'last_updated_by', as: 'lastUpdater' });

// TimelineStage associations
ProjectTimeline.hasMany(TimelineStage, { foreignKey: 'timeline_id', as: 'stages' });
TimelineStage.belongsTo(ProjectTimeline, { foreignKey: 'timeline_id', as: 'timeline' });

// Timeline stage assignment associations
User.hasMany(TimelineStage, { foreignKey: 'assigned_to', as: 'assignedTimelineStages' });
TimelineStage.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

// TimelineUpdate associations
ProjectTimeline.hasMany(TimelineUpdate, { foreignKey: 'timeline_id', as: 'updates' });
TimelineUpdate.belongsTo(ProjectTimeline, { foreignKey: 'timeline_id', as: 'timeline' });

TimelineStage.hasMany(TimelineUpdate, { foreignKey: 'stage_id', as: 'updates' });
TimelineUpdate.belongsTo(TimelineStage, { foreignKey: 'stage_id', as: 'stage' });

User.hasMany(TimelineUpdate, { foreignKey: 'updated_by', as: 'timelineUpdates' });
TimelineUpdate.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

// ExpenseCategory associations
ExpenseCategory.hasMany(Expense, { foreignKey: 'category_id', as: 'expenses' });
Expense.belongsTo(ExpenseCategory, { foreignKey: 'category_id', as: 'category' });

// Expense associations
Project.hasMany(Expense, { foreignKey: 'project_id', as: 'expenses' });
Expense.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

User.hasMany(Expense, { foreignKey: 'user_id', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Expense, { foreignKey: 'approved_by', as: 'approvedExpenses' });
Expense.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

module.exports = {
  sequelize,
  User,
  Otp,
  Project,
  ProjectMember,
  Stage,
  ProjectTimeline,
  TimelineStage,
  TimelineUpdate,
  Expense,
  ExpenseCategory
};