const jwt = require("jsonwebtoken");


// Generate JWT
const generateToken = (user) => {

    return jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );
};


// Verify JWT
const verifyToken = (token) => {

    return jwt.verify(
        token,
        process.env.JWT_SECRET
    );
};


module.exports = {
    generateToken,
    verifyToken
};