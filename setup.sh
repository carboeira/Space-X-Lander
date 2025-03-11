#!/bin/bash

# Falcon Lander: SpaceX Arcade Setup Script

echo "Setting up Falcon Lander: SpaceX Arcade..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js before continuing."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm before continuing."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create placeholder asset files if they don't exist
echo "Creating placeholder asset files..."

# Create placeholder images
mkdir -p src/assets/images
touch src/assets/images/falcon9.png
touch src/assets/images/platform.png
touch src/assets/images/space-background.png
touch src/assets/images/stars.png
touch src/assets/images/particles.png
touch src/assets/images/spacex-logo.png

# Create placeholder audio files
mkdir -p src/assets/audio
touch src/assets/audio/thrust.mp3
touch src/assets/audio/explosion.mp3
touch src/assets/audio/success.mp3
touch src/assets/audio/music.mp3

echo "Setup complete! You can now start the development server with 'npm start'"
echo "Remember to replace the placeholder asset files with real assets before playing." 