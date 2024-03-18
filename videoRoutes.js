const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController'); // Import videoController
const userController = require('../controllers/userController'); // Import userController
const voucherController = require('../controllers/voucherController'); // Import voucherController
const authController = require('../controllers/authController'); // Import authController

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/home/kadir/Downloads/'); // Specify the destination directory for file uploads
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname)); // Generate a unique filename for uploaded files
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log('Request Headers:', req.headers);
        console.log('Request Body:', req.body);
        console.log('Uploaded Files:', req.files);
        console.log('Uploaded File:', file);

        cb(null, true);
    }
}).fields([{ name: 'logo', maxCount: 1 }, { name: 'videos', maxCount: 10 }]);
// Route for handling video uploads



router.post('/upload', upload, videoController.uploadVideos);

// Route for handling video downloads
router.get('/download', videoController.downloadVideo); // Handle video downloads with videoController


// Custom middleware to log incoming requests
router.use((req, res, next) => {
    console.log('Incoming Request:');
    console.log('Request Method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    next(); // Call next to pass control to the next middleware
});




// Route for user sign-up
router.post('/signup', userController.signUp); // Handle user sign-up with userController

// Route for generating and saving voucher codes
router.get('/generate-voucher', voucherController.generateAndSaveVoucherCode); // Handle voucher generation with voucherController

// Route for user login
router.post('/login', authController.login); // Handle user login with authController


// router.get('/preview', (req, res) => { const { filename } = req.query; if (!filename) { return res.status(400).json({ message: 'Filename parameter is missing' }); } const videoURL = `/download?filename=${filename}`; res.render('video-preview', { videoURL }); });



module.exports = router; // Export the router for use in other files
