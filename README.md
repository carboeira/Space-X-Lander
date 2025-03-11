# Falcon Lander: SpaceX Arcade

An arcade-style game inspired by Lunar Lander but based on SpaceX landings. Control a Falcon 9 rocket and land it safely on various platforms across different space environments.

![Falcon Lander Game](screenshot.png)

## Game Features

- 2D side-scrolling gameplay with arcade-style physics
- Multiple landing zones with varying difficulty
- Fuel management system
- Various hazards like strong winds and moving platforms
- Scoring system based on landing accuracy, fuel efficiency, and speed
- Level progression with increasingly challenging landing sites
- Asteroid hazards in higher levels
- High score tracking
- Mobile touch controls for playing on mobile devices
- Visual wind indicator with particle effects
- Pause menu with game options
- Local storage for saving game progress
- Level completion tracking

## Development

This game is built using Phaser 3, a popular HTML5 game framework.

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open your browser and navigate to `(https://github.com/carboeira/Space-X-Lander/)`

Alternatively, you can run the setup script which will install dependencies and create placeholder assets:

```
./setup.sh
```

### Building for Production

To build the game for production:

```
npm run build
```

The built files will be in the `dist` directory.

## Controls

- Left/Right Arrow Keys: Rotate the rocket
- Up Arrow Key: Apply thrust
- Space: Restart level (after landing or crashing)
- P: Pause game
- Mobile: Touch controls available on mobile devices

## Game Mechanics

- **Fuel Management**: Monitor your fuel gauge. Once you run out, you can't apply thrust.
- **Wind Effects**: Wind will push your rocket, indicated by the wind direction and strength.
- **Landing Requirements**: Land slowly (< 50 velocity) and upright (< 3° tilt) to succeed.
- **Scoring**: Your score is based on landing velocity, remaining fuel, and level difficulty.
- **Asteroids**: In higher levels, avoid asteroid collisions which will destroy your rocket.
- **Moving Platforms**: Some levels feature moving landing platforms for added challenge.

## Adding Custom Assets

You can add your own custom sprites and sounds by placing them in the appropriate directories:

- Sprites: `src/assets/images/`
- Sounds: `src/assets/audio/`

Required image files:
- `falcon9.png` - The player's rocket sprite
- `platform.png` - The landing platform sprite
- `space-background.png` - The main background image
- `stars.png` - A tileable stars pattern for parallax effect
- `particles.png` - Particle texture for thruster and explosion effects
- `spacex-logo.png` - SpaceX logo for the loading screen
- `asteroid.png` - Asteroid hazard sprite

Required audio files:
- `thrust.mp3` - Rocket thruster sound
- `explosion.mp3` - Explosion sound for crash
- `success.mp3` - Success sound for landing
- `music.mp3` - Background music

If these files are not found, the game will generate placeholder assets automatically.

## License

MIT 
