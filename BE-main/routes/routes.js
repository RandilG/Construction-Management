const express = require('express');
const router = express.Router();

// Import all your existing components
const userSignup = require('../components/userSignup/userSignup');
const userSignin = require('../components/userSignin/userSignin');
const { authenticateToken } = require('../utils/authUtils');
const mailTest = require('../components/test/mailTest');
const verifyOtp = require('../components/verifyOtp/verifyOtp');
const ResetPasswordVerification = require('../components/ResetPasswordVerification/ResetPasswordVerification');
const resetPassword = require('../components/resetPassword/resetPassword');
const uploadImage = require('../components/uploadImage/uploadImage');
const getUserById = require('../components/getUserById/getUserById');
const ProfileController = require('../components/Profile/Profile');
const settingsController = require('../components/Settings/Settings');
const changePassword = require('../components/changePassword/changePassword');
const getUserByEmail = require('../components/getUserByEmail/getUserByEmail');
const getStages = require('../components/getStages/getStages');
const getUserProjects = require('../components/getUserProjects/getUserProjects');
const addNewProject = require('../components/addNewProject/addNewProject');
const getProjectById = require('../components/getProjectById/getProjectById');
const getProjectDetails = require('../components/getProjectDetails/getProjectDetails');
const deleteProject = require('../components/deleteProject/deleteProject');
const getProjectMessages = require('../components/getProjectMessages/getProjectMessages');
const createProjectMessage = require('../components/createProjectMessage/createProjectMessage');
const getProjectMembers = require('../components/getProjectMembers/getProjectMembers');
const addProjectMembers = require('../components/addProjectMembers/addProjectMembers');
const searchUsers = require('../components/searchUsers/searchUsers');
const getAllProjects = require('../components/getAllProjects/getAllProjects');


// Import stage controller and upload middleware
const stagesController = require('../components/stagesController/stagesController');
const { uploadStageImage } = require('../middleware/uploadMiddleware');

// Existing routes
router.post('/signup', async(req, res) => {
    userSignup(req, res);
});

router.post('/signin', async(req, res) => {
    userSignin(req, res);
});

router.get('/protected', authenticateToken, (req, res) => { 
    res.status(200).json("Protected Route");
});

router.get('/test/email', (req, res) => {   
    mailTest(req, res);
});

router.post('/verify-otp', (req, res) => {
    verifyOtp(req, res);
});

router.post('/reset-password-verification', (req, res) => {
    ResetPasswordVerification(req, res);
});

router.post('/reset-password', (req, res) => {
    resetPassword(req, res);
});

router.put('/upload-image', (req, res) => {
    uploadImage(req, res);
});

router.get('/get-user/:id', (req, res) => {
    getUserById(req, res);
});

router.put('/edit-user', (req, res) => {
    updateProfile(req, res);
});

router.put('/change-password', (req, res) => {
    changePassword(req, res);
});


// Root route
router.get('/', (req, res) => {
    res.json({ message: "Server is running" });
});

// Stage routes - directly added to the main router
router.get('/stages', stagesController.getAllStages);
router.get('/stages/:id', stagesController.getStageById);
router.post('/stages', uploadStageImage.single('image'), stagesController.addStage);
router.put('/stages/:id', uploadStageImage.single('image'), stagesController.updateStage);
router.delete('/stages/:id', stagesController.deleteStage);

// Project routes
router.get('/projects/:email', getUserProjects);
router.get('/project/:id', getProjectById);
router.post('/addNewProjects', addNewProject);

// Project routes
router.get('/projects', getAllProjects); // Get all projects
router.get('/projects/:id', getProjectDetails);
router.delete('/projects/:id', deleteProject);

// Project messages routes
router.get('/projects/:id/messages', getProjectMessages);
router.post('/projects/:id/messages', createProjectMessage);

// Project members routes
router.get('/projects/:id/members', getProjectMembers);
router.post('/projects/:id/members', addProjectMembers);

// User search route
router.get('/users/search', searchUsers);

// Profile routes
router.get('/get-user/:email', ProfileController.getUserProfile);
router.put('/update-user/:email', ProfileController.updateProfile);

// Settings routes
router.get('/user-settings/:email', settingsController.getUserSettings);
router.post('/update-settings/:email', settingsController.updateSettings);

module.exports = router;