// src/models/TimelineStage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TimelineStage = sequelize.define('TimelineStage', {
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
  stage_name: {
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
  stage_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
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
  duration_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  status: {
    type: DataTypes.ENUM,
    values: ['not_started', 'in_progress', 'completed', 'delayed', 'on_hold', 'cancelled'],
    defaultValue: 'not_started'
  },
  progress_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  dependencies: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of stage IDs that must be completed before this stage can start'
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Team member or contractor assigned to this stage'
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  actual_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  materials_required: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'List of materials needed for this stage'
  },
  deliverables: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Expected deliverables for this stage'
  },
  risks: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Potential risks and mitigation strategies'
  },
  quality_checkpoints: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Quality checkpoints and inspection requirements'
  },
  weather_dependent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this stage is dependent on weather conditions'
  },
  priority: {
    type: DataTypes.ENUM,
    values: ['low', 'medium', 'high', 'critical'],
    defaultValue: 'medium'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_milestone: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this stage represents a major milestone'
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
  tableName: 'timeline_stages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['timeline_id', 'stage_order'],
      unique: true
    }
  ],
  hooks: {
    beforeSave: (stage) => {
      // Calculate duration in days
      const start = new Date(stage.planned_start_date);
      const end = new Date(stage.planned_end_date);
      stage.duration_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
  }
});

module.exports = TimelineStage;