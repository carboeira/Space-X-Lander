import Phaser from 'phaser';

export enum PowerUpType {
    SHIELD = 'shield',
    FUEL = 'fuel',
    THRUST = 'thrust',
    STABILITY = 'stability'
}

export interface PowerUpConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    type: PowerUpType;
    effectDuration?: number;
    value?: number;
}

export class PowerUp extends Phaser.GameObjects.Sprite {
    public body!: Phaser.Physics.Arcade.Body;
    protected powerUpType: PowerUpType;
    protected effectDuration: number;
    protected value: number;
    protected isActive: boolean;
    protected emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    protected sound: Phaser.Sound.BaseSound | null;
    protected particleColor: number;

    constructor(config: PowerUpConfig) {
        // Get the appropriate frame based on the power-up type
        const frame = {
            [PowerUpType.SHIELD]: 0,
            [PowerUpType.FUEL]: 1,
            [PowerUpType.THRUST]: 2,
            [PowerUpType.STABILITY]: 3
        }[config.type];

        super(config.scene, config.x, config.y, 'powerups', frame);

        this.powerUpType = config.type;
        this.effectDuration = config.effectDuration || 5000; // Default 5 seconds
        this.value = config.value || 1;
        this.isActive = false;

        // Set particle color based on power-up type
        this.particleColor = {
            [PowerUpType.SHIELD]: 0x4299e1, // Blue
            [PowerUpType.FUEL]: 0x48bb78,   // Green
            [PowerUpType.THRUST]: 0xed8936, // Orange
            [PowerUpType.STABILITY]: 0x805ad5 // Purple
        }[config.type];

        // Add to scene and enable physics
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        // Set up physics body
        if (this.body) {
            this.body.setAllowGravity(false);
            this.body.setImmovable(true);
        }

        // Play the appropriate animation
        this.play(`${this.powerUpType}_powerup`);

        // Add floating effect using the tween config from the registry
        const floatConfig = this.scene.game.registry.get('powerupFloatTween');
        if (floatConfig) {
            this.scene.tweens.add({
                targets: this,
                ...floatConfig
            });
        }

        // Set up particle effects
        this.setupParticles();

        // Load sound effect
        this.sound = this.scene.sound.add('powerup_sound', { volume: 0.5 });
    }

    private setupParticles(): void {
        // Create particle emitter
        this.emitter = this.scene.add.particles(0, 0, 'glow-particle', {
            x: this.x,
            y: this.y,
            scale: { start: 0.5, end: 0 },
            speed: { min: 50, max: 100 },
            angle: { min: 0, max: 360 },
            frequency: 100,
            lifespan: 1000,
            blendMode: 'ADD',
            tint: this.particleColor,
            quantity: 1
        });

        // Make particles follow the power-up
        this.emitter.startFollow(this);
    }

    public activate(): void {
        if (this.isActive) return;

        this.isActive = true;

        // Play sound effect
        if (this.sound) {
            this.sound.play();
        }

        // Create collection effect
        const collectionEmitter = this.scene.add.particles(0, 0, 'glow-particle', {
            x: this.x,
            y: this.y,
            scale: { start: 1, end: 0 },
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            quantity: 20,
            frequency: 0,
            lifespan: 500,
            blendMode: 'ADD',
            tint: this.particleColor
        });

        // Clean up after collection effect
        this.scene.time.delayedCall(500, () => {
            collectionEmitter.destroy();
        });

        // Destroy the power-up after activation
        this.destroy();
    }

    public deactivate(): void {
        this.isActive = false;
    }

    public getType(): PowerUpType {
        return this.powerUpType;
    }

    public getEffect(): { duration: number; value: number } {
        return {
            duration: this.effectDuration,
            value: this.value
        };
    }

    public isActiveState(): boolean {
        return this.isActive;
    }

    public destroy(): void {
        // Clean up emitter
        if (this.emitter) {
            this.emitter.destroy();
        }

        // Clean up sound
        if (this.sound) {
            this.sound.destroy();
        }

        super.destroy();
    }
} 