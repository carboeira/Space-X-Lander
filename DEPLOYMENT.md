# Space X Lander - Deployment Instructions

This document provides instructions for deploying the Space X Lander game to your website.

## Deployment Package

The deployment package `space-x-lander-deploy.zip` contains all the necessary files to run the game on your website.

## Deployment Steps

1. **Extract the Files**: Unzip the `space-x-lander-deploy.zip` file.

2. **Upload to Your Web Server**: Upload all the extracted files and folders to your web server, maintaining the directory structure.

   - You can upload the files to the root directory of your website (e.g., `public_html`, `www`, or `htdocs`).
   - Alternatively, you can create a subdirectory (e.g., `games/space-x-lander/`) and upload the files there.

3. **File Structure**: Ensure the following structure is maintained on your server:
   ```
   your-upload-directory/
   ├── assets/
   │   ├── audio/
   │   │   ├── explosion.mp3
   │   │   ├── explosion.wav
   │   │   ├── music.mp3
   │   │   ├── music.wav
   │   │   ├── success.mp3
   │   │   ├── success.wav
   │   │   ├── thrust.mp3
   │   │   └── thrust.wav
   │   └── images/
   │       ├── spacex-logo.png
   │       └── spacex-logo.svg
   ├── index.html
   ├── index.js
   ├── index.js.map
   ├── spacex-logo.4ffffea1.png
   ├── src.77de5100.js
   ├── src.77de5100.js.map
   ├── src.8eca1349.js
   └── src.8eca1349.js.map
   ```

4. **Test the Deployment**: Navigate to the URL where you uploaded the files (e.g., `https://yourdomain.com/` or `https://yourdomain.com/games/space-x-lander/`) to ensure the game loads and runs correctly.

## Troubleshooting

If you encounter issues with the game:

1. **Check Browser Console**: Open your browser's developer tools (F12 or right-click and select "Inspect") and check the console for any error messages.

2. **File Permissions**: Ensure all files have the correct read permissions (typically 644 for files and 755 for directories).

3. **MIME Types**: Make sure your server is configured to serve the correct MIME types for the game files, especially for JavaScript and audio files.

4. **Cross-Origin Issues**: If you're experiencing cross-origin resource sharing (CORS) issues, you may need to configure your server to allow access to the game's resources.

## Embedding in an Existing Page

If you want to embed the game in an existing page on your website, you can use an iframe:

```html
<iframe src="path/to/game/index.html" width="800" height="600" frameborder="0" allowfullscreen></iframe>
```

Adjust the width and height as needed to match your game's dimensions.

## Additional Notes

- The game uses HTML5 and JavaScript, so it should work in all modern browsers.
- Mobile support may vary depending on the device and browser.
- For optimal performance, we recommend using Chrome, Firefox, or Edge. 