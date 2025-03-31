const connection = require('../../services/connection');
const { generateAccessToken, generateRefreshToken, hashPassword } = require('../../utils/authUtils');
const sendMail = require('../../utils/sendMail');
const generateOTP = require('../../utils/generateOTP');
const path = require('path');

module.exports = async function userSignup(req, res) {
    const insertsql = 'INSERT INTO `homebuild`.`users` (`name`, `email`, `nic`, `contact_number`, `password`) VALUES (?, ?, ?, ?, ?)';
    const selectsql = 'SELECT * FROM users WHERE email = ? OR nic = ?';

    try {
        // Check if user already exists
        const [existingUsers] = await connection.promise().query(selectsql, [req.body.email, req.body.nic]);

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash the password
        const password = await hashPassword(req.body.password);
        const values = [req.body.name, req.body.email, req.body.nic, req.body.contact_number, password];

        // Insert new user
        const [insertResult] = await connection.promise().query(insertsql, values);

        if (insertResult.affectedRows === 0) {
            return res.status(500).json({ message: "Failed to create user" });
        }

        // Generate OTP
        const otp = generateOTP(req.body.email);

        // Send email with OTP
        const subject = "Welcome to Home Build Pro! Verify your email address";
        const htmlTemplatePath = path.resolve(__dirname, '../../templates/otpSend.html');
        const replacements = {
            name: req.body.name,
            otp: otp
        };

        await sendMail(req.body.email, subject, htmlTemplatePath, replacements);

        // Generate JWT tokens
        const accessToken = generateAccessToken(req.body.email);
        const refreshToken = generateRefreshToken(req.body.email);

        return res.status(201).json({
            message: "User registered successfully. Check your email for OTP.",
            accessToken,
            refreshToken,
            username: req.body.name,
            email: req.body.email
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
