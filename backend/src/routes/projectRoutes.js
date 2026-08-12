const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    createProjectVersion,
    getProjectVersions,
    getProjectVersionById
} = require("../controllers/projectController");

const router = express.Router();


// ==========================================
// CREATE PROJECT
// ==========================================

router.post(
    "/",
    authMiddleware,
    authorizeRoles("USER", "ADMIN"),
    createProject
);


// ==========================================
// GET ALL USER PROJECTS
// ==========================================

router.get(
    "/",
    authMiddleware,
    authorizeRoles("USER", "ADMIN"),
    getProjects
);


// ==========================================
// GET SINGLE PROJECT
// ==========================================

router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("USER", "ADMIN"),
    getProjectById
);

// ==========================================
// UPDATE PROJECT
// ==========================================

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("USER", "ADMIN"),
    updateProject
);


// ==========================================
// DELETE PROJECT
// ==========================================

router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("USER", "ADMIN"),
    deleteProject
);

// ==========================================
// CREATE PROJECT VERSION
// ==========================================

router.post(
    "/:id/versions",
    authMiddleware,
    authorizeRoles("USER", "ADMIN"),
    createProjectVersion
);


// ==========================================
// GET PROJECT VERSIONS
// ==========================================

router.get(
    "/:id/versions",
    authMiddleware,
    authorizeRoles("USER", "ADMIN"),
    getProjectVersions
);


// ==========================================
// GET SINGLE PROJECT VERSION
// ==========================================

router.get(
    "/:id/versions/:versionId",
    authMiddleware,
    authorizeRoles("USER", "ADMIN"),
    getProjectVersionById
);


module.exports = router;