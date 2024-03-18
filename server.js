// Server
const express = require('express');
const app = express();
const cors = require('cors');
const router = require('./routes/videoRoutes');

const PORT = process.env.PORT || 5000;


// Enable CORS middleware
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route middleware
app.use('/', router);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
