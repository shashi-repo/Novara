const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getAllUsers
} = require("../controllers/adminController");


const router = express.Router();


// ==========================================
// ADMIN TEST ROUTE
// ==========================================

router.get(
    "/test",
    authMiddleware,
    authorizeRoles("ADMIN"),
    (req, res) => {

        res.json({
            success: true,
            message: "Welcome to Novara Admin area",
            user: req.user
        });

    }
);


// ==========================================
// GET ALL USERS
// ADMIN ONLY
// ==========================================

router.get(
    "/users",
    authMiddleware,
    authorizeRoles("ADMIN"),
    getAllUsers
);


module.exports = router;