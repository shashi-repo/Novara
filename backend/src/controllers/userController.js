const pool = require("../config/database");


// ==========================================
// GET USER PROFILE
// ==========================================

const getProfile = async (req, res) => {

    try {

        const userId = req.user.userId;


        const [users] = await pool.query(
            `SELECT
                id,
                name,
                email,
                role,
                email_verified,
                is_active,
                created_at,
                updated_at
             FROM users
             WHERE id = ?`,
            [userId]
        );


        if (users.length === 0) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }


        return res.status(200).json({

            success: true,

            user: users[0]

        });


    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to fetch profile"

        });

    }
};



// ==========================================
// UPDATE USER PROFILE
// ==========================================

const updateProfile = async (req, res) => {

    try {

        const userId = req.user.userId;

        const {
            name
        } = req.body;


        if (!name || !name.trim()) {

            return res.status(400).json({

                success: false,

                message: "Name is required"

            });

        }


        await pool.query(
            `UPDATE users
             SET name = ?
             WHERE id = ?`,
            [
                name.trim(),
                userId
            ]
        );


        return res.status(200).json({

            success: true,

            message: "Profile updated successfully"

        });


    } catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to update profile"

        });

    }
};


module.exports = {
    getProfile,
    updateProfile
};