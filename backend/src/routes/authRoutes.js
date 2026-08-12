
const express = require("express");

const {
    register,
    verifyOTP
} = require("../controllers/authController");

const router = express.Router();


// Register
router.post("/register", register);


// Verify Email OTP
router.post("/verify-otp", verifyOTP);


module.exports = router;

