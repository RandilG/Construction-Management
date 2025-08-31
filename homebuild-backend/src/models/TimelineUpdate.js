// src/models/TimelineUpdate.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TimelineUpdate = sequelize.define('TimelineUpdate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  timeline_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'project_timelines',
      key: 'id'
    }
  },
  stage_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'timeline_stages',
      key: 'id'
    }
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  update_type: {
    type: DataTypes.ENUM,
    values: ['status_change', 'progress_update', 'date_change', 'cost_update', 'general_update', 'delay_reported', 'milestone_reached'],
    allowNull: false
  },
  previous_value: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Previous values before update'
  },
  new_value: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'New values after update'
  },
  update_message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  impact_description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description of how this update impacts the overall project'
  },
  is_major_update: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this update should be highlighted to homeowner'
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of file paths for supporting documents/images'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'timeline_updates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = TimelineUpdate;