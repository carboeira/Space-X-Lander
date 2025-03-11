// @ts-nocheck
import Phaser from 'phaser';
import { Rocket } from '../objects/Rocket';
import { Platform } from '../objects/Platform';
import { GameUI } from '../objects/GameUI';
import { Asteroid } from '../objects/Asteroid';
import { getLevel, getMaxLevel } from '../config/levels';
import { Types } from 'phaser';

type ArcadeSprite = Types.Physics.Arcade.SpriteWithDynamicBody;
type ArcadeStaticSprite = Types.Physics.Arcade.SpriteWithStaticBody;

// @ts-ignore - Suppress type checking for the entire class
export class GameScene extends Phaser.Scene {
    private rocket!: Rocket;
    private platform!: Platform;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
    private flameParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
    private smokeParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
    private sparkParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
    private glowParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
    private thrustSound!: Phaser.Sound.BaseSound;
    private explosionSound!: Phaser.Sound.BaseSound;
    private successSound!: Phaser.Sound.BaseSound;
    private stars!: Phaser.GameObjects.TileSprite;
    private starsNear!: Phaser.GameObjects.TileSprite;
    private starsMid!: Phaser.GameObjects.TileSprite;
    private starsFar!: Phaser.GameObjects.TileSprite;
    private level: number = 1;
    private score: number = 0;
    private gameOver: boolean = false;
    private wind: number = 0;
    private gameUI!: GameUI;
    private asteroids: Asteroid[] = [];
    private soundsEnabled: boolean = true;
    private backgroundMusic!: Phaser.Sound.BaseSound;
    private groundCollider!: Phaser.Physics.Arcade.Collider;
    private ground!: Phaser.GameObjects.Rectangle;
    private debugMode: boolean = false;
    private keyHandlersAdded: boolean = false;
    private asteroidColliders: Phaser.Physics.Arcade.Collider[] = [];
    
    // Web Audio API properties
    private audioContext: AudioContext | null = null;
    private audioEnabled: boolean = false;
    private webAudioSounds: {[key: string]: any} = {};
    private messageText: Phaser.GameObjects.Text | null = null;
    private lastRocketX: number = 0;
    private lastRocketY: number = 0;

    constructor() {
        super('GameScene');
    }

    init(data: any): void {
        console.log('GameScene: init() called with data:', data);
        // Preserve score and level from previous run if available
        if (data) {
            if (data.level !== undefined) {
                this.level = data.level;
            }
            if (data.score !== undefined) {
                this.score = data.score;
            }
        }
        
        // Reset score if starting from level 1 (new game)
        if (this.level === 1) {
            this.score = 0;
        }
        
        // Reset game state
        this.gameOver = false;
        this.asteroids = [];
        this.asteroidColliders = [];
        this.keyHandlersAdded = false;
    }

    create(): void {
        console.log('GameScene: create() called for level', this.level);
        try {
            // Get level configuration first
            const levelConfig = getLevel(this.level);
            console.log('Level config:', levelConfig);
            
            // Ensure particle textures exist
            this.createParticleTextures();
            console.log('Particle textures created/verified');
            
            // Set up background
            const width = this.cameras.main.width;
            const height = this.cameras.main.height;
            
            // Add background with proper depth
            const background = this.add.image(width / 2, height / 2, levelConfig.background);
            background.setDepth(0);
            
            // Create parallax star layers for all levels
            // Far stars - slowest moving, darkest
            this.starsFar = this.add.tileSprite(width / 2, height / 2, width, height, 'stars-far');
            this.starsFar.setDepth(1);
            this.starsFar.setAlpha(0.3);
            
            // Mid stars - medium speed
            this.starsMid = this.add.tileSprite(width / 2, height / 2, width, height, 'stars-mid');
            this.starsMid.setDepth(2);
            this.starsMid.setAlpha(0.4);
            
            // Near stars - fastest moving, brightest
            this.starsNear = this.add.tileSprite(width / 2, height / 2, width, height, 'stars-near');
            this.starsNear.setDepth(3);
            this.starsNear.setAlpha(0.5);
            
            // Keep the original stars reference for compatibility
            this.stars = this.starsNear;
            
            // For non-space environments (levels < 21), reduce the visibility
            if (this.level < 21) {
                this.starsFar.setAlpha(0.1);
                this.starsMid.setAlpha(0.15);
                this.starsNear.setAlpha(0.2);
            }
            
            // Set up physics
            this.physics.world.setBounds(0, 0, width, height);
            this.physics.world.gravity.y = levelConfig.gravity;
            this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
                if (body.gameObject === this.rocket) {
                    this.handleCrash(this.rocket);
                }
            });
            console.log('Physics gravity set to:', this.physics.world.gravity.y);
            
            // Set up particles with different textures for enhanced visual effects
            // In Phaser 3.60+, add.particles returns a ParticleEmitter directly
            console.log('Creating particle emitters with textures:');
            
            // @ts-ignore
            this.particles = this.add.particles(0, 0, 'particles', {
                frequency: -1, // Don't emit automatically
                lifespan: 500,
                gravityY: 0,
                scale: { start: 0.1, end: 0 }, // 80% smaller
                alpha: { start: 1, end: 0 },
                blendMode: 'ADD',
                emitCallback: (particle: Phaser.GameObjects.Particles.Particle) => {
                    // Set particle direction based on rocket rotation
                    // @ts-ignore
                    if (this.rocket) {
                        const angle = this.rocket.rotation + Math.PI / 2; // Point away from engine
                        const speed = Phaser.Math.Between(20, 40);
                        particle.velocityX = Math.cos(angle) * speed;
                        particle.velocityY = Math.sin(angle) * speed;
                    }
                }
            });
            this.particles.setDepth(5);
            
            // Create specialized particle emitters for different effects with more explicit configuration
            this.flameParticles = this.add.particles(0, 0, 'flame-particle', {
                frequency: -1, // Don't emit automatically
                lifespan: { min: 400, max: 600 }, // Variable lifespan for more dynamic effect
                gravityY: 0,
                scale: { start: 0.3, end: 0 }, // Larger start scale for more visible flame
                alpha: { start: 0.9, end: 0 },
                blendMode: 'ADD',
                speed: { min: 40, max: 80 }, // Increased speed for more dramatic effect
                quantity: 2, // Emit more particles at once
                tint: [0xffff00, 0xff9900, 0xff5500, 0xff3300], // Enhanced Falcon 9 Merlin engine colors
                emitCallback: (particle: Phaser.GameObjects.Particles.Particle) => {
                    // Set particle direction based on rocket rotation
                    // @ts-ignore
                    if (this.rocket) {
                        const angle = this.rocket.rotation + Math.PI / 2; // Point away from engine
                        const speed = Phaser.Math.Between(40, 80);
                        particle.velocityX = Math.cos(angle) * speed;
                        particle.velocityY = Math.sin(angle) * speed;
                        
                        // Add slight random variation to make flame look more natural
                        const angleVariation = Phaser.Math.FloatBetween(-0.2, 0.2);
                        const finalAngle = angle + angleVariation;
                        particle.velocityX = Math.cos(finalAngle) * speed;
                        particle.velocityY = Math.sin(finalAngle) * speed;
                    }
                }
            });
            this.flameParticles.setDepth(5);
            console.log('Flame particles created with texture:', this.flameParticles.texture.key);
            
            // Test direct emission of particles
            for (let i = 0; i < 20; i++) {
                this.flameParticles.setPosition(
                    this.cameras.main.width / 2, 
                    this.cameras.main.height / 2
                );
                this.flameParticles.emitParticle();
            }
            
            this.smokeParticles = this.add.particles(0, 0, 'smoke-particle', {
                frequency: -1, // Don't emit automatically
                lifespan: { min: 800, max: 1200 }, // Variable lifespan for more dynamic effect
                gravityY: -10, // Increased upward drift for better smoke effect
                scale: { start: 0.1, end: 0.4 }, // Larger end scale for more visible smoke trail
                alpha: { start: 0.6, end: 0 },
                blendMode: 'NORMAL',
                speed: { min: 15, max: 30 }, // Increased speed for better trail
                quantity: 1,
                tint: [0xdddddd, 0xaaaaaa, 0x888888, 0x666666], // Enhanced smoke colors
                emitCallback: (particle: Phaser.GameObjects.Particles.Particle) => {
                    // Set particle direction based on rocket rotation
                    // @ts-ignore
                    if (this.rocket) {
                        const angle = this.rocket.rotation + Math.PI / 2; // Point away from engine
                        const speed = Phaser.Math.Between(15, 30);
                        
                        // Add more random variation to smoke for natural dispersion
                        const angleVariation = Phaser.Math.FloatBetween(-0.4, 0.4);
                        const finalAngle = angle + angleVariation;
                        particle.velocityX = Math.cos(finalAngle) * speed;
                        particle.velocityY = Math.sin(finalAngle) * speed;
                        
                        // Add slight random tint variation for more realistic smoke
                        const grayValue = Phaser.Math.Between(120, 200);
                        particle.tint = Phaser.Display.Color.GetColor(grayValue, grayValue, grayValue);
                    }
                }
            });
            this.smokeParticles.setDepth(4);
            
            this.sparkParticles = this.add.particles(0, 0, 'spark-particle', {
                frequency: -1, // Don't emit automatically
                lifespan: { min: 300, max: 500 }, // Variable lifespan for more dynamic effect
                gravityY: 20, // Add slight downward gravity for more realistic sparks
                scale: { start: 0.15, end: 0 }, // Larger start scale for more visible sparks
                alpha: { start: 1, end: 0 },
                blendMode: 'ADD',
                speed: { min: 50, max: 100 }, // Increased speed for more dramatic effect
                quantity: 1,
                tint: [0xffff00, 0xffaa00, 0xff8800, 0xffffff], // Enhanced spark colors
                emitCallback: (particle: Phaser.GameObjects.Particles.Particle) => {
                    // Set particle direction based on rocket rotation with more randomness
                    // @ts-ignore
                    if (this.rocket) {
                        const angle = this.rocket.rotation + Math.PI / 2;
                        // Add significant random variation for sparks
                        const angleVariation = Phaser.Math.FloatBetween(-0.8, 0.8);
                        const finalAngle = angle + angleVariation;
                        const speed = Phaser.Math.Between(50, 100);
                        particle.velocityX = Math.cos(finalAngle) * speed;
                        particle.velocityY = Math.sin(finalAngle) * speed;
                        
                        // Randomly select a bright color for the spark
                        const colors = [0xffff00, 0xffaa00, 0xff8800, 0xffffff];
                        particle.tint = colors[Math.floor(Math.random() * colors.length)];
                    }
                }
            });
            this.sparkParticles.setDepth(6);
            
            this.glowParticles = this.add.particles(0, 0, 'glow-particle', {
                frequency: -1, // Don't emit automatically
                lifespan: { min: 200, max: 400 }, // Variable lifespan for more dynamic effect
                gravityY: 0,
                scale: { start: 0.3, end: 0.1 }, // Larger scale for more visible glow
                alpha: { start: 0.6, end: 0 }, // Increased alpha for more visible glow
                blendMode: 'ADD',
                speed: { min: 1, max: 5 }, // Slower speed for glow effect
                quantity: 1,
                tint: [0xffaa00, 0xff8800, 0xff6600, 0xff4400], // Enhanced glow colors
                emitCallback: (particle: Phaser.GameObjects.Particles.Particle) => {
                    // Set particle direction based on rocket rotation
                    // @ts-ignore
                    if (this.rocket) {
                        const angle = this.rocket.rotation + Math.PI / 2; // Point away from engine
                        
                        // Add minimal random variation for glow
                        const angleVariation = Phaser.Math.FloatBetween(-0.1, 0.1);
                        const finalAngle = angle + angleVariation;
                        const speed = Phaser.Math.Between(1, 5);
                        particle.velocityX = Math.cos(finalAngle) * speed;
                        particle.velocityY = Math.sin(finalAngle) * speed;
                        
                        // Randomly select a glow color
                        const colors = [0xffaa00, 0xff8800, 0xff6600, 0xff4400];
                        particle.tint = colors[Math.floor(Math.random() * colors.length)];
                    }
                }
            });
            this.glowParticles.setDepth(3);
            
            // Set up audio with proper unlock handling
            this.setupAudio();
            
            // Create rocket first (above everything else)
            this.rocket = new Rocket(
                this,
                this.cameras.main.width / 2,
                50,
                'rocket',
                {
                    main: this.particles,
                    flame: this.flameParticles,
                    smoke: this.smokeParticles,
                    spark: this.sparkParticles,
                    glow: this.glowParticles
                },
                this.thrustSound,
                levelConfig.fuelCapacity
            );
            this.rocket.setDepth(10);
            
            // Test direct emission of particles from the rocket position
            this.time.delayedCall(500, () => {
                console.log('Testing direct particle emission');
                // Position emitters at the rocket's position
                const rocketX = this.rocket.x;
                const rocketY = this.rocket.y + this.rocket.height / 2;
                
                this.flameParticles.setPosition(rocketX, rocketY);
                this.smokeParticles.setPosition(rocketX, rocketY);
                this.sparkParticles.setPosition(rocketX, rocketY);
                this.glowParticles.setPosition(rocketX, rocketY);
                
                // Emit particles directly
                for (let i = 0; i < 20; i++) {
                    this.flameParticles.emitParticle();
                    this.smokeParticles.emitParticle();
                    this.sparkParticles.emitParticle();
                    this.glowParticles.emitParticle();
                }
            });
            
            // Listen for rocket crash events
            this.events.on('rocketCrash', (data: { velocity: number, angle: number, reason: string }) => {
                this.handleCrash(this.rocket);
            });
            
            // Enable physics on rocket and set up collisions
            const rocketBody = this.rocket.body as Phaser.Physics.Arcade.Body;
            if (rocketBody) {
                rocketBody.setCollideWorldBounds(true);
                rocketBody.setBounce(0); // No bounce at all
                rocketBody.setDrag(0.1); // Match the drag in Rocket class for consistency
                rocketBody.setAngularDrag(0.9); // Match the angular drag in Rocket class
                // Don't set individual gravity, use world gravity
            }
            
            // Create platform with proper texture
            this.platform = new Platform(
                this, 
                Phaser.Math.Between(100, width - 100), 
                height - 20, // Changed from 50 to 20 to position platform closer to the bottom
                levelConfig.platformTexture
            );
            this.platform.setDepth(3);
            
            // Make the platform smaller to increase difficulty (60% of original size)
            const platformScale = 0.6;
            this.platform.setScale(platformScale);
            
            // Set up controls with null check
            if (this.input.keyboard) {
                this.cursors = this.input.keyboard.createCursorKeys();
                console.log('Keyboard controls initialized');
                
                // Add key handlers
                this.input.keyboard.on('keydown-D', () => {
                    this.toggleDebugMode();
                });
            } else {
                console.warn('Keyboard input not available');
            }
            
            // Set a more precise collision box for the platform
            const platformBody = this.platform.body as Phaser.Physics.Arcade.StaticBody;
            if (platformBody) {
                // Make the collision box slightly smaller than the visual platform
                const margin = 5;
                // Update collision box to match the new scaled size
                const scaledWidth = this.platform.width * platformScale;
                const scaledHeight = this.platform.height * platformScale;
                platformBody.setSize(scaledWidth - margin * 2, scaledHeight - margin);
                platformBody.setOffset(margin, 0);
            }
            
            // Create invisible ground for collision detection with proper color
            this.ground = this.add.rectangle(width / 2, height - 1, width, 2, levelConfig.groundColor);
            this.ground.setAlpha(this.debugMode ? 0.5 : 0);
            this.ground.setDepth(2);
            this.physics.add.existing(this.ground, true);
            
            // Now set up all collisions after objects are created
            
            // Platform collision
            this.physics.add.overlap(
                this.rocket,
                this.platform,
                (rocketObj, platformObj) => {
                    const rocket = rocketObj as ArcadeSprite;
                    const platform = platformObj as ArcadeStaticSprite;
                    const rocketBody = rocket.body as Phaser.Physics.Arcade.Body;
                    
                    // Check if the rocket is landing (moving downward)
                    if (rocketBody && rocketBody.velocity.y > 0) {
                        this.handleLanding(rocket, platform);
                    }
                },
                undefined,
                this
            );
            
            // Ground collision
            this.physics.add.overlap(
                this.rocket,
                this.ground,
                () => {
                    const platformLeft = this.platform.x - this.platform.width / 2;
                    const platformRight = this.platform.x + this.platform.width / 2;
                    
                    if (this.rocket.x < platformLeft || this.rocket.x > platformRight) {
                        this.handleCrash(this.rocket);
                    }
                },
                undefined,
                this
            );

            // Additional ground collider for physics
            this.groundCollider = this.physics.add.collider(
                this.rocket,
                this.ground,
                () => {
                    const platformLeft = this.platform.x - this.platform.width / 2;
                    const platformRight = this.platform.x + this.platform.width / 2;
                    
                    if (this.rocket.x < platformLeft || this.rocket.x > platformRight) {
                        this.handleCrash(this.rocket);
                    }
                },
                undefined,
                this
            );
            
            // Set up UI
            this.gameUI = new GameUI(this);
            this.gameUI.updateLevel(this.level);
            this.gameUI.updateScore(this.score);
            
            // Set wind for the level
            this.setWindForLevel(levelConfig);
            
            // Create asteroids if needed
            if (levelConfig.asteroids) {
                this.createAsteroids(levelConfig.asteroidCount);
            }
            
            // Start platform moving if needed
            if (levelConfig.platformMoving) {
                this.platform.startMoving(levelConfig.platformSpeed, width);
            }
            
            // Add level title
            const levelTitle = this.add.text(width / 2, 100, `LEVEL ${this.level}: ${levelConfig.name}`, {
                font: '24px monospace',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { left: 10, right: 10, top: 5, bottom: 5 }
            });
            levelTitle.setOrigin(0.5);
            levelTitle.setDepth(10);
            levelTitle.setAlpha(0.8); // Make it more visible
            
            // Make the level title fade out after a few seconds
            this.tweens.add({
                targets: levelTitle,
                alpha: 0,
                duration: 2000,
                delay: 4000, // Longer delay to ensure player sees the level info
                ease: 'Power2'
            });
            
            // Set up key handlers
            this.setupKeyHandlers();
            
            // Enable physics debug if in debug mode
            this.physics.world.drawDebug = this.debugMode;
            if (!this.debugMode) {
                this.physics.world.debugGraphic.clear();
            }
            
            // Add click/tap handler for audio unlock
            this.input.on('pointerdown', () => {
                if (this.sound.locked) {
                    console.log('Attempting to unlock audio...');
                    this.sound.unlock();
                }
            });
            
            console.log('GameScene: create() completed successfully');
        } catch (error) {
            console.error('Error in GameScene.create():', error);
        }
    }
    
    private setupKeyHandlers(): void {
        if (this.keyHandlersAdded || !this.input?.keyboard) return;
        
        const keyboard = this.input.keyboard;
        
        // Add debug mode toggle
        keyboard.on('keydown-D', () => {
            this.toggleDebugMode();
        });
        
        // Set up collision detection for world bounds
        this.physics.world.on('worldbounds', this.handleWorldBoundsCollision, this);
        
        this.keyHandlersAdded = true;
    }

    // @ts-ignore
    update(time: number, delta: number): void {
        if (this.gameOver) {
            return;
        }
        
        try {
            // Handle rotation with smoother control
            if (this.cursors.left.isDown) {
                this.rocket.setAngularVelocity(-40);
            } else if (this.cursors.right.isDown) {
                this.rocket.setAngularVelocity(40);
            } else {
                // Apply stronger damping to angular velocity for more precise control
                const rocketBody = this.rocket.body as Phaser.Physics.Arcade.Body;
                if (rocketBody && rocketBody.angularVelocity !== undefined && Math.abs(rocketBody.angularVelocity) > 0) {
                    this.rocket.setAngularVelocity(rocketBody.angularVelocity * 0.8);
                } else {
                    this.rocket.setAngularVelocity(0);
                }
            }
            
            // Apply thrust with debug logging
            if (this.cursors.up.isDown && this.rocket.getFuel() > 0) {
                this.rocket.applyThrust();
                
                // Debug particle emitters every 1 second
                if (Math.floor(time / 1000) % 2 === 0 && Math.floor(time) % 1000 < 20) {
                    this.debugParticleEmitters();
                }
            } else {
                this.rocket.stopThrust();
            }
            
            // Call the rocket's update method to update engine fire position
            this.rocket.update(time, delta);
            
            // Debug rocket state
            const rocketBody = this.rocket.body as Phaser.Physics.Arcade.Body;
            if (rocketBody) {
                console.log('Rocket state:', {
                    x: this.rocket.x,
                    y: this.rocket.y,
                    angle: this.rocket.angle,
                    velocityX: rocketBody.velocity.x,
                    velocityY: rocketBody.velocity.y,
                    angularVelocity: rocketBody.angularVelocity,
                    gravity: this.physics.world.gravity.y
                });
            }
            
            // Update parallax star layers
            // Store current rocket position for parallax effect
            const currentX = this.rocket.x;
            const currentY = this.rocket.y;
            
            // Calculate movement delta
            const deltaX = currentX - this.lastRocketX;
            const deltaY = currentY - this.lastRocketY;
            
            // Update star positions with parallax effect
            // Far stars move slowest (distant background)
            this.starsFar.tilePositionX += 0.2 + (deltaX * 0.01);
            this.starsFar.tilePositionY += deltaY * 0.01;
            
            // Mid stars move at medium speed
            this.starsMid.tilePositionX += 0.3 + (deltaX * 0.03);
            this.starsMid.tilePositionY += deltaY * 0.02;
            
            // Near stars move fastest (closest to camera)
            this.starsNear.tilePositionX += 0.5 + (deltaX * 0.05);
            this.starsNear.tilePositionY += deltaY * 0.03;
            
            // Update last position for next frame
            this.lastRocketX = currentX;
            this.lastRocketY = currentY;
            
            // Apply wind force
            if (this.rocket.body) {
                this.rocket.body.velocity.x += this.wind * 0.01; // Very subtle wind effect
            }
            
            // Update fuel bar
            this.gameUI.updateFuelBar(this.rocket.getFuelPercentage());
            
            // Update asteroids
            this.asteroids.forEach(asteroid => asteroid.update());
            
            // Check for asteroid collisions manually
            this.checkAsteroidCollisions();
            
            // Update stats in UI
            if (this.rocket.body) {
                this.gameUI.updateStats(
                    this.rocket.body.velocity.x,
                    this.rocket.body.velocity.y,
                    this.rocket.angle,
                    this.rocket.getFuel()
                );
            }
            
            // Check if out of fuel and not moving
            if (this.rocket.getFuel() <= 0 && 
                this.rocket.body && 
                Math.abs(this.rocket.body.velocity.x) < 5 && 
                Math.abs(this.rocket.body.velocity.y) < 5) {
                this.handleCrash(this.rocket);
            }
            
            // More aggressive ground collision check
            if (this.rocket.body) {
                const rocketBottom = this.rocket.y + this.rocket.height / 2;
                const groundY = this.cameras.main.height - 2; // Changed from 10 to 2 to allow rocket to get closer to the bottom
                const platformLeft = this.platform.x - this.platform.width / 2;
                const platformRight = this.platform.x + this.platform.width / 2;
                
                // Check for ground collision
                if (rocketBottom >= groundY) {
                    // If we're not over the platform, immediate crash
                    if (this.rocket.x < platformLeft || this.rocket.x > platformRight) {
                        this.handleCrash(this.rocket);
                        return;
                    }
                    
                    // If we are over the platform, check landing conditions
                    const angle = Math.abs(this.rocket.angle % 360);
                    const isVertical = (angle <= 3 || angle >= 357); // Reduced from 5 to 3 degrees
                    
                    if (!isVertical) {
                        this.handleCrash(this.rocket);
                        return;
                    }
                    
                    if (this.rocket.body.velocity.y > 50) {
                        this.handleCrash(this.rocket);
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Error in update:', error);
        }
    }

    private handleLanding(rocket: ArcadeSprite, platform: ArcadeStaticSprite): void {
        if (this.gameOver) return;
        
        try {
            // Check landing conditions
            const landingVelocity = Math.abs(rocket.body.velocity.y);
            const angle = Math.abs(rocket.angle % 360);
            // Make landing criteria more strict
            const isVertical = (angle <= 3 || angle >= 357); // Reduced from 5 to 3 degrees
            const isSlowLanding = landingVelocity < 50; // Reduced from 150 to 50 for much more precise landings
            
            if (!isVertical) {
                this.handleCrash(this.rocket);
                return;
            }
            
            if (!isSlowLanding) {
                this.handleCrash(this.rocket);
                return;
            }
            
            console.log('Successful landing!');
            
            // Play landing sound
            if (this.audioEnabled) {
                if (this.webAudioSounds && this.webAudioSounds.createLandingSound) {
                    console.log('Creating landing sound for successful landing');
                    this.webAudioSounds.createLandingSound();
                } else if (this.sound.get('success')) {
                    console.log('Playing Phaser success sound');
                    this.sound.play('success', { volume: 0.5 });
                } else {
                    console.log('No landing sound available');
                }
            }
            
            // Reset physics state
            rocket.body.velocity.set(0, 0);
            rocket.body.angularVelocity = 0;
            rocket.angle = 0;
            rocket.body.allowGravity = false;  // Use property instead of method
            
            // Calculate the relative position from the platform's center
            const relativeX = rocket.x - platform.x;
            
            // Update function to keep rocket attached to platform
            this.time.addEvent({
                delay: 16,
                callback: () => {
                    if (this.gameOver) {
                        return;
                    }
                    
                    // Keep the rocket at the same relative position on the platform
                    rocket.x = platform.x + relativeX;
                    rocket.y = platform.y - rocket.height / 2;
                },
                callbackScope: this,
                loop: true
            });
            
            // Show success message
            this.showMessage('LANDED!', 0x00ff00);
            
            // Disable controls
            this.controlsEnabled = false;
            
            // Calculate score based on landing velocity, fuel remaining, and level
            const fuelBonus = this.rocket.getFuel();
            const velocityBonus = 100 - landingVelocity;
            const levelBonus = this.level * 10;
            const angleBonus = 50 - Math.abs(rocket.angle) * 10;
            
            const landingScore = Math.floor(fuelBonus + velocityBonus + levelBonus + angleBonus);
            this.score += landingScore;
            this.gameUI.updateScore(this.score);
            
            // Advance to next level or end game
            this.time.delayedCall(2000, () => {
                if (this.level < getMaxLevel()) {
                    this.level++;
                    this.scene.restart({ level: this.level, score: this.score });
                } else {
                    // Game completed
                    this.scene.start('GameOverScene', {
                        score: this.score,
                        success: true,
                        reason: 'Mission Completed!',
                        level: this.level
                    });
                }
            });
        } catch (error) {
            console.error('Error in handleLanding:', error);
        }
    }
    
    private handleCrash(rocket: Rocket): void {
        if (rocket.crashed) return; // Prevent multiple crash handling
        
        console.log('Rocket crashed');
        
        // Set rocket state
        rocket.crashed = true;
        
        // Play explosion sound
        if (this.audioEnabled) {
            if (this.webAudioSounds && this.webAudioSounds.createExplosion) {
                console.log('Creating explosion sound for crash');
                this.webAudioSounds.createExplosion();
            } else if (this.sound.get('explosion')) {
                console.log('Playing Phaser explosion sound');
                this.sound.play('explosion', { volume: 0.7 });
            } else {
                console.log('No explosion sound available');
            }
        }
        
        // Create explosion effect
        this.createExplosion(rocket.x, rocket.y);
        
        // Stop any ongoing sounds
        if (rocket.thrustSound && rocket.thrustSound.isPlaying) {
            rocket.thrustSound.stop();
        }
        
        // Stop thrust sound if using Web Audio API
        if (this.webAudioSounds && this.webAudioSounds.thrust) {
            const thrustSounds = this.webAudioSounds.thrust;
            
            // Immediately stop all thrust sound components
            if (thrustSounds.masterGain && thrustSounds.masterGain.gain) {
                thrustSounds.masterGain.gain.setValueAtTime(0, this.audioContext?.currentTime || 0);
            }
            
            if (thrustSounds.sawGain && thrustSounds.sawGain.gain) {
                thrustSounds.sawGain.gain.setValueAtTime(0, this.audioContext?.currentTime || 0);
            }
            
            if (thrustSounds.squareGain && thrustSounds.squareGain.gain) {
                thrustSounds.squareGain.gain.setValueAtTime(0, this.audioContext?.currentTime || 0);
            }
            
            if (thrustSounds.triangleGain && thrustSounds.triangleGain.gain) {
                thrustSounds.triangleGain.gain.setValueAtTime(0, this.audioContext?.currentTime || 0);
            }
            
            if (thrustSounds.noiseGain && thrustSounds.noiseGain.gain) {
                thrustSounds.noiseGain.gain.setValueAtTime(0, this.audioContext?.currentTime || 0);
            }
        }
        
        // Show crash message
        this.showMessage('CRASHED!', 0xff0000);
        
        // Disable controls
        this.controlsEnabled = false;
        
        // Set game over state
        this.gameOver = true;
        
        // Wait a moment before going to game over scene
        this.time.delayedCall(2000, () => {
            // Clean up audio before transitioning
            this.stopAllAudioSounds();
            
            // Go to game over scene with relevant data
            this.scene.start('GameOverScene', {
                score: this.score,
                success: false,
                reason: 'Rocket crashed!',
                level: this.level
            });
        });
    }
    
    private handleWorldBoundsCollision(body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean, left: boolean, right: boolean): void {
        // Only handle collisions for the rocket
        if (body.gameObject !== this.rocket) {
            return;
        }
        
        // If the rocket hits the top of the screen, stop upward velocity
        if (up) {
            body.velocity.y = 0;
            console.log('Hit top boundary, stopping upward velocity');
            
            // Play a soft collision sound for top boundary
            if (this.audioEnabled && this.audioContext) {
                this.playBounceSound(0.3);
            }
        }
        
        // If the rocket hits the bottom of the screen, it's a crash
        if (down) {
            // Sound will be played by handleCrash
            this.handleCrash(this.rocket);
        }
        
        // If the rocket hits the sides, stop horizontal velocity
        if (left || right) {
            body.velocity.x = 0;
            console.log('Hit side boundary, stopping horizontal velocity');
            
            // Play a soft collision sound for side boundary
            if (this.audioEnabled && this.audioContext) {
                this.playBounceSound(0.3);
            }
        }
    }
    
    // Helper method to play a bounce sound
    private playBounceSound(volume: number = 0.3): void {
        if (!this.audioContext) return;
        
        try {
            // Create a short bounce sound
            const bounceOsc = this.audioContext.createOscillator();
            bounceOsc.type = 'sine';
            bounceOsc.frequency.setValueAtTime(150, this.audioContext.currentTime);
            bounceOsc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
            
            const bounceGain = this.audioContext.createGain();
            bounceGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
            bounceGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
            
            // Connect to master gain if available
            if (this.webAudioSounds.masterGain) {
                bounceOsc.connect(bounceGain);
                bounceGain.connect(this.webAudioSounds.masterGain);
            } else {
                bounceOsc.connect(bounceGain);
                bounceGain.connect(this.audioContext.destination);
            }
            
            // Play the sound
            bounceOsc.start();
            bounceOsc.stop(this.audioContext.currentTime + 0.2);
            
            // Clean up
            setTimeout(() => {
                bounceGain.disconnect();
            }, 200);
        } catch (error) {
            console.error('Error playing bounce sound:', error);
        }
    }

    private setWindForLevel(levelConfig: any): void {
        // Adjust wind based on level range
        if (this.level <= 10) {
            // Ocean Landing (1-10): Gradually increasing wind
            const levelInRange = this.level;
            const windFactor = levelInRange / 10; // 0.1 to 1.0
            const minWind = Math.max(-5, levelConfig.windRange[0] * windFactor);
            const maxWind = Math.min(5, levelConfig.windRange[1] * windFactor);
            this.wind = Phaser.Math.Between(minWind, maxWind);
        } else if (this.level <= 20) {
            // Mountain Peak (11-20): Strong winds
            const minWind = Math.max(-8, levelConfig.windRange[0]);
            const maxWind = Math.min(8, levelConfig.windRange[1]);
            this.wind = Phaser.Math.Between(minWind, maxWind);
        } else if (this.level <= 30) {
            // Lunar Landing (21-30): No wind
            this.wind = 0;
        } else if (this.level <= 40) {
            // Space Station (31-40): No wind
            this.wind = 0;
        } else {
            // Mars Landing (41-50): Strong dust storms
            const minWind = Math.max(-10, levelConfig.windRange[0]);
            const maxWind = Math.min(10, levelConfig.windRange[1]);
            this.wind = Phaser.Math.Between(minWind, maxWind);
        }
        
        this.gameUI.updateWind(this.wind);
        console.log('Wind set to:', this.wind);
    }
    
    private createAsteroids(count: number): void {
        // Clear any existing asteroids and colliders
        this.asteroids.forEach(asteroid => asteroid.destroy());
        this.asteroids = [];
        this.asteroidColliders.forEach(collider => collider.destroy());
        this.asteroidColliders = [];
        
        // Create new asteroids
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(50, this.cameras.main.width - 50);
            const y = Phaser.Math.Between(50, this.cameras.main.height - 200);
            
            const asteroid = new Asteroid(this, x, y);
            asteroid.setCircle(asteroid.width / 3, asteroid.width / 3, asteroid.height / 3);
            this.asteroids.push(asteroid);
            
            // Set up collision with rocket using overlap for more precise detection
            const collider = this.physics.add.overlap(
                this.rocket, 
                asteroid,
                (rocketObj, asteroidObj) => {
                    const rocket = rocketObj as ArcadeSprite;
                    const asteroid = asteroidObj as ArcadeSprite;
                    
                    // Calculate distance for collision
                    const dx = rocket.x - asteroid.x;
                    const dy = rocket.y - asteroid.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Use a simpler collision check based on sprite dimensions
                    const collisionRadius = (rocket.width + asteroid.width) * 0.25;
                    
                    if (distance < collisionRadius) {
                        this.handleAsteroidCollision(this.rocket, asteroid);
                    }
                },
                undefined,
                this
            );
            
            this.asteroidColliders.push(collider);
        }
        
        console.log(`Created ${count} asteroids with precise collision detection`);
    }
    
    private checkAsteroidCollisions(): void {
        if (!this.rocket || !this.asteroids?.length) return;
        
        const rocketSprite = this.rocket as Phaser.GameObjects.Sprite & { body: Phaser.Physics.Arcade.Body };
        if (!rocketSprite || !rocketSprite.body) return;
        
        for (const asteroid of this.asteroids) {
            if (!asteroid) continue;
            
            const asteroidSprite = asteroid as Phaser.GameObjects.Sprite & { body: Phaser.Physics.Arcade.Body };
            if (!asteroidSprite || !asteroidSprite.body) continue;
            
            // Use direct position comparison instead of getBounds for better performance
            const dx = rocketSprite.x - asteroidSprite.x;
            const dy = rocketSprite.y - asteroidSprite.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Use a simpler collision check based on sprite dimensions
            const collisionRadius = (rocketSprite.width + asteroidSprite.width) * 0.25; // Adjust this value for desired collision sensitivity
            
            if (distance < collisionRadius) {
                this.handleAsteroidCollision(this.rocket, asteroid);
                return;
            }
        }
    }
    
    private handleAsteroidCollision(rocket: Rocket, asteroid: Asteroid): void {
        console.log('Asteroid collision detected');
        
        // Play explosion sound
        if (this.audioEnabled) {
            if (this.webAudioSounds && this.webAudioSounds.createExplosion) {
                // Use Web Audio API for explosion sound
                console.log('Calling createExplosion for asteroid collision');
                const explosion = this.webAudioSounds.createExplosion();
                console.log('Explosion created:', !!explosion);
            } else if (this.sound.get('explosion')) {
                // Fallback to Phaser sound
                console.log('Playing Phaser explosion sound');
                this.sound.play('explosion', { volume: 0.5 });
            } else {
                console.log('No explosion sound available');
            }
        } else {
            console.log('Audio not enabled, skipping explosion sound');
        }
        
        // Create explosion effect
        this.createExplosion(rocket.x, rocket.y);
        
        // Handle crash
        this.handleCrash(rocket);
    }
    
    private toggleDebugMode(): void {
        try {
            this.debugMode = !this.debugMode;
            
            // Toggle physics debug
            this.physics.world.drawDebug = this.debugMode;
            this.physics.world.debugGraphic.clear();
            
            // Toggle ground visibility
            this.ground.setAlpha(this.debugMode ? 0.5 : 0);
            
            // Show message
            const debugText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                this.debugMode ? 'DEBUG MODE ON' : 'DEBUG MODE OFF',
                {
                    font: '24px monospace',
                    color: this.debugMode ? '#00ffff' : '#ff00ff',
                    backgroundColor: '#000000',
                    padding: { left: 10, right: 10, top: 5, bottom: 5 }
                }
            );
            debugText.setOrigin(0.5);
            debugText.setDepth(20);
            
            // Fade out the message
            this.tweens.add({
                targets: debugText,
                alpha: 0,
                duration: 1000,
                delay: 1000,
                onComplete: () => {
                    debugText.destroy();
                }
            });
        } catch (error) {
            console.error('Error toggling debug mode:', error);
        }
    }
    
    shutdown(): void {
        if (this.input?.keyboard) {
            this.input.keyboard.off('keydown-D');
        }
        
        this.physics.world.off('worldbounds', this.handleWorldBoundsCollision, this);
        
        // Clean up colliders
        if (this.groundCollider) {
            this.groundCollider.destroy();
        }
        
        // Clean up asteroid colliders
        this.asteroidColliders.forEach(collider => {
            if (collider) collider.destroy();
        });
        this.asteroidColliders = [];
        
        // Clean up Web Audio API resources
        this.stopAllAudioSounds();
        
        // Remove input listeners
        this.input.off('pointerdown');
    }
    
    // Helper method to stop all audio sounds
    private stopAllAudioSounds(): void {
        try {
            // Stop background music
            if (this.webAudioSounds.backgroundMusic) {
                const { nodes } = this.webAudioSounds.backgroundMusic;
                if (nodes && Array.isArray(nodes)) {
                    nodes.forEach(node => {
                        if (node.oscillator) {
                            try {
                                node.oscillator.stop();
                                node.oscillator.disconnect();
                            } catch (e) {
                                console.error('Error stopping oscillator:', e);
                            }
                        }
                    });
                }
            }
            
            // Stop thrust sound
            if (this.webAudioSounds.thrust) {
                if (this.webAudioSounds.thrust.oscillator) {
                    try {
                        this.webAudioSounds.thrust.oscillator.stop();
                        this.webAudioSounds.thrust.oscillator.disconnect();
                    } catch (e) {
                        console.error('Error stopping thrust oscillator:', e);
                    }
                }
                
                if (this.webAudioSounds.thrust.lfo) {
                    try {
                        this.webAudioSounds.thrust.lfo.stop();
                        this.webAudioSounds.thrust.lfo.disconnect();
                    } catch (e) {
                        console.error('Error stopping thrust LFO:', e);
                    }
                }
            }
            
            // Disconnect master gain
            if (this.webAudioSounds.masterGain) {
                try {
                    this.webAudioSounds.masterGain.disconnect();
                } catch (e) {
                    console.error('Error disconnecting master gain:', e);
                }
            }
            
            // Clear all references
            this.webAudioSounds = {};
            
            console.log('All audio sounds stopped successfully');
        } catch (error) {
            console.error('Error stopping audio sounds:', error);
        }
    }

    private setupAudio(): void {
        try {
            console.log('Setting up audio in GameScene');
            
            // Create Web Audio API context if it doesn't exist
            if (!this.audioContext) {
                // @ts-ignore - AudioContext might not be available in all browsers
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('Created new AudioContext:', this.audioContext.state);
            }
            
            if (this.audioContext) {
                // Resume the audio context if it's suspended
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume().then(() => {
                        console.log('AudioContext resumed in GameScene');
                    }).catch(err => {
                        console.error('Failed to resume AudioContext in GameScene:', err);
                    });
                }
                
                // Create master gain node
                const masterGain = this.audioContext.createGain();
                masterGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
                masterGain.connect(this.audioContext.destination);
                console.log('Created master gain node');
                
                // Store reference to master gain
                this.webAudioSounds.masterGain = masterGain;
                
                // Create sound effects using Web Audio API
                console.log('Calling createSoundEffects');
                this.createSoundEffects(masterGain);
                
                // Mark audio as enabled
                this.audioEnabled = true;
                console.log('Audio enabled:', this.audioEnabled);
                
                // Add a mute toggle button
                this.addMuteButton();
                
                console.log('Audio setup complete in GameScene');
            } else {
                console.error('Failed to create AudioContext');
            }
        } catch (error) {
            console.error('Error setting up audio:', error);
            this.audioEnabled = false;
        }
    }

    private addMuteButton(): void {
        const width = this.cameras.main.width;
        // Track mute state locally
        let isMuted = false;
        
        const soundButton = this.add.text(width - 40, 20, isMuted ? '🔇' : '🔊', {
            font: '24px Arial',
            color: '#ffffff'
        });
        soundButton.setInteractive({ useHandCursor: true });
        soundButton.setDepth(100);
        
        soundButton.on('pointerdown', () => {
            // Toggle mute state
            isMuted = !isMuted;
            
            // Update sound state based on mute setting
            if (this.audioContext && this.webAudioSounds.masterGain) {
                // Set master gain to 0 (muted) or 0.5 (unmuted)
                const volume = isMuted ? 0 : 0.5;
                this.webAudioSounds.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
                console.log('Sound muted:', isMuted);
            }
            
            // Update button text
            soundButton.setText(isMuted ? '🔇' : '🔊');
        });
    }

    private createExplosion(x: number, y: number): void {
        try {
            // Create particle emitter for explosion
            const particles = this.add.particles(x, y, 'particle', {
                speed: { min: 100, max: 200 },
                scale: { start: 0.5, end: 0 },
                lifespan: 800,
                blendMode: 'ADD',
                gravityY: 100,
                quantity: 30,
                angle: { min: 0, max: 360 }
            });
            
            // Add a flash of light
            const flash = this.add.sprite(x, y, 'particle');
            flash.setScale(10);
            flash.setAlpha(0.8);
            flash.setTint(0xffff00);
            
            // Animate the flash
            this.tweens.add({
                targets: flash,
                alpha: 0,
                scale: 15,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    flash.destroy();
                }
            });
            
            // Auto-destroy particles after they're done
            this.time.delayedCall(800, () => {
                particles.destroy();
            });
            
        } catch (error) {
            console.error('Error creating explosion effect:', error);
        }
    }

    private updateRocketPhysics(): void {
        if (!this.rocket?.body) return;
        
        const body = this.rocket.body;
        if (this.isArcadeBody(body)) {
            body.angularVelocity = this.calculateAngularVelocity();
            body.allowGravity = true;
        }
    }

    private calculateAngularVelocity(): number {
        // Implementation of calculateAngularVelocity method
        // This is a placeholder and should be replaced with the actual implementation
        return 0;
    }

    // Add type guard for physics body
    private isArcadeBody(body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody): body is Phaser.Physics.Arcade.Body {
        return 'angularVelocity' in body;
    }

    private createSoundEffects(masterGain: GainNode): void {
        if (!this.audioContext) {
            console.error('Cannot create sound effects: audioContext is null');
            return;
        }
        
        try {
            console.log('Creating sound effects with audioContext state:', this.audioContext.state);
            
            // Create a master gain node for all thrust sounds
            const thrustMasterGain = this.audioContext.createGain();
            thrustMasterGain.gain.setValueAtTime(0.0, this.audioContext.currentTime); // Start silent
            thrustMasterGain.connect(masterGain);
            console.log('Created thrust master gain node');
            
            // Create a low-pass filter for the thrust sound
            const thrustFilter = this.audioContext.createBiquadFilter();
            thrustFilter.type = 'lowpass';
            thrustFilter.frequency.setValueAtTime(1200, this.audioContext.currentTime); // Higher initial frequency
            thrustFilter.Q.setValueAtTime(3, this.audioContext.currentTime); // Less resonance
            thrustFilter.connect(thrustMasterGain);
            console.log('Created thrust filter');
            
            // Create sawtooth oscillator for the main thrust sound
            const sawOscillator = this.audioContext.createOscillator();
            sawOscillator.type = 'sawtooth';
            sawOscillator.frequency.setValueAtTime(120, this.audioContext.currentTime); // Higher frequency
            
            // Create gain node for sawtooth
            const sawGain = this.audioContext.createGain();
            // Start with zero gain (silent)
            sawGain.gain.setValueAtTime(0.0, this.audioContext.currentTime);
            sawOscillator.connect(sawGain);
            sawGain.connect(thrustFilter);
            console.log('Created sawtooth oscillator and gain');
            
            // Create square oscillator for additional harmonics
            const squareOscillator = this.audioContext.createOscillator();
            squareOscillator.type = 'square';
            squareOscillator.frequency.setValueAtTime(100, this.audioContext.currentTime); // Higher frequency
            squareOscillator.detune.setValueAtTime(-800, this.audioContext.currentTime); // Less detuned
            
            // Create gain node for square
            const squareGain = this.audioContext.createGain();
            // Start with zero gain (silent)
            squareGain.gain.setValueAtTime(0.0, this.audioContext.currentTime);
            squareOscillator.connect(squareGain);
            squareGain.connect(thrustFilter);
            console.log('Created square oscillator and gain');
            
            // Create triangle oscillator for a smoother component
            const triangleOscillator = this.audioContext.createOscillator();
            triangleOscillator.type = 'triangle';
            triangleOscillator.frequency.setValueAtTime(150, this.audioContext.currentTime); // Higher frequency
            triangleOscillator.detune.setValueAtTime(500, this.audioContext.currentTime); // Less detuned
            
            // Create gain node for triangle
            const triangleGain = this.audioContext.createGain();
            // Start with zero gain (silent)
            triangleGain.gain.setValueAtTime(0.0, this.audioContext.currentTime);
            triangleOscillator.connect(triangleGain);
            triangleGain.connect(thrustFilter);
            console.log('Created triangle oscillator and gain');
            
            // Create noise for a more realistic rocket sound
            const noiseBuffer = this.createNoiseBuffer();
            const noiseSource = this.audioContext.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;
            
            // Create a gain node for noise
            const noiseGain = this.audioContext.createGain();
            // Start with zero gain (silent)
            noiseGain.gain.setValueAtTime(0.0, this.audioContext.currentTime);
            noiseSource.connect(noiseGain);
            noiseGain.connect(thrustFilter);
            console.log('Created noise source and gain');
            
            // Create LFO for rumble effect
            const lfo = this.audioContext.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(8, this.audioContext.currentTime);
            
            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.setValueAtTime(20, this.audioContext.currentTime);
            
            lfo.connect(lfoGain);
            lfoGain.connect(sawOscillator.frequency);
            lfoGain.connect(squareOscillator.frequency);
            console.log('Created LFO and connected to oscillators');
            
            // Start all oscillators and noise
            sawOscillator.start();
            squareOscillator.start();
            triangleOscillator.start();
            noiseSource.start();
            lfo.start();
            console.log('Started all oscillators and noise sources');
            
            // Store references to all components
            this.webAudioSounds.thrust = {
                sawOscillator,
                squareOscillator,
                triangleOscillator,
                noiseSource,
                sawGain,
                squareGain,
                triangleGain,
                noiseGain,
                filter: thrustFilter,
                masterGain: thrustMasterGain,
                lfo,
                lfoGain,
                isPlaying: false
            };
            console.log('Stored thrust sound components in webAudioSounds:', Object.keys(this.webAudioSounds.thrust));
            
            // Create explosion sound generator function
            this.webAudioSounds.createExplosion = () => {
                if (!this.audioContext || !this.audioEnabled) return;
                
                try {
                    console.log('Creating explosion sound');
                    // Create noise burst for explosion
                    const explosionBuffer = this.createNoiseBuffer();
                    const explosionSource = this.audioContext.createBufferSource();
                    explosionSource.buffer = explosionBuffer;
                    
                    // Create bandpass filter for explosion sound
                    const explosionFilter = this.audioContext.createBiquadFilter();
                    explosionFilter.type = 'bandpass';
                    explosionFilter.frequency.setValueAtTime(400, this.audioContext.currentTime);
                    explosionFilter.Q.setValueAtTime(1, this.audioContext.currentTime);
                    
                    // Create gain node for explosion
                    const explosionGain = this.audioContext.createGain();
                    // Start with a higher value to ensure it's audible
                    explosionGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
                    
                    // Connect nodes
                    explosionSource.connect(explosionFilter);
                    explosionFilter.connect(explosionGain);
                    explosionGain.connect(masterGain);
                    
                    // Envelope for explosion sound
                    explosionGain.gain.linearRampToValueAtTime(2.0, this.audioContext.currentTime + 0.05);
                    explosionGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.5);
                    
                    // Sweep filter frequency down
                    explosionFilter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
                    explosionFilter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 1.0);
                    
                    // Start and automatically stop
                    explosionSource.start();
                    explosionSource.stop(this.audioContext.currentTime + 2);
                    console.log('Explosion sound started');
                    
                    // Clean up after explosion finishes
                    setTimeout(() => {
                        explosionSource.disconnect();
                        explosionFilter.disconnect();
                        explosionGain.disconnect();
                        console.log('Explosion sound cleaned up');
                    }, 2000);
                    
                    return {
                        source: explosionSource,
                        filter: explosionFilter,
                        gain: explosionGain
                    };
                } catch (error) {
                    console.error('Error creating explosion sound:', error);
                    return null;
                }
            };
            
            // Create landing sound generator function
            this.webAudioSounds.createLandingSound = () => {
                if (!this.audioContext || !this.audioEnabled) return;
                
                try {
                    console.log('Creating landing sound');
                    
                    // Create a series of descending tones for landing
                    const landingGain = this.audioContext.createGain();
                    landingGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
                    landingGain.connect(masterGain);
                    
                    // Create a metallic impact sound
                    const impactOsc = this.audioContext.createOscillator();
                    impactOsc.type = 'triangle';
                    impactOsc.frequency.setValueAtTime(220, this.audioContext.currentTime);
                    impactOsc.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.1);
                    
                    const impactGain = this.audioContext.createGain();
                    impactGain.gain.setValueAtTime(0.0, this.audioContext.currentTime);
                    impactGain.gain.linearRampToValueAtTime(0.7, this.audioContext.currentTime + 0.01);
                    impactGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                    
                    // Create a filter for the impact sound
                    const impactFilter = this.audioContext.createBiquadFilter();
                    impactFilter.type = 'lowpass';
                    impactFilter.frequency.setValueAtTime(3000, this.audioContext.currentTime);
                    impactFilter.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.2);
                    
                    // Connect nodes
                    impactOsc.connect(impactGain);
                    impactGain.connect(impactFilter);
                    impactFilter.connect(landingGain);
                    
                    // Create a secondary "thud" sound
                    const thudOsc = this.audioContext.createOscillator();
                    thudOsc.type = 'sine';
                    thudOsc.frequency.setValueAtTime(80, this.audioContext.currentTime);
                    thudOsc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.3);
                    
                    const thudGain = this.audioContext.createGain();
                    thudGain.gain.setValueAtTime(0.0, this.audioContext.currentTime);
                    thudGain.gain.linearRampToValueAtTime(0.8, this.audioContext.currentTime + 0.05);
                    thudGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.7);
                    
                    // Connect thud nodes
                    thudOsc.connect(thudGain);
                    thudGain.connect(landingGain);
                    
                    // Start oscillators
                    impactOsc.start();
                    thudOsc.start();
                    
                    // Stop oscillators after a short time
                    impactOsc.stop(this.audioContext.currentTime + 0.5);
                    thudOsc.stop(this.audioContext.currentTime + 0.7);
                    
                    console.log('Landing sound started');
                    
                    // Clean up after landing sound finishes
                    setTimeout(() => {
                        impactOsc.disconnect();
                        impactGain.disconnect();
                        impactFilter.disconnect();
                        thudOsc.disconnect();
                        thudGain.disconnect();
                        landingGain.disconnect();
                        console.log('Landing sound cleaned up');
                    }, 1000);
                    
                    return {
                        impactOsc,
                        thudOsc,
                        landingGain
                    };
                } catch (error) {
                    console.error('Error creating landing sound:', error);
                    return null;
                }
            };
            
            console.log('Sound effects created successfully');
        } catch (error) {
            console.error('Error creating sound effects:', error);
        }
    }

    // Helper method to create a white noise buffer
    private createNoiseBuffer(): AudioBuffer {
        if (!this.audioContext) {
            throw new Error('AudioContext not initialized');
        }
        
        // Create a 1-second buffer of white noise
        const bufferSize = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Fill the buffer with random values (white noise)
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }

    private showMessage(text: string, color: number = 0xffffff): void {
        try {
            // Remove any existing message
            if (this.messageText) {
                this.messageText.destroy();
            }
            
            // Create new message text
            this.messageText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                text,
                {
                    fontFamily: 'Arial',
                    fontSize: '32px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4,
                    align: 'center'
                }
            );
            
            // Set text properties
            this.messageText.setOrigin(0.5);
            this.messageText.setDepth(1000);
            this.messageText.setTint(color);
            
            // Add animation
            this.tweens.add({
                targets: this.messageText,
                scale: { from: 0.5, to: 1 },
                alpha: { from: 0, to: 1 },
                duration: 300,
                ease: 'Back.easeOut'
            });
            
            // Auto-remove after delay
            this.time.delayedCall(2000, () => {
                if (this.messageText) {
                    this.tweens.add({
                        targets: this.messageText,
                        alpha: 0,
                        y: this.messageText.y - 50,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            if (this.messageText) {
                                this.messageText.destroy();
                                this.messageText = null;
                            }
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Error showing message:', error);
        }
    }

    private playLandingSound(landingSound: any): void {
        try {
            console.log('Playing landing sound');
            // The landing sound is already playing from the createLandingSound method
            // This method is just for future enhancements or adjustments
        } catch (error) {
            console.error('Error playing landing sound:', error);
        }
    }

    // Add this method to create particle textures if they don't exist
    private createParticleTextures(): void {
        try {
            // Check if we need to create the basic particle texture
            if (!this.sys.textures.exists('particle')) {
                console.log('Creating basic particle texture');
                const canvas = document.createElement('canvas');
                canvas.width = 16;
                canvas.height = 16;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Create a radial gradient for a basic particle
                    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
                    gradient.addColorStop(0, '#ffffff');
                    gradient.addColorStop(0.3, '#ffffaa');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 16, 16);
                    
                    this.sys.textures.addCanvas('particle', canvas);
                    // Also add as 'particles' (plural) since that's what's used in the code
                    this.sys.textures.addCanvas('particles', canvas);
                    console.log('Basic particle texture created');
                }
            }
            
            // Check if we need to create the flame particle texture
            if (!this.sys.textures.exists('flame-particle')) {
                console.log('Creating flame particle texture');
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Create a radial gradient for the flame
                    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
                    gradient.addColorStop(0, '#ffffff');
                    gradient.addColorStop(0.2, '#ffff00');
                    gradient.addColorStop(0.5, '#ff7700');
                    gradient.addColorStop(0.8, '#ff3300');
                    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 32, 32);
                    
                    this.sys.textures.addCanvas('flame-particle', canvas);
                    console.log('Flame particle texture created');
                }
            }
            
            // Check if we need to create the smoke particle texture
            if (!this.sys.textures.exists('smoke-particle')) {
                console.log('Creating smoke particle texture');
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Create a radial gradient for smoke
                    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
                    gradient.addColorStop(0, 'rgba(200, 200, 200, 0.8)');
                    gradient.addColorStop(0.5, 'rgba(150, 150, 150, 0.5)');
                    gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 32, 32);
                    
                    this.sys.textures.addCanvas('smoke-particle', canvas);
                }
            }
            
            // Check if we need to create the spark particle texture
            if (!this.sys.textures.exists('spark-particle')) {
                console.log('Creating spark particle texture');
                const canvas = document.createElement('canvas');
                canvas.width = 16;
                canvas.height = 16;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Create a bright spark
                    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
                    gradient.addColorStop(0, '#ffffff');
                    gradient.addColorStop(0.3, '#ffff00');
                    gradient.addColorStop(0.6, '#ff8800');
                    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 16, 16);
                    
                    this.sys.textures.addCanvas('spark-particle', canvas);
                }
            }
            
            // Check if we need to create the glow particle texture
            if (!this.sys.textures.exists('glow-particle')) {
                console.log('Creating glow particle texture');
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Create a soft glow
                    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
                    gradient.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
                    gradient.addColorStop(0.5, 'rgba(255, 100, 50, 0.4)');
                    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 32, 32);
                    
                    this.sys.textures.addCanvas('glow-particle', canvas);
                }
            }
        } catch (error) {
            console.error('Error creating particle textures:', error);
        }
    }

    // Add a debug method to check particle emitters
    private debugParticleEmitters(): void {
        console.log('Debugging particle emitters:');
        
        // Check if textures exist
        console.log('Texture existence check:');
        console.log('- particles:', this.sys.textures.exists('particles'));
        console.log('- flame-particle:', this.sys.textures.exists('flame-particle'));
        console.log('- smoke-particle:', this.sys.textures.exists('smoke-particle'));
        console.log('- spark-particle:', this.sys.textures.exists('spark-particle'));
        console.log('- glow-particle:', this.sys.textures.exists('glow-particle'));
        
        // Check emitter properties
        console.log('Flame particles:', {
            texture: this.flameParticles.texture.key,
            visible: this.flameParticles.visible,
            active: this.flameParticles.active,
            depth: this.flameParticles.depth,
            x: this.flameParticles.x,
            y: this.flameParticles.y
        });
        
        // Force emit some particles directly
        console.log('Forcing particle emission for testing');
        for (let i = 0; i < 10; i++) {
            this.flameParticles.emitParticle();
            this.sparkParticles.emitParticle();
            this.glowParticles.emitParticle();
        }
    }
} 