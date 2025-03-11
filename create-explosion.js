// Simple script to create an explosion image
const fs = require('fs');
const path = require('path');

// Function to create a simple explosion image
function createExplosionImage() {
    // Create a canvas in memory
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext('2d');
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create a radial gradient for the explosion
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    
    // Add color stops for a fiery explosion
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.1, 'rgba(255, 255, 0, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 128, 0, 1)');
    gradient.addColorStop(0.6, 'rgba(255, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    // Fill the circle with the gradient
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some random "sparks" to make it more explosion-like
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * canvas.width / 2;
        const size = 2 + Math.random() * 4;
        
        const x = canvas.width / 2 + Math.cos(angle) * distance;
        const y = canvas.height / 2 + Math.sin(angle) * distance;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Convert the canvas to a PNG buffer
    const buffer = canvas.toBuffer('image/png');
    
    // Save the buffer to a file
    const outputPath = path.join('assets', 'images', 'explosion.png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Explosion image created at ${outputPath}`);
}

// Check if the canvas module is installed
try {
    require('canvas');
    createExplosionImage();
} catch (error) {
    console.error('The "canvas" module is not installed. Please install it with:');
    console.error('npm install canvas');
    
    // Create a fallback explosion image using a data URL
    console.log('Creating a fallback explosion image...');
    
    // Simple 1x1 pixel transparent PNG
    const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    
    const outputPath = path.join('assets', 'images', 'explosion.png');
    fs.writeFileSync(outputPath, transparentPixel);
    
    console.log(`Fallback explosion image created at ${outputPath}`);
} 