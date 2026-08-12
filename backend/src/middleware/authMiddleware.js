const {
    verifyToken
} = require("../services/jwtService");


const authMiddleware = (req, res, next) => {

    try {

        // Get Authorization header
        const authHeader = req.headers.authorization;

        // Check header
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        // Expected format:
        // Bearer TOKEN

        const parts = authHeader.split(" ");

        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }


        const token = parts[1];


        // Verify token
        const decoded = verifyToken(token);


        // Attach user information to request
        req.user = decoded;


        // Continue
        next();


    } catch (error) {

        console.error(
            "AUTH MIDDLEWARE ERROR:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};


module.exports = authMiddleware;