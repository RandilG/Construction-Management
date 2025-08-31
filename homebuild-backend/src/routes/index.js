// src/routes/index.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const stageRoutes = require('./stageRoutes');
const expenseRoutes = require('./expenseRoutes');
const timelineRoutes = require('./timelineRoutes');
const profileRoutes = require('./profileRoutes');
const projectMemberRoutes = require('./projectMemberRoutes');
// const userRoutes = require('./userRoutes'); // For future user-related routes

// Auth routes
router.use('/auth', authRoutes);

// Project routes
router.use('/projects', projectRoutes);

// Stage routes
router.use('/stages', stageRoutes);

// Expense routes
router.use('/expenses', expenseRoutes);

// Timeline routes
router.use('/timelines', timelineRoutes);

// Profile routes
router.use('/profile', profileRoutes);

// Project Member routes
router.use('/project-members', projectMemberRoutes);

// For future routes
// router.use('/users', userRoutes);

module.exports = router;