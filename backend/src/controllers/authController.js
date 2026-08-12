
const pool = require("../config/database");

const {
    hashPassword,
    comparePassword
} = require("../services/authService");

const {
    generateOTP
} = require("../utils/otp");

const {
    isValidEmail,
    isValidPassword
} = require("../utils/validation");

const {
    sendOTPEmail
} = require("../services/emailService");


// =====================================================
// REGISTER
// =====================================================

const register = async (req, res) => {
    try {

        const {
            name,
            email,
            password
        } = req.body;


        // 1. Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }


        // 2. Validate email
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }


        // 3. Validate password
        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }


        // 4. Check whether user already exists
        const [existingUsers] = await pool.query(
            `SELECT id, email_verified
             FROM users
             WHERE email = ?`,
            [email]
        );


        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }


        // 5. Hash password
        const passwordHash = await hashPassword(password);


        // 6. Create user
        const [result] = await pool.query(
            `INSERT INTO users
            (name, email, password_hash)
            VALUES (?, ?, ?)`,
            [
                name,
                email,
                passwordHash
            ]
        );


        const userId = result.insertId;


        // 7. Generate OTP
        const otp = generateOTP();


        // 8. Hash OTP
        const otpHash = await hashPassword(otp);


        // 9. OTP expiry - 10 minutes
        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );


        // 10. Store OTP
        await pool.query(
            `INSERT INTO email_otps
            (user_id, otp_hash, purpose, expires_at)
            VALUES (?, ?, ?, ?)`,
            [
                userId,
                otpHash,
                "EMAIL_VERIFICATION",
                expiresAt
            ]
        );


        // 11. Send OTP email
        await sendOTPEmail(email, otp);


        // 12. Registration successful
        return res.status(201).json({
            success: true,
            message: "Registration successful. OTP sent to your email.",
            userId
        });


    } catch (error) {

        console.error("REGISTER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during registration"
        });
    }
};



// =====================================================
// VERIFY EMAIL OTP
// =====================================================

const verifyOTP = async (req, res) => {
    try {

        const {
            email,
            otp
        } = req.body;


        // 1. Validate input
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }


        // 2. Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }


        // 3. Find user
        const [users] = await pool.query(
            `SELECT id, email, email_verified
             FROM users
             WHERE email = ?`,
            [email]
        );


        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        const user = users[0];


        // 4. Check whether email is already verified
        if (user.email_verified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }


        // 5. Get latest unused OTP
        const [otps] = await pool.query(
            `SELECT
                id,
                otp_hash,
                expires_at,
                attempts
             FROM email_otps
             WHERE user_id = ?
             AND purpose = 'EMAIL_VERIFICATION'
             AND verified_at IS NULL
             ORDER BY created_at DESC
             LIMIT 1`,
            [user.id]
        );


        if (otps.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No active OTP found. Please request a new OTP."
            });
        }


        const otpRecord = otps[0];


        // 6. Check OTP expiry
        if (new Date() > new Date(otpRecord.expires_at)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }


        // 7. Check maximum attempts
        if (otpRecord.attempts >= 5) {
            return res.status(429).json({
                success: false,
                message: "Too many incorrect attempts. Please request a new OTP."
            });
        }


        // 8. Compare entered OTP with stored hash
        const isValidOTP = await comparePassword(
            otp,
            otpRecord.otp_hash
        );


        // 9. Invalid OTP
        if (!isValidOTP) {

            await pool.query(
                `UPDATE email_otps
                 SET attempts = attempts + 1
                 WHERE id = ?`,
                [otpRecord.id]
            );


            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }


        // 10. Mark OTP as verified
        await pool.query(
            `UPDATE email_otps
             SET verified_at = NOW()
             WHERE id = ?`,
            [otpRecord.id]
        );


        // 11. Verify user's email
        await pool.query(
            `UPDATE users
             SET email_verified = TRUE
             WHERE id = ?`,
            [user.id]
        );


        // 12. Success
        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });


    } catch (error) {

        console.error("VERIFY OTP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while verifying OTP"
        });
    }
};



// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    register,
    verifyOTP
};
