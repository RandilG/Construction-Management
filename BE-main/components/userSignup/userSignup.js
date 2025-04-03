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
        
        // Store user data in the OTP table or a temporary users table
        // Here we'll store the user data in a JSON column in the OTP table
        const userData = {
            name: req.body.name,
            email: req.body.email,
            nic: req.body.nic,
            contact_number: req.body.contact_number,
            password: password
        };
        
        // Generate OTP
        const otp = generateOTP(req.body.email);
        
        // Store OTP and user data in the OTP table
        const insertOtpSql = 'INSERT INTO `homebuild`.`otp` (`email`, `otp`, `otp_expiry`, `user_data`) VALUES (?, ?, ?, ?)';
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        
        await connection.promise().query(insertOtpSql, [
            req.body.email, 
            otp, 
            otpExpiry, 
            JSON.stringify(userData)
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
            message: "Verification code sent to your email. Please verify to complete registration.",
            email: req.body.email
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};