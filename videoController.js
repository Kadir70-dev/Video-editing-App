const videoModel = require('../Model/videoModel');
const path = require('path');
const fs = require('fs');

async function uploadVideos(req, res) {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    try {
        if (!req.files || !req.body.text || !req.body.logoPosition) {
            return res.status(400).json({ message: 'Missing files, parameters, or logo position' });
        }

        const { text } = req.body;
        const logo = req.files.logo[0]; // Get the logo file from req.files
        const logoPath = logo.path; // Path to logo image
        const imagePath = '/home/kadir/Downloads/input/image.png'; // Path to background image
        const logoPosition = JSON.parse(req.body.logoPosition); // Parse logo position from request body

        console.log('Starting processing videos...');
        console.time('ProcessingTime');

        // Map over the uploaded files and process them one by one
        const processedFileNames = await Promise.all(req.files.videos.map(async (file, index) => {
            // const processedFilename = await videoModel.processVideo(file, index, logoPath, imagePath, text, logoPosition); // Pass logo position to processVideo

            console.log(`Processing video ${file.originalname}...`);
            console.time(`ProcessingTime_${index}`);

            const outputFilename = await videoModel.processVideo(file, index, logoPath, imagePath, text, logoPosition);

            console.timeEnd(`ProcessingTime_${index}`);
            console.log(`Video ${file.originalname} processed successfully. Output filename: ${outputFilename}`);

            return outputFilename;
        }));

        console.timeEnd('ProcessingTime');

        const downloadLinks = processedFileNames.map((filename) => {
            return `http://localhost:5000/download?filename=${filename}`;
        });
        console.log('Download Links:', downloadLinks);

        res.json({ message: 'Videos processed successfully', downloadLinks });
    } catch (error) {
        console.error('Error processing files:', error);
        res.status(500).json({ message: 'Error processing files' });
    }
}

async function downloadVideo(req, res) {
    console.log('Request query:', req.query);

    const { filename } = req.query;
    const view = req.query.view === 'true'; // Check if 'view' parameter is true
    console.log('View parameter:', view); // Log the value of the view parameter

    if (!filename) {
        return res.status(400).json({ message: 'Filename parameter is missing' });
    }

    const filePath = path.join('/home/kadir/Downloads/output/', filename);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Error accessing file:', err);
            return res.status(404).json({ message: 'File not found' });
        }

        if (view === 'true') { // If 'view' parameter is true, render the video
            console.log('Rendering video:', filename); // Log that the video is being rendered
            // Set the content disposition to inline for viewing
            res.setHeader('Content-Disposition', `inline; filename=${filename}`);
        } else { // Otherwise, set it to attachment for downloading
            console.log('Downloading video:', filename); // Log that the video is being downloaded

            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        }
        res.setHeader('Content-Type', 'video/mp4');

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    });
}

module.exports = {
    uploadVideos,
    downloadVideo
};
