// authUtils.js

const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

// Function to generate JWT token
function generateToken(user) {
    // Add your JWT token generation logic here
    const token = jwt.sign({
        userId: user._id,
        username: user.username,
        email: user.email
    }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Adjust expiration time as needed
    return token;
}

module.exports = {
    generateToken
};
