// src/models/Otp.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Otp = sequelize.define('Otp', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'email'
    }
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  otp_expiry: {
    type: DataTypes.DATE,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'otp',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Otp;