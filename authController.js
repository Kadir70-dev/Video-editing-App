const { loginUser } = require('../Model/userModel');
const { generateToken } = require('../utils/authUtils'); // Assuming you have a function to generate JWT tokens in authUtils.js

async function login(req, res) {
    console.log('Request Body:', req.body); // Log the request body

    const { Username, password } = req.body; // Adjust the keys to match the request body

  try {
    // Call the loginUser function to validate the credentials
    const user = await loginUser(Username, password); // Pass the correct keys to loginUser

    // If the credentials are valid, you can generate a JWT token and send it back to the client
    const token = generateToken(user);

    // Return the token to the client
    res.json({ token });
  } catch (error) {
    console.error('Failed to log in user:', error);
    res.status(401).json({ error: 'Invalid username/email or password' });
  }
}

module.exports = {
  login
};
