const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// Function to calculate logo position based on selected corner
const calculateLogoPosition = (videoWidth, videoHeight, logoWidth, logoHeight, logoPosition) => {
    const { x, y } = logoPosition;
    let logoX = 0;
    let logoY = 0;

    if (x === 0) { // Left side
        logoX = 10; // Adjust this value according to your preference
    } else { // Right side
        logoX = videoWidth - logoWidth - 10; // Adjust this value according to your preference
    }

    if (y === 0) { // Top side
        logoY = 10; // Adjust this value according to your preference
    } else { // Bottom side
        logoY = videoHeight - logoHeight - 10; // Adjust this value according to your preference
    }

    return { x: logoX, y: logoY };
};

async function processVideo(file, index, logoPath, imagePath, text, logoPosition) {
    return new Promise(async (resolve, reject) => {
        const videoPath = file.path;
        console.log('Video path:', videoPath); // Log the video path

        const outputFilename = `output_${index + 1}_${Date.now()}.mp4`;
        const outputPath = path.join('/home/kadir/Downloads/output/', outputFilename);
        const textImagePath = `/home/kadir/Downloads/text/image_${index}.png`;

        console.log(`Processing video ${file.originalname}`);

        try {
            // Load the logo image
            const logo = await loadImage(logoPath);
            console.log('Logo loaded successfully:', logo);

            // Load the background image
            const backgroundImage = await loadImage(imagePath);
            console.log('Background image loaded successfully:', backgroundImage);

            // Get the resolution of the video
            const videoInfo = await new Promise((resolve, reject) => {
                ffmpeg.ffprobe(videoPath, (err, metadata) => {
                    if (err) reject(err);
                    else resolve(metadata);
                });
            });
            const videoWidth = videoInfo.streams[0].width;
            const videoHeight = videoInfo.streams[0].height;

            // Calculate the position of the logo
            const { x: logoX, y: logoY } = calculateLogoPosition(videoWidth, videoHeight, logo.width, logo.height, logoPosition);

            // Resize the background image to match the video resolution
            const canvas = createCanvas(videoWidth, videoHeight);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(backgroundImage, 0, 0, videoWidth, videoHeight);

            // Draw text on canvas
            ctx.fillStyle = '#000000'; // Set text color
            ctx.font = '48px Arial'; // Adjust font size and style as needed
            ctx.textAlign = 'center';
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);

            // Save resized background image
            const out = fs.createWriteStream(textImagePath);
            const stream = canvas.createPNGStream();
            stream.pipe(out);
            out.on('finish', () => {
                console.log('The PNG file was created.');
            });

            // Create intermediate directory if it doesn't exist
            const intermediateDir = '/home/kadir/Downloads/intermediate/';
            if (!fs.existsSync(intermediateDir)) {
                fs.mkdirSync(intermediateDir, { recursive: true });
            }

            // Get the duration of the video
            const duration = videoInfo.format.duration;

            // Calculate the start time for the text overlay (3 seconds before the end)
            const startTime = Math.max(0, duration - 3);

            // Execute FFmpeg command to overlay logo on video
            ffmpeg(videoPath)
                .input(logoPath)
                .complexFilter(`[0:v]scale=${videoWidth}:${videoHeight}[logo];[logo][1:v]overlay=${logoX}:${logoY}`)
                .output(path.join(intermediateDir, `${outputFilename}_logo.mp4`))
                .on('error', (err) => {
                    console.error('Error processing video with logo:', err);
                    reject(err);
                })
                .on('end', () => {
                    console.log('Overlaying logo on video finished successfully!');
                    // Execute FFmpeg command to overlay text image on video with logo
                    ffmpeg(path.join(intermediateDir, `${outputFilename}_logo.mp4`))
                        .input(textImagePath)
                        .complexFilter(`overlay=x=(main_w-overlay_w)/2:y=(main_h-overlay_h)/2:enable='gte(t,${startTime})'`)
                        .output(outputPath)
                        .on('error', (err) => {
                            console.error('Error processing video with text overlay:', err);
                            reject(err);
                        })
                        .on('end', () => {
                            console.log('Overlaying text on video finished successfully!');
                            resolve(outputFilename);
                        })
                        .run();
                })
                .run();
        } catch (error) {
            console.error('Error processing video:', error);
            reject(error);
        }
    });
}

module.exports = {
    processVideo
};
