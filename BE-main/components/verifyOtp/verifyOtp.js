const connection = require('../../services/connection');
const { generateAccessToken, generateRefreshToken } = require('../../utils/authUtils');

module.exports = async function (req, res) {
    const selectOtpSql = 'SELECT * FROM homebuild.otp WHERE email = ?';

    try {
        const [otpResults] = await connection.promise().query(selectOtpSql, [req.body.email]);
        
        if (otpResults.length === 0) {
            return res.status(404).json({ message: "OTP not found for this email." });
        }

        const otpRecord = otpResults[0];
        const currentTime = new Date();

        if (new Date(otpRecord.otp_expiry) < currentTime) {
            // Delete expired OTP
            await connection.promise().query('DELETE FROM homebuild.otp WHERE email = ?', [req.body.email]);
            return res.status(408).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (otpRecord.otp === req.body.otp) {
            // OTP is correct, now save the user data to users table
            const userData = JSON.parse(otpRecord.user_data);
            
            const insertUserSql = 'INSERT INTO `homebuild`.`users` (`name`, `email`, `nic`, `contact_number`, `password`) VALUES (?, ?, ?, ?, ?)';
            const values = [
                userData.name, 
                userData.email, 
                userData.nic, 
                userData.contact_number, 
                userData.password
            ];

            const [insertResult] = await connection.promise().query(insertUserSql, values);
            
            if (insertResult.affectedRows === 0) {
                return res.status(500).json({ message: "Failed to create user account" });
            }

            // Generate JWT tokens
            const accessToken = generateAccessToken(userData.email);
            const refreshToken = generateRefreshToken(userData.email);
            
            // Delete the OTP record
            await connection.promise().query('DELETE FROM homebuild.otp WHERE email = ?', [req.body.email]);

            return res.status(200).json({
                message: 'Email verification successful. Your account has been created.',
                accessToken,
                refreshToken,
                username: userData.name,
                email: userData.email
            });
        } else {
            return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }
    } catch (error) {
        console.error("OTP Verification Error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};