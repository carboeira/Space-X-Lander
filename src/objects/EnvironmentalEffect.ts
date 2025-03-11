import Phaser from 'phaser';

export interface EffectConfig {
    intensity: number;
    duration: number;
    frequency: number;
}

export class EnvironmentalEffect {
    private scene: Phaser.Scene;
    private effects: Map<string, Phaser.GameObjects.Particles.ParticleEmitter>;
    private active: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.effects = new Map();
    }

    createOceanWaves(config: EffectConfig): void {
        const waveEmitter = this.scene.add.particles(0, 0, 'particles', {
            frame: 'blue',
            x: { min: 0, max: this.scene.cameras.main.width },
            y: this.scene.cameras.main.height - 50,
            lifespan: 2000,
            speedY: { min: -100, max: -200 },
            scale: { start: 0.5, end: 0 },
            quantity: 2,
            frequency: config.frequency,
            alpha: { start: 0.6, end: 0 },
            blendMode: 'ADD'
        });
        this.effects.set('waves', waveEmitter);
    }

    createDustStorm(config: EffectConfig): void {
        const dustEmitter = this.scene.add.particles(0, 0, 'particles', {
            frame: 'brown',
            x: 0,
            y: { min: 0, max: this.scene.cameras.main.height },
            lifespan: 3000,
            speedX: { min: 100, max: 200 },
            speedY: { min: -50, max: 50 },
            scale: { start: 0.2, end: 0 },
            quantity: 5,
            frequency: config.frequency,
            alpha: { start: 0.3, end: 0 },
            blendMode: 'NORMAL'
        });
        this.effects.set('dust', dustEmitter);
    }

    createSolarFlare(config: EffectConfig): void {
        const flareEmitter = this.scene.add.particles(0, 0, 'particles', {
            frame: 'yellow',
            x: { min: 0, max: this.scene.cameras.main.width },
            y: 0,
            lifespan: 1500,
            speedY: { min: 200, max: 300 },
            scale: { start: 0.8, end: 0 },
            quantity: 1,
            frequency: config.frequency,
            alpha: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            tint: 0xffff00
        });
        this.effects.set('solarFlare', flareEmitter);
    }

    createSpaceDebris(config: EffectConfig): void {
        const debrisEmitter = this.scene.add.particles(0, 0, 'particles', {
            frame: 'white',
            x: this.scene.cameras.main.width,
            y: { min: 0, max: this.scene.cameras.main.height },
            lifespan: 4000,
            speedX: { min: -300, max: -400 },
            speedY: { min: -50, max: 50 },
            scale: { start: 0.3, end: 0 },
            quantity: 1,
            frequency: config.frequency,
            alpha: { start: 1, end: 0 },
            blendMode: 'NORMAL'
        });
        this.effects.set('debris', debrisEmitter);
    }

    createAvalanche(config: EffectConfig): void {
        const rockEmitter = this.scene.add.particles(0, 0, 'particles', {
            frame: 'gray',
            x: { min: 0, max: this.scene.cameras.main.width },
            y: 0,
            lifespan: 2000,
            speedY: { min: 300, max: 400 },
            speedX: { min: -50, max: 50 },
            scale: { start: 0.4, end: 0 },
            quantity: 3,
            frequency: config.frequency,
            alpha: { start: 1, end: 0 },
            blendMode: 'NORMAL'
        });
        this.effects.set('avalanche', rockEmitter);
    }

    setupForEnvironment(environment: string, intensity: number = 1): void {
        this.stopAll();
        
        const baseConfig: EffectConfig = {
            intensity,
            duration: 2000,
            frequency: 2000
        };

        switch (environment) {
            case 'Ocean Landing':
                this.createOceanWaves(baseConfig);
                break;
            case 'Mountain Peak':
                this.createAvalanche({...baseConfig, frequency: 5000});
                break;
            case 'Mars Landing':
                this.createDustStorm({...baseConfig, frequency: 3000});
                break;
            case 'Space Station':
                this.createSpaceDebris({...baseConfig, frequency: 4000});
                break;
            case 'Lunar Landing':
                this.createSolarFlare({...baseConfig, frequency: 6000});
                break;
        }
    }

    start(): void {
        this.active = true;
        this.effects.forEach(emitter => emitter.start());
    }

    stop(): void {
        this.active = false;
        this.effects.forEach(emitter => emitter.stop());
    }

    stopAll(): void {
        this.effects.forEach(emitter => {
            emitter.stop();
            emitter.destroy();
        });
        this.effects.clear();
    }

    update(): void {
        if (!this.active) return;
        // Add any update logic here if needed
    }

    destroy(): void {
        this.stopAll();
    }
} 