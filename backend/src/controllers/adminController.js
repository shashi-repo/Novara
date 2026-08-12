const pool = require("../config/database");


const getAllUsers = async (req, res) => {

    try {

        const [users] = await pool.query(
            `SELECT
                id,
                name,
                email,
                role,
                email_verified,
                is_active,
                created_at
             FROM users
             ORDER BY created_at DESC`
        );

        return res.status(200).json({
            success: true,
            users
        });

    } catch (error) {

        console.error("GET ALL USERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};


module.exports = {
    getAllUsers
};