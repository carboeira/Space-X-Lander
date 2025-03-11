import Phaser from 'phaser';

// Define a custom interface for particle emitters
interface ParticleEmitters {
    main: Phaser.GameObjects.Particles.ParticleEmitter;
    flame?: Phaser.GameObjects.Particles.ParticleEmitter;
    smoke?: Phaser.GameObjects.Particles.ParticleEmitter;
    spark?: Phaser.GameObjects.Particles.ParticleEmitter;
    glow?: Phaser.GameObjects.Particles.ParticleEmitter;
}

// Define a custom interface that combines the real ParticleEmitter and our dummy emitter
interface ThrustEmitter {
    on: boolean;
    setPosition: (x: number, y: number) => any;
    setAngle?: (config: any) => any;
    setQuantity?: (quantity: number) => any;
    setSpeed?: (min: number | any, max?: number) => any;
}

export class Rocket extends Phaser.Physics.Arcade.Sprite {
    private thrustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
    private smokeEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
    private sparkEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
    private glowEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
    private thrustSound!: Phaser.Sound.BaseSound;
    private fuel: number = 100;
    private maxFuel: number = 100;
    private soundEnabled: boolean = true;
    private thrusterAnimation: Phaser.Tweens.Tween | null = null;
    private isThrusting: boolean = false; // Track thrust state
    private engineFireSprite: Phaser.GameObjects.Sprite | null = null;
    private engineGlow: Phaser.GameObjects.Light | null = null; // New engine glow light
    private emitTimer: number = 0; // Timer for particle emission
    private thrustPower: number = 5;
    private minParticles: number = 2;
    private maxParticles: number = 8;
    private readonly COLLISION_THRESHOLD: number = 200; // Maximum safe impact velocity
    private collisionDamageEnabled: boolean = true;
    public crashed: boolean = false; // Track if rocket has crashed
    private fuelConsumptionRate: number = 0.3; // Increased from 0.2 to make fuel management more challenging
    private rotatingLeft: boolean = false;
    private rotatingRight: boolean = false;
    private thrustActive: boolean = false;
    
    constructor(
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        texture: string,
        particles: ParticleEmitters,
        sound: Phaser.Sound.BaseSound,
        maxFuel: number = 100
    ) {
        super(scene, x, y, texture);
        
        try {
            // Add to scene
            scene.add.existing(this);
            scene.physics.add.existing(this);
            
            // Set up physics properties with improved configuration
            this.setCollideWorldBounds(true);
            this.setDamping(true);
            this.setDrag(0.1);
            this.setAngularDrag(0.9);
            this.setMaxVelocity(200);
            
            // Ensure physics body is properly configured
            if (this.body instanceof Phaser.Physics.Arcade.Body) {
                this.body.enable = true;
                this.body.bounce.set(0);
                // Adjust collision box for Falcon 9 shape (narrower and taller)
                this.body.setSize(this.width * 0.4, this.height * 0.9);
                // Offset the collision box to match the visual center of the rocket
                this.body.setOffset(this.width * 0.3, this.height * 0.05);
                
                // Enable checking for collision velocity
                this.body.onWorldBounds = true;
                
                // Listen for collision events
                this.scene.physics.world.on('worldbounds', this.handleCollision, this);
            }
            
            // Create engine fire sprite (initially hidden)
            this.createEngineFireSprite();
            
            // Set up thruster particles with improved effect
            if (particles) {
                // Main flame emitter - more dynamic and vibrant
                this.thrustEmitter = particles.flame || particles.main;
                
                // Improved smoke emitter for more visible thrust effect
                this.smokeEmitter = particles.smoke || particles.main;
                
                // New spark emitter for additional visual flair
                this.sparkEmitter = particles.spark || particles.main;
                
                // New glow emitter for engine glow effect
                this.glowEmitter = particles.glow || particles.main;
                
                // Configure particle emitters for better visibility
                this.configureParticleEmitters();
            } else {
                // Create dummy emitters if particles are not available
                this.thrustEmitter = this.createDummyEmitter();
                this.smokeEmitter = this.createDummyEmitter();
                this.sparkEmitter = this.createDummyEmitter();
                this.glowEmitter = this.createDummyEmitter();
            }
            
            // Set up sound
            if (sound) {
                this.thrustSound = sound;
                this.soundEnabled = true;
            } else {
                // Create a dummy sound if not available
                this.thrustSound = {
                    play: () => {},
                    stop: () => {},
                    isPlaying: false
                } as any;
                this.soundEnabled = false;
            }
            
            // Set up fuel
            this.maxFuel = maxFuel;
            this.fuel = maxFuel;
            
            // Set depth to ensure rocket is above background but below UI
            this.setDepth(5);
            
            console.log('Rocket initialized successfully');
        } catch (error) {
            console.error('Error initializing Rocket:', error);
            // Create dummy objects if needed
            if (!this.thrustEmitter) {
                this.thrustEmitter = this.createDummyEmitter();
            }
            
            if (!this.smokeEmitter) {
                this.smokeEmitter = this.createDummyEmitter();
            }
            
            if (!this.sparkEmitter) {
                this.sparkEmitter = this.createDummyEmitter();
            }
            
            if (!this.glowEmitter) {
                this.glowEmitter = this.createDummyEmitter();
            }
        }
    }
    
    /**
     * Configure particle emitters for better visibility
     */
    private configureParticleEmitters(): void {
        // Make sure all emitters are visible and properly configured
        console.log('Configuring particle emitters for better visibility');
        
        // Set initial positions (will be updated in update method)
        // Position at the bottom of the rocket
        const emitterX = this.x;
        const emitterY = this.y + (this.height * 0.45);
        
        // Don't try to set textures directly - the emitters already have their textures
        // from when they were created in GameScene
        
        // Configure particle pools for better performance
        const configureEmitter = (emitter: Phaser.GameObjects.Particles.ParticleEmitter, maxParticles: number) => {
            // Set position
            emitter.setPosition(emitterX, emitterY);
            
            // Configure basic properties
            emitter.frequency = -1; // Manual emission only
            emitter.quantity.propertyValue = 1; // Emit one at a time for better control
            
            // Set maximum particles
            emitter.maxParticles = maxParticles;
            
            // Set particle properties
            emitter.setScale({ start: 0.5, end: 0 });
            emitter.setAlpha({ start: 0.8, end: 0 });
            emitter.setSpeed(50, 100);
            
            // Make sure particles are visible
            emitter.visible = true;
            
            // Log emitter configuration
            console.log(`Configured emitter with texture: ${emitter.texture.key}, maxParticles: ${maxParticles}`);
        };
        
        // Configure each emitter with appropriate max particles
        configureEmitter(this.thrustEmitter, this.maxParticles * 2);
        configureEmitter(this.smokeEmitter, this.maxParticles);
        configureEmitter(this.sparkEmitter, this.maxParticles);
        configureEmitter(this.glowEmitter, Math.floor(this.maxParticles * 0.5));
    }
    
    /**
     * Create a dummy emitter for error handling
     */
    private createDummyEmitter(): any {
        return {
            emitParticle: () => {},
            setPosition: () => {},
            setAngle: () => {},
            setQuantity: () => {},
            setSpeed: () => {},
            active: false
        };
    }
    
    /**
     * Callback for particle emission - allows for custom behavior per particle
     */
    private particleEmitCallback(particle: Phaser.GameObjects.Particles.Particle): void {
        // Randomize particle properties for more dynamic effect
        particle.scaleX = particle.scaleY = Phaser.Math.FloatBetween(0.5, 1.0);
        particle.tint = Phaser.Display.Color.GetColor(
            Phaser.Math.Between(200, 255),
            Phaser.Math.Between(100, 200),
            Phaser.Math.Between(0, 50)
        );
    }
    
    /**
     * Create the engine fire sprite that will be shown/hidden when thrusting
     */
    private createEngineFireSprite(): void {
        try {
            // Create a canvas for the engine fire
            const canvas = document.createElement('canvas');
            canvas.width = 24;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                // Draw the engine fire with more detail
                const gradient = ctx.createLinearGradient(12, 0, 12, 32);
                gradient.addColorStop(0, '#ff6600');
                gradient.addColorStop(0.3, '#ffcc00');
                gradient.addColorStop(0.7, '#ff3300');
                gradient.addColorStop(1, '#ff0000');
                
                ctx.fillStyle = gradient;
                
                // Left engine flame
                ctx.beginPath();
                ctx.moveTo(5, 0);
                ctx.lineTo(2, 32);
                ctx.lineTo(8, 32);
                ctx.closePath();
                ctx.fill();
                
                // Right engine flame
                ctx.beginPath();
                ctx.moveTo(19, 0);
                ctx.lineTo(16, 32);
                ctx.lineTo(22, 32);
                ctx.closePath();
                ctx.fill();
                
                // Center engine flame
                ctx.beginPath();
                ctx.moveTo(12, 0);
                ctx.lineTo(9, 32);
                ctx.lineTo(15, 32);
                ctx.closePath();
                ctx.fill();
                
                // Add some glow
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.ellipse(12, 8, 10, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Add the texture to the scene
                this.scene.textures.addCanvas('engine-fire', canvas);
                
                // Create the sprite and position it at the bottom of the rocket
                this.engineFireSprite = this.scene.add.sprite(this.x, this.y + this.height/2, 'engine-fire');
                this.engineFireSprite.setOrigin(0.5, 0);
                this.engineFireSprite.setDepth(this.depth - 1); // Behind the rocket
                this.engineFireSprite.setVisible(false); // Initially hidden
                this.engineFireSprite.setAlpha(0); // Ensure it's fully transparent
                
                // Add animation frames for the engine fire
                this.createEngineFireAnimation();
            }
        } catch (error) {
            console.error('Error creating engine fire sprite:', error);
            this.engineFireSprite = null;
        }
    }
    
    /**
     * Create animation frames for the engine fire
     */
    private createEngineFireAnimation(): void {
        if (!this.engineFireSprite) return;
        
        // Create a tween to animate the engine fire
        this.scene.tweens.add({
            targets: this.engineFireSprite,
            scaleX: { from: 0.9, to: 1.1 },
            scaleY: { from: 0.9, to: 1.1 },
            duration: 100,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * Apply thrust to the rocket
     */
    public applyThrust(): void {
        try {
            console.log('applyThrust called, fuel:', this.fuel, 'isThrusting:', this.isThrusting);
            
            // Check if we have fuel
            if (this.fuel <= 0) {
                console.log('No fuel left, stopping thrust');
                this.stopThrust();
                return;
            }
            
            // Set thrusting state
            this.isThrusting = true;
            
            // Play thrust sound if not already playing
            if (this.soundEnabled && this.thrustSound) {
                try {
                    // For Web Audio API implementation in GameScene
                    console.log('Attempting to play thrust sound, scene:', this.scene.constructor.name);
                    
                    // SIMPLIFIED APPROACH: Just check if Web Audio is available and use it
                    if ((this.scene as any).webAudioSounds && (this.scene as any).webAudioSounds.thrust) {
                        const thrustSounds = (this.scene as any).webAudioSounds.thrust;
                        
                        // Set master gain to full volume immediately
                        if (thrustSounds.masterGain && thrustSounds.masterGain.gain) {
                            console.log('Setting thrust masterGain to 1.0');
                            thrustSounds.masterGain.gain.setValueAtTime(
                                1.0, 
                                (this.scene as any).audioContext?.currentTime || 0
                            );
                        }
                        
                        // Set all component gains to full volume immediately
                        if (thrustSounds.sawGain && thrustSounds.sawGain.gain) {
                            console.log('Setting sawGain to 0.5');
                            thrustSounds.sawGain.gain.setValueAtTime(
                                0.5, 
                                (this.scene as any).audioContext?.currentTime || 0
                            );
                        }
                        
                        if (thrustSounds.squareGain && thrustSounds.squareGain.gain) {
                            console.log('Setting squareGain to 0.3');
                            thrustSounds.squareGain.gain.setValueAtTime(
                                0.3, 
                                (this.scene as any).audioContext?.currentTime || 0
                            );
                        }
                        
                        if (thrustSounds.triangleGain && thrustSounds.triangleGain.gain) {
                            console.log('Setting triangleGain to 0.4');
                            thrustSounds.triangleGain.gain.setValueAtTime(
                                0.4, 
                                (this.scene as any).audioContext?.currentTime || 0
                            );
                        }
                        
                        if (thrustSounds.noiseGain && thrustSounds.noiseGain.gain) {
                            console.log('Setting noiseGain to 0.6');
                            thrustSounds.noiseGain.gain.setValueAtTime(
                                0.6, 
                                (this.scene as any).audioContext?.currentTime || 0
                            );
                        }
                        
                        // Mark as playing
                        thrustSounds.isPlaying = true;
                    } else {
                        console.log('Web Audio thrust sound not available, using Phaser sound');
                        
                        // Fallback to regular Phaser sound
                        if (this.thrustSound.play && !this.thrustSound.isPlaying) {
                            console.log('Playing Phaser thrust sound');
                            this.thrustSound.play({ loop: true, volume: 0.8 });
                        }
                    }
                } catch (error) {
                    console.error('Error playing thrust sound:', error);
                }
            } else {
                console.log('Sound not enabled or thrustSound not available');
            }
            
            // Calculate thrust vector based on rocket rotation
            const angle = Phaser.Math.DegToRad(this.angle - 90); // Adjust for sprite orientation
            const thrustX = Math.cos(angle);
            const thrustY = Math.sin(angle);
            
            // Apply thrust force directly
            if (this.body instanceof Phaser.Physics.Arcade.Body) {
                // Calculate thrust power based on current velocity
                const currentVelocity = Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2);
                const velocityFactor = Math.max(0.5, 1 - (currentVelocity / this.body.maxVelocity.x));
                const adjustedThrustPower = this.thrustPower * velocityFactor;
                
                // Apply thrust
                this.body.velocity.x += thrustX * adjustedThrustPower;
                this.body.velocity.y += thrustY * adjustedThrustPower;
                
                // Consume fuel based on thrust power
                const fuelConsumption = this.fuelConsumptionRate * (adjustedThrustPower / this.thrustPower);
                this.fuel = Math.max(0, this.fuel - fuelConsumption);
                
                // Calculate particle count based on thrust power
                const particleCount = Math.floor(
                    Phaser.Math.Linear(
                        this.minParticles,
                        this.maxParticles,
                        adjustedThrustPower / this.thrustPower
                    )
                );
                
                // Emit particles with count based on thrust
                this.emitParticles(particleCount);
            }
            
            // Show engine fire sprite with animation
            if (this.engineFireSprite) {
                this.engineFireSprite.setVisible(true);
                
                // Fade in the engine fire
                this.scene.tweens.add({
                    targets: this.engineFireSprite,
                    alpha: 1,
                    duration: 100,
                    ease: 'Power1'
                });
            }
            
            // Update particle positions
            this.updateParticlePositions();
            
            // Start the thruster animation if not already running
            if (!this.thrusterAnimation) {
                this.thrusterAnimation = this.scene.tweens.add({
                    targets: { value: 0 },
                    value: 1,
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        } catch (error) {
            console.error('Error applying thrust:', error);
        }
    }
    
    /**
     * Update the positions of all particle emitters to match the rocket's engine position
     */
    private updateParticlePositions(): void {
        // Calculate the position at the bottom of the rocket based on its rotation
        // The engine is at the bottom center of the rocket
        const offsetLength = this.height * 0.48; // Increased from 0.45 to position closer to the bottom edge
        
        // Calculate the angle in radians, adjusting for Phaser's coordinate system
        const angleRad = this.rotation + Math.PI / 2; // Add 90 degrees (π/2) to point downward
        
        // Calculate the offset from the rocket's center to the engine position
        const offsetX = Math.cos(angleRad) * offsetLength;
        const offsetY = Math.sin(angleRad) * offsetLength;
        
        // Calculate the final position
        const emitterX = this.x + offsetX;
        const emitterY = this.y + offsetY;
        
        // Update positions for all emitters
        this.thrustEmitter.setPosition(emitterX, emitterY);
        this.smokeEmitter.setPosition(emitterX, emitterY);
        this.sparkEmitter.setPosition(emitterX, emitterY);
        this.glowEmitter.setPosition(emitterX, emitterY);
        
        // Set the angle for the emitters to match the rocket's rotation
        // This ensures particles emit in the correct direction
        const emitAngle = Phaser.Math.RadToDeg(angleRad) - 90; // Convert to degrees and adjust
        
        // Set the angle for each emitter
        try {
            // Use any to bypass TypeScript errors
            (this.thrustEmitter as any).setAngle(emitAngle);
            (this.smokeEmitter as any).setAngle(emitAngle);
            (this.sparkEmitter as any).setAngle(emitAngle);
            (this.glowEmitter as any).setAngle(emitAngle);
            
            console.log('Updated particle emitter positions and angles:', {
                x: emitterX,
                y: emitterY,
                angle: emitAngle
            });
        } catch (error) {
            console.error('Error setting emitter angles:', error);
        }
        
        // Update engine fire sprite position and rotation
        if (this.engineFireSprite) {
            this.engineFireSprite.setPosition(emitterX, emitterY);
            this.engineFireSprite.setRotation(this.rotation);
        }
    }
    
    /**
     * Emit particles for the thrust effect
     */
    private emitParticles(count: number = 5): void {
        try {
            // Update particle positions before emitting to ensure correct placement
            this.updateParticlePositions();
            
            // Log before emission
            console.log('Emitting particles at position:', {
                x: this.thrustEmitter.x, 
                y: this.thrustEmitter.y,
                count: count
            });
            
            // Emit flame particles - increased count for more visible flame
            const flameCount = Math.max(2, count);
            for (let i = 0; i < flameCount; i++) {
                this.thrustEmitter.emitParticle();
            }
            
            // Emit smoke particles proportional to thrust - increased ratio
            const smokeCount = Math.max(2, Math.floor(count * 0.6));
            for (let i = 0; i < smokeCount; i++) {
                this.smokeEmitter.emitParticle();
            }
            
            // Emit spark particles with some randomness - increased ratio
            const sparkCount = Math.max(1, Math.floor(count * 0.8));
            for (let i = 0; i < sparkCount; i++) {
                if (Math.random() > 0.2) { // 80% chance to emit spark (increased from 70%)
                    this.sparkEmitter.emitParticle();
                }
            }
            
            // Emit glow particles - increased frequency
            if (Math.random() > 0.5) { // 50% chance to emit glow (increased from 30%)
                this.glowEmitter.emitParticle();
            }
            
            // Log particle emission for debugging
            console.log('Emitted particles:', {
                flame: flameCount,
                smoke: smokeCount,
                spark: sparkCount,
                glow: Math.random() > 0.5 ? 1 : 0
            });
        } catch (error) {
            console.error('Error emitting particles:', error);
        }
    }
    
    /**
     * Stop thrusting
     */
    public stopThrust(): void {
        try {
            console.log('stopThrust called, isThrusting:', this.isThrusting);
            
            // Set thrusting state
            this.isThrusting = false;
            
            // Hide engine fire sprite
            if (this.engineFireSprite) {
                // Fade out the engine fire
                this.scene.tweens.add({
                    targets: this.engineFireSprite,
                    alpha: 0,
                    duration: 100,
                    ease: 'Power1',
                    onComplete: () => {
                        if (this.engineFireSprite) {
                            this.engineFireSprite.setVisible(false);
                        }
                    }
                });
            }
            
            // Stop thruster animation
            if (this.thrusterAnimation) {
                this.thrusterAnimation.stop();
                this.thrusterAnimation = null;
            }
            
            // Stop thrust sound
            if (this.soundEnabled) {
                try {
                    // For Web Audio API implementation in GameScene
                    if ((this.scene as any).webAudioSounds && (this.scene as any).webAudioSounds.thrust) {
                        const thrustSounds = (this.scene as any).webAudioSounds.thrust;
                        console.log('Stopping Web Audio thrust sound');
                        
                        // Immediately set master gain to zero to ensure all sounds stop
                        if (thrustSounds.masterGain && thrustSounds.masterGain.gain) {
                            console.log('Setting thrust masterGain to 0');
                            thrustSounds.masterGain.gain.setValueAtTime(
                                0, 
                                (this.scene as any).audioContext?.currentTime || 0
                            );
                        }
                        
                        // Also set individual gains to zero for safety
                        if (thrustSounds.sawGain && thrustSounds.sawGain.gain) {
                            console.log('Setting sawGain to 0');
                            thrustSounds.sawGain.gain.setValueAtTime(
                                0, 
                                (this.scene as any).audioContext?.currentTime || 0
                            );
                        }
                        
                        if (thrustSounds.squareGain && thrustSounds.squareGain.gain) {
                            console.log('Setting squareGain to 0');
                            thrustSounds.squareGain.gain.setValueAtTime(
                                0, 
                                (this.scene as any).audioContext?.currentTime || 0
                            );
                        }
                        
                        if (thrustSounds.triangleGain && thrustSounds.triangleGain.gain) {
                            console.log('Setting triangleGain to 0');
                            thrustSounds.triangleGain.gain.setValueAtTime(
                                0, 
                                (this.scene as any).audioContext?.currentTime || 0
                            );
                        }
                        
                        if (thrustSounds.noiseGain && thrustSounds.noiseGain.gain) {
                            console.log('Setting noiseGain to 0');
                            thrustSounds.noiseGain.gain.setValueAtTime(
                                0, 
                                (this.scene as any).audioContext?.currentTime || 0
                            );
                        }
                        
                        thrustSounds.isPlaying = false;
                    } else if (this.thrustSound && this.thrustSound.isPlaying) {
                        // Fallback to Phaser sound system
                        console.log('Stopping Phaser thrust sound');
                        this.thrustSound.stop();
                    }
                } catch (error) {
                    console.error('Error stopping thrust sound:', error);
                }
            }
        } catch (error) {
            console.error('Error stopping thrust:', error);
        }
    }
    
    update(time: number, delta: number): void {
        // Update particle emitter positions if thrusting
        if (this.isThrusting) {
            // Update particle positions
            this.updateParticlePositions();
            
            // Emit particles at regular intervals while thrusting
            this.emitTimer += delta;
            if (this.emitTimer > 50) { // Emit particles every 50ms
                // Calculate particle count based on velocity
                if (this.body instanceof Phaser.Physics.Arcade.Body) {
                    const velocity = Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2);
                    const velocityFactor = Math.min(1, velocity / 100);
                    const particleCount = Math.floor(
                        Phaser.Math.Linear(
                            this.minParticles,
                            this.maxParticles,
                            velocityFactor
                        )
                    );
                    this.emitParticles(particleCount);
                } else {
                    this.emitParticles(this.minParticles);
                }
                this.emitTimer = 0;
            }
        }
        
        // Clean up dead particles if too many are active
        try {
            const thrustEmitter = this.thrustEmitter as any;
            const smokeEmitter = this.smokeEmitter as any;
            
            if (typeof thrustEmitter.getAliveParticleCount === 'function' && 
                thrustEmitter.getAliveParticleCount() > this.maxParticles * 4) {
                thrustEmitter.killAll();
            }
            
            if (typeof smokeEmitter.getAliveParticleCount === 'function' && 
                smokeEmitter.getAliveParticleCount() > this.maxParticles * 2) {
                smokeEmitter.killAll();
            }
        } catch (error) {
            console.error('Error cleaning up particles:', error);
        }
        
        // Apply thrust if active and has fuel
        if (this.thrustActive && this.fuel > 0) {
            this.applyThrust();
        }
    }
    
    getFuel(): number {
        return this.fuel;
    }
    
    getFuelPercentage(): number {
        return (this.fuel / this.maxFuel) * 100;
    }
    
    reset(x: number, y: number): void {
        try {
            this.setPosition(x, y);
            this.setVelocity(0, 0);
            this.setAngularVelocity(0);
            this.setAngle(0);
            this.fuel = this.maxFuel;
            this.setVisible(true);
            this.setAlpha(1); // Reset alpha in case it was changed by effects
            if (this.body) {
                this.body.enable = true;
            }
            
            // Reset thrust state
            this.isThrusting = false;
            
            // Stop any ongoing animations
            this.stopThrust();
            this.scene.tweens.killTweensOf(this);
            
            // Make sure engine fire is hidden
            if (this.engineFireSprite) {
                this.engineFireSprite.setVisible(false);
                this.engineFireSprite.setAlpha(0);
                this.scene.tweens.killTweensOf(this.engineFireSprite);
            }
        } catch (error) {
            console.error('Error resetting rocket:', error);
        }
    }
    
    private handleCollision(body: Phaser.Physics.Arcade.Body): void {
        if (!this.collisionDamageEnabled || body.gameObject !== this) {
            return;
        }

        try {
            // Calculate impact velocity
            const velocity = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
            const angle = Math.abs(this.angle % 360);
            
            // Check if the collision is too hard or if the angle is bad
            if (velocity > this.COLLISION_THRESHOLD || (angle > 30 && angle < 330)) {
                // Emit a lot of particles on impact
                this.emitParticles(10);
                
                // Trigger crash handling in the game scene
                this.scene.events.emit('rocketCrash', {
                    velocity,
                    angle,
                    reason: velocity > this.COLLISION_THRESHOLD ? 
                        'Impact too hard!' : 
                        'Bad landing angle!'
                });
            }
        } catch (error) {
            console.error('Error handling collision:', error);
        }
    }

    // Add method to enable/disable collision damage
    public setCollisionDamage(enabled: boolean): void {
        this.collisionDamageEnabled = enabled;
    }
    
    /**
     * Set left rotation state
     */
    public setRotateLeft(active: boolean): void {
        this.rotatingLeft = active;
        if (active) {
            this.setAngularVelocity(-40);
        } else if (!this.rotatingRight) {
            // Only stop rotation if right isn't active
            this.setAngularVelocity(0);
        }
    }
    
    /**
     * Set right rotation state
     */
    public setRotateRight(active: boolean): void {
        this.rotatingRight = active;
        if (active) {
            this.setAngularVelocity(40);
        } else if (!this.rotatingLeft) {
            // Only stop rotation if left isn't active
            this.setAngularVelocity(0);
        }
    }
    
    /**
     * Set thrust state
     */
    public setThrust(active: boolean): void {
        this.thrustActive = active;
        if (active && this.fuel > 0) {
            this.applyThrust();
        } else {
            this.stopThrust();
        }
    }
    
    /**
     * Check if rocket is rotating left
     */
    public isRotatingLeft(): boolean {
        return this.rotatingLeft;
    }
    
    /**
     * Check if rocket is rotating right
     */
    public isRotatingRight(): boolean {
        return this.rotatingRight;
    }
    
    /**
     * Check if rocket is thrusting
     */
    public isThrusting(): boolean {
        return this.thrustActive;
    }
} 