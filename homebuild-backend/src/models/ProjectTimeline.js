// src/models/ProjectTimeline.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProjectTimeline = sequelize.define('ProjectTimeline', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // One timeline per project
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  planned_start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  planned_end_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfterStartDate(value) {
        if (value <= this.planned_start_date) {
          throw new Error('End date must be after start date');
        }
      }
    }
  },
  actual_start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actual_end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM,
    values: ['draft', 'active', 'completed', 'on_hold', 'cancelled'],
    defaultValue: 'draft'
  },
  total_duration_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  progress_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'project_timelines',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeSave: (timeline) => {
      // Calculate total duration in days
      const start = new Date(timeline.planned_start_date);
      const end = new Date(timeline.planned_end_date);
      timeline.total_duration_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
  }
});

module.exports = ProjectTimeline;