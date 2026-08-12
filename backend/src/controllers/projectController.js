const pool = require("../config/database");


// ==========================================
// CREATE PROJECT
// ==========================================

const createProject = async (req, res) => {

    try {

        const {
            name,
            description
        } = req.body;


        // Validate input
        if (!name || !description) {

            return res.status(400).json({
                success: false,
                message: "Project name and description are required"
            });

        }


        const userId = req.user.userId;


        // Create project
        const [result] = await pool.query(
            `INSERT INTO projects
            (user_id, name, description)
            VALUES (?, ?, ?)`,
            [
                userId,
                name,
                description
            ]
        );


        // Create Version 1
        const [versionResult] = await pool.query(
            `INSERT INTO project_versions
            (
                project_id,
                version_number,
                title,
                idea_description
            )
            VALUES (?, ?, ?, ?)`,
            [
                result.insertId,
                1,
                name,
                description
            ]
        );


        // Set current version
        await pool.query(
            `UPDATE projects
             SET current_version_id = ?
             WHERE id = ?`,
            [
                versionResult.insertId,
                result.insertId
            ]
        );


        return res.status(201).json({

            success: true,

            message: "Project created successfully",

            projectId: result.insertId,

            versionId: versionResult.insertId

        });


    } catch (error) {

        console.error(
            "CREATE PROJECT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to create project"

        });

    }
};



// ==========================================
// GET USER PROJECTS
// ==========================================

const getProjects = async (req, res) => {

    try {

        const userId = req.user.userId;


        const [projects] = await pool.query(
            `SELECT
                id,
                name,
                description,
                status,
                current_version_id,
                created_at,
                updated_at
             FROM projects
             WHERE user_id = ?
             ORDER BY updated_at DESC`,
            [userId]
        );


        return res.status(200).json({

            success: true,

            projects

        });


    } catch (error) {

        console.error(
            "GET PROJECTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to fetch projects"

        });

    }
};



// ==========================================
// GET SINGLE PROJECT
// ==========================================

const getProjectById = async (req, res) => {

    try {

        const userId = req.user.userId;

        const projectId = req.params.id;


        const [projects] = await pool.query(
            `SELECT
                id,
                name,
                description,
                status,
                current_version_id,
                created_at,
                updated_at
             FROM projects
             WHERE id = ?
             AND user_id = ?`,
            [
                projectId,
                userId
            ]
        );


        if (projects.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Project not found"

            });

        }


        return res.status(200).json({

            success: true,

            project: projects[0]

        });


    } catch (error) {

        console.error(
            "GET PROJECT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to fetch project"

        });

    }
};


// ==========================================
// UPDATE PROJECT
// ==========================================

const updateProject = async (req, res) => {

    try {

        const userId = req.user.userId;
        const projectId = req.params.id;

        const {
            name,
            description,
            status
        } = req.body;


        // Check whether project belongs to user
        const [projects] = await pool.query(
            `SELECT id
             FROM projects
             WHERE id = ?
             AND user_id = ?`,
            [
                projectId,
                userId
            ]
        );


        if (projects.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Project not found"
            });

        }


        // Update project
        await pool.query(
            `UPDATE projects
             SET name = ?,
                 description = ?,
                 status = ?
             WHERE id = ?
             AND user_id = ?`,
            [
                name,
                description,
                status,
                projectId,
                userId
            ]
        );


        return res.status(200).json({

            success: true,

            message: "Project updated successfully"

        });


    } catch (error) {

        console.error(
            "UPDATE PROJECT ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to update project"

        });

    }
};



// ==========================================
// DELETE PROJECT
// ==========================================

const deleteProject = async (req, res) => {

    try {

        const userId = req.user.userId;
        const projectId = req.params.id;


        const [result] = await pool.query(
            `DELETE FROM projects
             WHERE id = ?
             AND user_id = ?`,
            [
                projectId,
                userId
            ]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message: "Project not found"

            });

        }


        return res.status(200).json({

            success: true,

            message: "Project deleted successfully"

        });


    } catch (error) {

        console.error(
            "DELETE PROJECT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to delete project"

        });

    }
};

// ==========================================
// CREATE PROJECT VERSION
// ==========================================

const createProjectVersion = async (req, res) => {

    try {

        const userId = req.user.userId;
        const projectId = req.params.id;

        const {
            title,
            idea_description,
            change_summary
        } = req.body;


        // Validate
        if (!title || !idea_description) {

            return res.status(400).json({

                success: false,

                message:
                    "Title and idea description are required"

            });

        }


        // Check project ownership
        const [projects] = await pool.query(
            `SELECT id
             FROM projects
             WHERE id = ?
             AND user_id = ?`,
            [
                projectId,
                userId
            ]
        );


        if (projects.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Project not found"

            });

        }


        // Get latest version number
        const [versions] = await pool.query(
            `SELECT
                MAX(version_number) AS latest_version
             FROM project_versions
             WHERE project_id = ?`,
            [projectId]
        );


        const latestVersion =
            versions[0].latest_version || 0;

        const newVersion =
            latestVersion + 1;


        // Create version
        const [result] = await pool.query(
            `INSERT INTO project_versions
            (
                project_id,
                version_number,
                title,
                idea_description,
                change_summary
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                projectId,
                newVersion,
                title,
                idea_description,
                change_summary || null
            ]
        );


        // Make this the current version
        await pool.query(
            `UPDATE projects
             SET current_version_id = ?
             WHERE id = ?
             AND user_id = ?`,
            [
                result.insertId,
                projectId,
                userId
            ]
        );


        return res.status(201).json({

            success: true,

            message:
                "Project version created successfully",

            versionId: result.insertId,

            versionNumber: newVersion

        });


    } catch (error) {

        console.error(
            "CREATE PROJECT VERSION ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create project version"

        });

    }
};



// ==========================================
// GET PROJECT VERSIONS
// ==========================================

const getProjectVersions = async (req, res) => {

    try {

        const userId = req.user.userId;
        const projectId = req.params.id;


        // Check ownership
        const [projects] = await pool.query(
            `SELECT id
             FROM projects
             WHERE id = ?
             AND user_id = ?`,
            [
                projectId,
                userId
            ]
        );


        if (projects.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Project not found"

            });

        }


        const [versions] = await pool.query(
            `SELECT
                id,
                project_id,
                version_number,
                title,
                idea_description,
                change_summary,
                created_at
             FROM project_versions
             WHERE project_id = ?
             ORDER BY version_number DESC`,
            [projectId]
        );


        return res.status(200).json({

            success: true,

            versions

        });


    } catch (error) {

        console.error(
            "GET PROJECT VERSIONS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch project versions"

        });

    }
};



// ==========================================
// GET SINGLE PROJECT VERSION
// ==========================================

const getProjectVersionById = async (req, res) => {

    try {

        const userId = req.user.userId;
        const projectId = req.params.id;
        const versionId = req.params.versionId;


        const [versions] = await pool.query(
            `SELECT
                pv.id,
                pv.project_id,
                pv.version_number,
                pv.title,
                pv.idea_description,
                pv.change_summary,
                pv.created_at
             FROM project_versions pv
             INNER JOIN projects p
                ON pv.project_id = p.id
             WHERE pv.id = ?
             AND pv.project_id = ?
             AND p.user_id = ?`,
            [
                versionId,
                projectId,
                userId
            ]
        );


        if (versions.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Project version not found"

            });

        }


        return res.status(200).json({

            success: true,

            version: versions[0]

        });


    } catch (error) {

        console.error(
            "GET PROJECT VERSION ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch project version"

        });

    }
};



module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    createProjectVersion,
    getProjectVersions,
    getProjectVersionById
};