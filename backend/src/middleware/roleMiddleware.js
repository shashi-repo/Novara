const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        // Check whether authentication middleware
        // has already attached the user
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Check user's role
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource"
            });
        }

        // User has required role
        next();
    };
};


module.exports = authorizeRoles;