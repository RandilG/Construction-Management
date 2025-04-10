const connection = require('../../services/connection');
const { generateAccessToken, generateRefreshToken, hashPassword } = require('../../utils/authUtils');
const sendMail = require('../../utils/sendMail');
const generateOTP = require('../../utils/generateOTP');
const path = require('path');

module.exports = async function userSignup(req, res) {
    const selectsql = 'SELECT * FROM users WHERE email = ? OR nic = ?';

    try {
        // Check if user already exists
        const [existingUsers] = await connection.promise().query(selectsql, [req.body.email, req.body.nic]);

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash the password
        const password = await hashPassword(req.body.password);
        
        // Insert user data directly into users table, with isVerified flag set to false
        const insertUserSql = 'INSERT INTO `homebuild`.`users` (`name`, `email`, `nic`, `contact_number`, `password`, `is_verified`) VALUES (?, ?, ?, ?, ?, ?)';
        const userValues = [
            req.body.name, 
            req.body.email, 
            req.body.nic, 
            req.body.contact_number, 
            password,
            false // User is not verified yet
        ];

        const [insertResult] = await connection.promise().query(insertUserSql, userValues);
        
        if (insertResult.affectedRows === 0) {
            return res.status(500).json({ message: "Failed to create user account" });
        }
        
        // Generate OTP
        const otp = generateOTP(req.body.email);
        
        // Store OTP in the OTP table (without storing user data again)
        const insertOtpSql = 'INSERT INTO `homebuild`.`otp` (`email`, `otp`, `otp_expiry`) VALUES (?, ?, ?)';
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        
        await connection.promise().query(insertOtpSql, [
            req.body.email, 
            otp, 
            otpExpiry
        ]);

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