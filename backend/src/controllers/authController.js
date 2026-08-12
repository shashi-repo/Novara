
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

const {
    generateToken
} = require("../services/jwtService");



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
// RESEND EMAIL OTP
// =====================================================

const resendOTP = async (req, res) => {
    try {

        const { email } = req.body;

        // 1. Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        // 2. Find user
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

        // 3. Check whether email is already verified
        if (user.email_verified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        // 4. Check recent OTP
        const [recentOTPs] = await pool.query(
            `SELECT id, created_at
             FROM email_otps
             WHERE user_id = ?
             AND purpose = 'EMAIL_VERIFICATION'
             ORDER BY created_at DESC
             LIMIT 1`,
            [user.id]
        );

        // 5. Prevent OTP spam
        if (recentOTPs.length > 0) {

            const lastOTPTime = new Date(
                recentOTPs[0].created_at
            );

            const currentTime = new Date();

            const difference =
                currentTime - lastOTPTime;

            const cooldown = 60 * 1000; // 60 seconds

            if (difference < cooldown) {

                const remainingSeconds =
                    Math.ceil(
                        (cooldown - difference) / 1000
                    );

                return res.status(429).json({
                    success: false,
                    message:
                        `Please wait ${remainingSeconds} seconds before requesting another OTP`
                });
            }
        }

        // 6. Invalidate previous OTPs
        await pool.query(
            `UPDATE email_otps
             SET verified_at = NOW()
             WHERE user_id = ?
             AND purpose = 'EMAIL_VERIFICATION'
             AND verified_at IS NULL`,
            [user.id]
        );

        // 7. Generate new OTP
        const otp = generateOTP();

        // 8. Hash OTP
        const otpHash = await hashPassword(otp);

        // 9. Set expiry - 10 minutes
        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        // 10. Store new OTP
        await pool.query(
            `INSERT INTO email_otps
            (user_id, otp_hash, purpose, expires_at)
            VALUES (?, ?, ?, ?)`,
            [
                user.id,
                otpHash,
                "EMAIL_VERIFICATION",
                expiresAt
            ]
        );

        // 11. Send new OTP
        await sendOTPEmail(email, otp);

        // 12. Success
        return res.status(200).json({
            success: true,
            message: "New OTP sent successfully"
        });

    } catch (error) {

        console.error("RESEND OTP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while resending OTP"
        });
    }
};



// =====================================================
// EXPORT CONTROLLERS
// =====================================================


// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;


        // 1. Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
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
            `SELECT
                id,
                name,
                email,
                password_hash,
                role,
                email_verified,
                is_active
             FROM users
             WHERE email = ?`,
            [email]
        );


        // 4. User not found
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        const user = users[0];


        // 5. Check account status
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated"
            });
        }


        // 6. Check email verification
        if (!user.email_verified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in"
            });
        }


        // 7. Compare password
        const isPasswordValid = await comparePassword(
            password,
            user.password_hash
        );


        // 8. Invalid password
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        // 9. Remove sensitive information
        delete user.password_hash;
        delete user.email_verified;
        delete user.is_active;


        // 10. Login successful
        // Generate JWT
        const token = generateToken(user);

        return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user
        });


    } catch (error) {

        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during login"
        });
    }
};


// =====================================================
// FORGOT PASSWORD
// =====================================================

const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;

        // 1. Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        // 2. Find user
        const [users] = await pool.query(
            `SELECT id, email, email_verified, is_active
             FROM users
             WHERE email = ?`,
            [email]
        );

        // Don't reveal whether an email exists
        if (users.length === 0) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a password reset OTP has been sent."
            });
        }

        const user = users[0];

        // 3. Check account status
        if (!user.is_active) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a password reset OTP has been sent."
            });
        }

        // 4. Check email verification
        if (!user.email_verified) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a password reset OTP has been sent."
            });
        }

        // 5. Generate OTP
        const otp = generateOTP();

        // 6. Hash OTP
        const otpHash = await hashPassword(otp);

        // 7. Set expiry - 10 minutes
        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        // 8. Invalidate previous password reset OTPs
        await pool.query(
            `UPDATE email_otps
             SET invalidated_at = NOW()
             WHERE user_id = ?
             AND purpose = 'PASSWORD_RESET'
             AND verified_at IS NULL
             AND invalidated_at IS NULL`,
            [user.id]
        );

        // 9. Store new OTP
        await pool.query(
            `INSERT INTO email_otps
             (user_id, otp_hash, purpose, expires_at)
             VALUES (?, ?, ?, ?)`,
            [
                user.id,
                otpHash,
                "PASSWORD_RESET",
                expiresAt
            ]
        );

        // 10. Send OTP
        await sendOTPEmail(email, otp);

        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, a password reset OTP has been sent."
        });

    } catch (error) {

        console.error("FORGOT PASSWORD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while processing your request"
        });
    }
};


// =====================================================
// VERIFY PASSWORD RESET OTP
// =====================================================

const verifyResetOTP = async (req, res) => {
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

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        // 2. Find user
        const [users] = await pool.query(
            `SELECT id, email
             FROM users
             WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const user = users[0];

        // 3. Find latest valid reset OTP
        const [otps] = await pool.query(
            `SELECT
                id,
                otp_hash,
                expires_at,
                attempts
             FROM email_otps
             WHERE user_id = ?
             AND purpose = 'PASSWORD_RESET'
             AND verified_at IS NULL
             AND invalidated_at IS NULL
             ORDER BY created_at DESC
             LIMIT 1`,
            [user.id]
        );

        if (otps.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        const otpRecord = otps[0];

        // 4. Check expiry
        if (new Date() > new Date(otpRecord.expires_at)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        // 5. Check attempts
        if (otpRecord.attempts >= 5) {
            return res.status(429).json({
                success: false,
                message: "Too many incorrect attempts. Please request a new OTP."
            });
        }

        // 6. Compare OTP
        const isValidOTP = await comparePassword(
            otp,
            otpRecord.otp_hash
        );

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

        // 7. Mark OTP as verified
        await pool.query(
            `UPDATE email_otps
             SET verified_at = NOW()
             WHERE id = ?`,
            [otpRecord.id]
        );

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. You can now reset your password."
        });

    } catch (error) {

        console.error("VERIFY RESET OTP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while verifying the reset OTP"
        });
    }
};


// =====================================================
// RESET PASSWORD
// =====================================================

const resetPassword = async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required"
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

        // 4. Find user
        const [users] = await pool.query(
            `SELECT id, email
             FROM users
             WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Unable to reset password"
            });
        }

        const user = users[0];

        // 5. Confirm a verified password reset OTP exists
        const [verifiedOTPs] = await pool.query(
            `SELECT id
             FROM email_otps
             WHERE user_id = ?
             AND purpose = 'PASSWORD_RESET'
             AND verified_at IS NOT NULL
             AND invalidated_at IS NULL
             ORDER BY verified_at DESC
             LIMIT 1`,
            [user.id]
        );

        if (verifiedOTPs.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Please verify the password reset OTP first"
            });
        }

        // 6. Hash new password
        const passwordHash = await hashPassword(password);

        // 7. Update password
        await pool.query(
            `UPDATE users
             SET password_hash = ?
             WHERE id = ?`,
            [
                passwordHash,
                user.id
            ]
        );

        // 8. Invalidate used reset OTP
        await pool.query(
            `UPDATE email_otps
             SET invalidated_at = NOW()
             WHERE id = ?`,
            [verifiedOTPs[0].id]
        );

        // 9. Success
        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now login."
        });

    } catch (error) {

        console.error("RESET PASSWORD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while resetting your password"
        });
    }
};



module.exports = {
    register,
    verifyOTP,
    resendOTP,
    login,
    forgotPassword,
    verifyResetOTP,
    resetPassword
};
