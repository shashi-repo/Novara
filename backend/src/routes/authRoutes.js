
const express = require("express");

const {
    register,
    verifyOTP,
    resendOTP,
    login,
    forgotPassword,
    verifyResetOTP,
    resetPassword
} = require("../controllers/authController");

const router = express.Router();


// Register
router.post("/register", register);


// Verify Email OTP
router.post("/verify-otp", verifyOTP);


// Resend OTP
router.post("/resend-otp", resendOTP);


// Login
router.post("/login", login);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Verify password reset OTP
router.post("/verify-reset-otp", verifyResetOTP);

// Reset password
router.post("/reset-password", resetPassword);



module.exports = router;

