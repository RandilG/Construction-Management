// src/controllers/auth/signupController.js
const { User, Otp } = require('../../models');
const { Op } = require('sequelize'); // Add this line
const { hashPassword } = require('../../utils/authUtils');
const sendMail = require('../../services/emailService');
const generateOTP = require('../../utils/generateOTP');
const path = require('path');

/**
 * @desc Register a new user
 * @route POST /api/auth/signup
 * @access Public
 */
const userSignup = async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: req.body.email },
          { nic: req.body.nic }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password
    const password = await hashPassword(req.body.password);
    
    // Create user with Sequelize
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      nic: req.body.nic,
      contact_number: req.body.contact_number,
      password,
      is_verified: false
    });
    
    if (!newUser) {
      return res.status(500).json({ message: "Failed to create user account" });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    // Create OTP record with Sequelize
    await Otp.create({
      email: req.body.email,
      otp,
      otp_expiry: otpExpiry
    });

    // Send email with OTP
    const subject = "Welcome to Home Build Pro! Verify your email address";
    const htmlTemplatePath = path.resolve(__dirname, '../../templates/otpSend.html');
    const replacements = {
      name: req.body.name,
      otp: otp
    };

    await sendMail(req.body.email, subject, htmlTemplatePath, replacements);

    return res.status(201).json({
      message: "Account created! Verification code sent to your email. Please verify to activate your account.",
      email: req.body.email
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = userSignup;