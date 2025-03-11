import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload(): void {
        console.log('PreloadScene: preload() called');
        // Display loading progress
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px monospace',
            color: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);
        
        const percentText = this.add.text(width / 2, height / 2 - 5, '0%', {
            font: '18px monospace',
            color: '#ffffff'
        });
        percentText.setOrigin(0.5, 0.5);
        
        // Loading progress events
        this.load.on('progress', (value: number) => {
            percentText.setText(parseInt(String(value * 100)) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            console.log('All assets loaded successfully');
        });

        // Load game assets
        this.loadAssets();
    }

    create(): void {
        console.log('PreloadScene: create() called');
        try {
            // Create textures for particles
            this.createParticleTexture();
            
            // Create explosion texture
            this.createExplosionTexture();
            
            // Create enhanced star textures for parallax
            this.createParallaxStarTextures();
            
            // Start the menu scene
            this.scene.start('MenuScene');
        } catch (error) {
            console.error('Error in PreloadScene.create():', error);
        }
    }

    private loadAssets(): void {
        try {
            console.log('Loading game assets...');
            
            // Load images
            this.load.image('background', 'assets/images/background.png');
            this.load.image('rocket', 'assets/images/rocket.png');
            this.load.image('platform', 'assets/images/platform.png');
            this.load.image('particles', 'assets/images/particle.png');
            this.load.image('flame-particle', 'assets/images/flame-particle.png');
            this.load.image('smoke-particle', 'assets/images/smoke-particle.png');
            this.load.image('spark-particle', 'assets/images/spark-particle.png');
            this.load.image('glow-particle', 'assets/images/glow-particle.png');
            this.load.image('stars', 'assets/images/stars.png');
            this.load.image('asteroid', 'assets/images/asteroid.png');
            this.load.image('spacex-logo', 'assets/images/spacex-logo.png');
            
            // Load audio with explicit paths and console logging
            console.log('Loading audio files...');
            
            // Use absolute paths for audio files
            this.load.audio('thrust', [
                'assets/audio/thrust.mp3',
                'assets/audio/thrust.wav'
            ]);
            
            this.load.audio('explosion', [
                'assets/audio/explosion.mp3',
                'assets/audio/explosion.wav'
            ]);
            
            this.load.audio('success', [
                'assets/audio/success.mp3',
                'assets/audio/success.wav'
            ]);
            
            this.load.audio('music', [
                'assets/audio/music.mp3',
                'assets/audio/music.wav'
            ]);
            
            console.log('Audio files queued for loading');
            
            // Add specific audio load events
            this.load.on('filecomplete-audio-music', () => {
                console.log('Music loaded successfully');
            });
            
            this.load.on('filecomplete-audio-thrust', () => {
                console.log('Thrust sound loaded successfully');
            });
            
            this.load.on('filecomplete-audio-explosion', () => {
                console.log('Explosion sound loaded successfully');
            });
            
            this.load.on('filecomplete-audio-success', () => {
                console.log('Success sound loaded successfully');
            });
            
        } catch (error) {
            console.error('Error loading assets:', error);
        }
    }

    private createExplosionTexture(): void {
        // Create a simple explosion texture
        const graphics = this.add.graphics();
        
        // Draw a simple explosion shape
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(64, 64, 64);
        graphics.fillStyle(0xff6600, 1);
        graphics.fillCircle(64, 64, 48);
        graphics.fillStyle(0xffff00, 1);
        graphics.fillCircle(64, 64, 32);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(64, 64, 16);
        
        // Generate texture
        graphics.generateTexture('explosion', 128, 128);
        graphics.destroy();
    }

    private createParticleTexture(): void {
        try {
            console.log('Creating particle texture...');
            
            // Create a canvas for the particle
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                // Create a radial gradient for a glowing particle
                const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.3, '#ffffaa');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 16, 16);
                
                // Add the texture to the game using type assertion
                (this as any).textures.addCanvas('particle', canvas);
                
                // Also create specific particle types
                this.createFlameParticleTexture();
                this.createSmokeParticleTexture();
                this.createSparkParticleTexture();
                this.createGlowParticleTexture();
                
                console.log('Particle texture created successfully');
            }
        } catch (error) {
            console.error('Error creating particle texture:', error);
        }
    }
    
    private createFlameParticleTexture(): void {
        try {
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
                
                // Add the texture to the game using type assertion
                (this as any).textures.addCanvas('flame-particle', canvas);
                console.log('Flame particle texture created successfully');
            }
        } catch (error) {
            console.error('Error creating flame particle texture:', error);
        }
    }
    
    private createSmokeParticleTexture(): void {
        try {
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
                
                // Add the texture to the game using type assertion
                (this as any).textures.addCanvas('smoke-particle', canvas);
                console.log('Smoke particle texture created successfully');
            }
        } catch (error) {
            console.error('Error creating smoke particle texture:', error);
        }
    }
    
    private createSparkParticleTexture(): void {
        try {
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
                gradient.addColorStop(1, 'rgba(255, 136, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 16, 16);
                
                // Add the texture to the game using type assertion
                (this as any).textures.addCanvas('spark-particle', canvas);
                console.log('Spark particle texture created successfully');
            }
        } catch (error) {
            console.error('Error creating spark particle texture:', error);
        }
    }
    
    private createGlowParticleTexture(): void {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                // Create a soft glow
                const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
                gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
                gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.4)');
                gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 32, 32);
                
                // Add the texture to the game using type assertion
                (this as any).textures.addCanvas('glow-particle', canvas);
                console.log('Glow particle texture created successfully');
            }
        } catch (error) {
            console.error('Error creating glow particle texture:', error);
        }
    }

    private createParallaxStarTextures(): void {
        try {
            console.log('Creating parallax star textures...');
            
            // Create different star textures for parallax layers
            this.createStarTexture('stars-far', 100, 0.5, 1.5, 0.7); // Fewer, smaller stars for far layer
            this.createStarTexture('stars-mid', 150, 0.8, 2, 0.8);   // Medium density and size
            this.createStarTexture('stars-near', 200, 1, 2.5, 1);    // More, larger stars for near layer
            
            console.log('Parallax star textures created successfully');
        } catch (error) {
            console.error('Error creating parallax star textures:', error);
        }
    }
    
    private createStarTexture(name: string, count: number, minSize: number, maxSize: number, maxBrightness: number): void {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars with varying sizes and brightness
        for (let i = 0; i < count; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = minSize + Math.random() * (maxSize - minSize);
            const brightness = 0.3 + Math.random() * maxBrightness * 0.7; // Ensure minimum brightness
            
            // Create a radial gradient for a more realistic star
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
            gradient.addColorStop(0.6, `rgba(200, 220, 255, ${brightness * 0.6})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Occasionally add a twinkle effect (cross shape)
            if (Math.random() > 0.9 && size > 1.5) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.7})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(x - size * 2, y);
                ctx.lineTo(x + size * 2, y);
                ctx.moveTo(x, y - size * 2);
                ctx.lineTo(x, y + size * 2);
                ctx.stroke();
            }
        }
        
        // Add the texture to the game using type assertion
        (this as any).textures.addCanvas(name, canvas);
    }
} 