const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getProfile,
    updateProfile
} = require("../controllers/userController");


const router = express.Router();


// ==========================================
// GET PROFILE
// ==========================================

router.get(
    "/profile",
    authMiddleware,
    authorizeRoles("USER", "ADMIN"),
    getProfile
);


// ==========================================
// UPDATE PROFILE
// ==========================================

router.put(
    "/profile",
    authMiddleware,
    authorizeRoles("USER", "ADMIN"),
    updateProfile
);


module.exports = router;