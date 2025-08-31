// src/controllers/auth/signinController.js
const { User } = require('../../models');
const { comparePassword, generateAccessToken, generateRefreshToken } = require('../../utils/authUtils');

/**
 * @desc Authenticate user & get token
 * @route POST /api/auth/signin
 * @access Public
 */
const userSignin = async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const match = await comparePassword(req.body.password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    // Check if user is verified
    if (!user.is_verified) {
      return res.status(403).json({ message: "Please verify your email to login" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.email);
    const refreshToken = generateRefreshToken(user.email);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      email: user.email,
      username: user.name,
      user_id: user.id
    });
  } catch (err) {
    console.error("Error during signin:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = userSignin;