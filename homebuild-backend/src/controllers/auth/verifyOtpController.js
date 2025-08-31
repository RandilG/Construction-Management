// src/controllers/auth/verifyOtpController.js
const { User, Otp } = require('../../models');
const { generateAccessToken, generateRefreshToken } = require('../../utils/authUtils');
const { Op } = require('sequelize');

/**
 * @desc Verify user's email with OTP
 * @route POST /api/auth/verify-otp
 * @access Public
 */
const verifyOtp = async (req, res) => {
  try {
    // Ensure we're working with strings for comparison
    const email = String(req.body.email).trim();
    const providedOtp = String(req.body.otp).trim();
    
    console.log("Verifying OTP:", email, providedOtp); // Debug log
    
    // Find OTP record
    const otpRecord = await Otp.findOne({
      where: {
        email: email
      }
    });
    
    if (!otpRecord) {
      console.log("No OTP found for email:", email);
      return res.status(404).json({ message: "OTP not found for this email." });
    }

    const currentTime = new Date();
    
    // Check if OTP has expired
    if (new Date(otpRecord.otp_expiry) < currentTime) {
      console.log("OTP expired");
      // Delete expired OTP
      await otpRecord.destroy();
      return res.status(408).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Ensure we're comparing strings
    const storedOtp = String(otpRecord.otp).trim();
    
    if (storedOtp === providedOtp) {
      console.log("OTP verified successfully");
      
      // Update user's verification status
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      user.is_verified = true;
      await user.save();
      console.log("User verification status updated successfully");

      // Generate JWT tokens
      const accessToken = generateAccessToken(email);
      const refreshToken = generateRefreshToken(email);
      
      // Delete the OTP record
      await otpRecord.destroy();

      return res.status(200).json({
        message: 'Email verification successful. Your account has been activated.',
        accessToken,
        refreshToken,
        username: user.name,
        email: user.email
      });
    } else {
      console.log("Invalid OTP provided");
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = verifyOtp;