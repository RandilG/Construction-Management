// src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'users_email_unique',
      msg: 'Email already exists'
    },
    validate: {
      isEmail: true
    }
  },
  nic: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: {
      name: 'users_nic_unique',
      msg: 'NIC already exists'
    }
  },
  contact_number: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    // Explicitly define only the indexes you need
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['nic']
    }
  ]
});

module.exports = User;