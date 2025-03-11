import Phaser from 'phaser';

/**
 * Utility class to generate game sprites using HTML5 Canvas
 * This is used to create placeholder sprites when no assets are available
 */
export class SpriteGenerator {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Generate all game sprites
     */
    generateAllSprites(): void {
        console.log('Generating all sprites...');
        try {
            this.generateRocket();
            this.generatePlatforms();
            this.generateBackgrounds();
            this.generateStars();
            this.generateParticles();
            this.generateFlameParticle();
            this.generateSmokeParticle();
            this.generateSparkParticle();
            this.generateGlowParticle();
            this.generateLogo();
            this.generateAsteroid();
            this.generatePowerUps();
            console.log('All sprites generated successfully!');
        } catch (error) {
            console.error('Error generating sprites:', error);
        }
    }

    /**
     * Generate a Falcon 9 rocket sprite
     */
    generateRocket(): void {
        console.log('Generating Falcon 9 rocket sprite...');
        try {
            const rocketCanvas = document.createElement('canvas');
            rocketCanvas.width = 32;
            rocketCanvas.height = 96; // Taller for more accurate proportions
            const ctx = rocketCanvas.getContext('2d');
            if (!ctx) return;

            // Falcon 9 first stage (white with gray details)
            ctx.fillStyle = '#f8f8f8'; // Light white/gray for the main body
            ctx.beginPath();
            ctx.moveTo(10, 20); // Top of first stage
            ctx.lineTo(22, 20);
            ctx.lineTo(22, 80); // Bottom of first stage
            ctx.lineTo(10, 80);
            ctx.closePath();
            ctx.fill();
            
            // Grid fins (gray)
            ctx.fillStyle = '#aaaaaa';
            ctx.fillRect(8, 22, 2, 8); // Left grid fin
            ctx.fillRect(22, 22, 2, 8); // Right grid fin
            
            // Landing legs (retracted)
            ctx.fillStyle = '#888888';
            ctx.fillRect(8, 75, 3, 5); // Left leg
            ctx.fillRect(21, 75, 3, 5); // Right leg
            
            // Second stage / payload fairing (white)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(16, 0); // Tip of the rocket
            ctx.lineTo(24, 20); // Fairing bottom right
            ctx.lineTo(8, 20); // Fairing bottom left
            ctx.closePath();
            ctx.fill();
            
            // SpaceX logo (blue)
            ctx.fillStyle = '#005288'; // SpaceX blue
            ctx.fillRect(13, 40, 6, 2);
            
            // Interstage (black band)
            ctx.fillStyle = '#333333';
            ctx.fillRect(10, 20, 12, 2);
            
            // Engine section (dark gray)
            ctx.fillStyle = '#555555';
            ctx.fillRect(10, 80, 12, 4);
            
            // Merlin engines (simplified)
            ctx.fillStyle = '#333333';
            ctx.beginPath();
            ctx.arc(13, 84, 2, 0, Math.PI * 2); // Left engine
            ctx.fill();
            ctx.beginPath();
            ctx.arc(19, 84, 2, 0, Math.PI * 2); // Right engine
            ctx.fill();
            
            // Engine exhaust/flames when thrusting
            ctx.fillStyle = '#ff6600'; // Orange flame
            ctx.beginPath();
            ctx.moveTo(13, 86);
            ctx.lineTo(11, 92);
            ctx.lineTo(15, 92);
            ctx.closePath();
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(19, 86);
            ctx.lineTo(17, 92);
            ctx.lineTo(21, 92);
            ctx.closePath();
            ctx.fill();
            
            // Add some details with lines
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 0.5;
            
            // Vertical lines on first stage
            ctx.beginPath();
            ctx.moveTo(16, 22);
            ctx.lineTo(16, 80);
            ctx.stroke();
            
            // Generate texture
            this.scene.textures.addCanvas('rocket', rocketCanvas);
            console.log('Falcon 9 rocket sprite generated successfully!');
        } catch (error) {
            console.error('Error generating rocket sprite:', error);
        }
    }

    /**
     * Generate platforms
     */
    generatePlatforms(): void {
        console.log('Generating platforms...');
        try {
            // Ocean platform (ship)
            this.generatePlatform('platform-ship', '#2c5282', '#4299e1', true);
            
            // Mountain platform
            this.generatePlatform('platform-mountain', '#4a5568', '#718096', false);
            
            // Moon platform
            this.generatePlatform('platform-moon', '#718096', '#a0aec0', true);
            
            // Space station platform
            this.generatePlatform('platform-station', '#2d3748', '#4a5568', true);
            
            // Mars platform
            this.generatePlatform('platform-mars', '#c53030', '#e53e3e', true);
            console.log('All platforms generated successfully!');
        } catch (error) {
            console.error('Error generating platforms:', error);
        }
    }

    /**
     * Generate a platform
     */
    generatePlatform(key: string, baseColor: string, topColor: string, addLights: boolean): void {
        console.log(`Generating ${key} platform...`);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Draw platform base
            ctx.fillStyle = baseColor;
            ctx.fillRect(0, 16, 128, 16);

            // Draw platform top
            ctx.fillStyle = topColor;
            ctx.fillRect(0, 0, 128, 16);

            // Add landing lights if needed
            if (addLights) {
                const lightCount = 5;
                const spacing = 128 / (lightCount + 1);
                ctx.fillStyle = '#ffd700';
                for (let i = 1; i <= lightCount; i++) {
                    ctx.beginPath();
                    ctx.arc(i * spacing, 8, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Generate texture
            this.scene.textures.addCanvas(key, canvas);
            console.log(`${key} platform generated successfully!`);
        } catch (error) {
            console.error(`Error generating ${key} platform:`, error);
        }
    }

    /**
     * Generate backgrounds
     */
    generateBackgrounds(): void {
        console.log('Generating backgrounds...');
        try {
            // Ocean background
            this.generateOceanBackground();
            
            // Mountain background
            this.generateMountainBackground();
            
            // Moon background
            this.generateMoonBackground();
            
            // Space background
            this.generateSpaceBackground();
            
            // Mars background
            this.generateMarsBackground();
            console.log('All backgrounds generated successfully!');
        } catch (error) {
            console.error('Error generating backgrounds:', error);
        }
    }

    /**
     * Generate an ocean background
     */
    generateOceanBackground(): void {
        console.log('Generating ocean background...');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Sky gradient
            const skyGradient = ctx.createLinearGradient(0, 0, 0, 400);
            skyGradient.addColorStop(0, '#4a90e2');
            skyGradient.addColorStop(1, '#87ceeb');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, 800, 600);

            // Ocean gradient
            const oceanGradient = ctx.createLinearGradient(0, 400, 0, 600);
            oceanGradient.addColorStop(0, '#0077be');
            oceanGradient.addColorStop(1, '#005a8c');
            ctx.fillStyle = oceanGradient;
            ctx.fillRect(0, 400, 800, 200);

            // Add some clouds
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * 800;
                const y = Math.random() * 200 + 50;
                this.drawCloud(ctx, x, y);
            }

            this.scene.textures.addCanvas('background-ocean', canvas);
            console.log('Ocean background generated successfully!');
        } catch (error) {
            console.error('Error generating ocean background:', error);
        }
    }

    /**
     * Generate a mountain background
     */
    generateMountainBackground(): void {
        console.log('Generating mountain background...');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Sky gradient
            const skyGradient = ctx.createLinearGradient(0, 0, 0, 600);
            skyGradient.addColorStop(0, '#b3d9ff');
            skyGradient.addColorStop(1, '#e6f2ff');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, 800, 600);

            // Draw mountains
            ctx.fillStyle = '#4a5568';
            this.drawMountainRange(ctx, 0, 400, 3);
            
            // Draw snow caps
            ctx.fillStyle = '#ffffff';
            this.drawMountainRange(ctx, 0, 400, 3, true);

            this.scene.textures.addCanvas('background-mountain', canvas);
            console.log('Mountain background generated successfully!');
        } catch (error) {
            console.error('Error generating mountain background:', error);
        }
    }

    /**
     * Generate a moon background
     */
    generateMoonBackground(): void {
        console.log('Generating moon background...');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Space background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 800, 600);

            // Add stars
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * 800;
                const y = Math.random() * 600;
                const size = Math.random() * 2;
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
                ctx.fillRect(x, y, size, size);
            }

            // Draw Earth in the background
            ctx.beginPath();
            ctx.arc(700, 100, 60, 0, Math.PI * 2);
            const earthGradient = ctx.createRadialGradient(700, 100, 0, 700, 100, 60);
            earthGradient.addColorStop(0, '#4a90e2');
            earthGradient.addColorStop(1, '#2c5282');
            ctx.fillStyle = earthGradient;
            ctx.fill();

            // Draw lunar surface
            const surfaceGradient = ctx.createLinearGradient(0, 400, 0, 600);
            surfaceGradient.addColorStop(0, '#a0aec0');
            surfaceGradient.addColorStop(1, '#718096');
            ctx.fillStyle = surfaceGradient;
            this.drawCraters(ctx);

            this.scene.textures.addCanvas('background-moon', canvas);
            console.log('Moon background generated successfully!');
        } catch (error) {
            console.error('Error generating moon background:', error);
        }
    }

    /**
     * Generate a space background
     */
    generateSpaceBackground(): void {
        console.log('Generating space background...');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Deep space background
            const spaceGradient = ctx.createLinearGradient(0, 0, 800, 600);
            spaceGradient.addColorStop(0, '#000000');
            spaceGradient.addColorStop(0.5, '#090b1f');
            spaceGradient.addColorStop(1, '#000000');
            ctx.fillStyle = spaceGradient;
            ctx.fillRect(0, 0, 800, 600);

            // Add stars
            for (let i = 0; i < 300; i++) {
                const x = Math.random() * 800;
                const y = Math.random() * 600;
                const size = Math.random() * 2;
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
                ctx.fillRect(x, y, size, size);
            }

            // Add a nebula
            this.drawNebula(ctx);

            this.scene.textures.addCanvas('background-space', canvas);
            console.log('Space background generated successfully!');
        } catch (error) {
            console.error('Error generating space background:', error);
        }
    }

    /**
     * Generate a mars background
     */
    generateMarsBackground(): void {
        console.log('Generating mars background...');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Mars sky gradient
            const skyGradient = ctx.createLinearGradient(0, 0, 0, 600);
            skyGradient.addColorStop(0, '#ffa07a');
            skyGradient.addColorStop(1, '#ff6b6b');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, 800, 600);

            // Draw Mars surface
            const surfaceGradient = ctx.createLinearGradient(0, 400, 0, 600);
            surfaceGradient.addColorStop(0, '#c53030');
            surfaceGradient.addColorStop(1, '#9b2c2c');
            ctx.fillStyle = surfaceGradient;
            this.drawMarsianTerrain(ctx);

            this.scene.textures.addCanvas('background-mars', canvas);
            console.log('Mars background generated successfully!');
        } catch (error) {
            console.error('Error generating mars background:', error);
        }
    }

    /**
     * Generate particle texture for thruster and explosion effects
     */
    generateParticles(): void {
        console.log('Generating particles sprite...');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 8;
            canvas.height = 8;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const gradient = ctx.createRadialGradient(4, 4, 0, 4, 4, 4);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 8, 8);

            this.scene.textures.addCanvas('particles', canvas);
            console.log('Particles sprite generated successfully!');
        } catch (error) {
            console.error('Error generating particles:', error);
        }
    }

    /**
     * Generate a flame particle texture for rocket thrust
     */
    generateFlameParticle(): void {
        console.log('Generating flame particle sprite...');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 32; // Larger size for better visibility
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Create a radial gradient for the flame
            const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, '#ffffff'); // Bright white center for intensity
            gradient.addColorStop(0.2, '#ffff00'); // Bright yellow
            gradient.addColorStop(0.4, '#ff7700'); // Orange
            gradient.addColorStop(0.7, '#ff3300'); // Red-orange
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)'); // Transparent red edge
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 32, 32);
            
            // Add some texture to make it more flame-like
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            
            // Add some random "flickers"
            for (let i = 0; i < 8; i++) {
                const x = 8 + Math.random() * 16;
                const y = 8 + Math.random() * 16;
                const size = 3 + Math.random() * 6;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            this.scene.textures.addCanvas('flame-particle', canvas);
            console.log('Flame particle sprite generated successfully!');
        } catch (error) {
            console.error('Error generating flame particle:', error);
        }
    }
    
    /**
     * Generate a smoke particle texture for rocket thrust
     */
    generateSmokeParticle(): void {
        console.log('Generating smoke particle sprite...');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 32; // Larger size for better visibility
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Create a radial gradient for the smoke
            const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, 'rgba(220, 220, 220, 0.9)'); // Light gray center
            gradient.addColorStop(0.3, 'rgba(180, 180, 180, 0.7)'); // Medium gray
            gradient.addColorStop(0.6, 'rgba(120, 120, 120, 0.5)'); // Darker gray
            gradient.addColorStop(1, 'rgba(80, 80, 80, 0)'); // Transparent edge
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 32, 32);
            
            // Add some texture to make it more cloud-like
            ctx.globalCompositeOperation = 'overlay';
            
            // Add some random "puffs"
            for (let i = 0; i < 12; i++) {
                const x = 8 + Math.random() * 16;
                const y = 8 + Math.random() * 16;
                const size = 4 + Math.random() * 8;
                const alpha = 0.2 + Math.random() * 0.3;
                
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            this.scene.textures.addCanvas('smoke-particle', canvas);
            console.log('Smoke particle sprite generated successfully!');
        } catch (error) {
            console.error('Error generating smoke particle:', error);
        }
    }
    
    /**
     * Generate a spark particle texture for rocket thrust
     */
    generateSparkParticle(): void {
        console.log('Generating spark particle sprite...');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 16; // Larger size for better visibility
            canvas.height = 16;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Create a bright center point
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(8, 8, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add a glow around it
            const gradient = ctx.createRadialGradient(8, 8, 2, 8, 8, 8);
            gradient.addColorStop(0, 'rgba(255, 255, 200, 1.0)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 100, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(8, 8, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Add some random streaks for a spark effect
            ctx.strokeStyle = 'rgba(255, 255, 200, 0.9)';
            ctx.lineWidth = 1;
            
            for (let i = 0; i < 6; i++) {
                const angle = Math.random() * Math.PI * 2;
                const length = 4 + Math.random() * 4;
                
                ctx.beginPath();
                ctx.moveTo(8, 8);
                ctx.lineTo(
                    8 + Math.cos(angle) * length,
                    8 + Math.sin(angle) * length
                );
                ctx.stroke();
            }

            this.scene.textures.addCanvas('spark-particle', canvas);
            console.log('Spark particle sprite generated successfully!');
        } catch (error) {
            console.error('Error generating spark particle:', error);
        }
    }
    
    /**
     * Generate a glow particle texture for rocket thrust
     */
    generateGlowParticle(): void {
        console.log('Generating glow particle sprite...');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 64; // Larger size for better visibility
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Create a soft glow effect
            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 220, 100, 0.6)'); // Soft yellow center
            gradient.addColorStop(0.3, 'rgba(255, 150, 50, 0.4)'); // Orange middle
            gradient.addColorStop(0.7, 'rgba(255, 100, 0, 0.2)'); // Darker orange
            gradient.addColorStop(1, 'rgba(255, 50, 0, 0)'); // Transparent red edge
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);

            this.scene.textures.addCanvas('glow-particle', canvas);
            console.log('Glow particle sprite generated successfully!');
        } catch (error) {
            console.error('Error generating glow particle:', error);
        }
    }

    /**
     * Generate a simplified SpaceX logo
     */
    generateLogo(): void {
        console.log('Generating spacex-logo sprite...');
        try {
            const graphics = this.scene.make.graphics({ x: 0, y: 0 });
            
            // Background (transparent)
            graphics.fillStyle(0x000000, 0);
            graphics.fillRect(0, 0, 256, 128);
            
            // "SpaceX" text (simplified as a blue shape)
            graphics.fillStyle(0x005288);
            
            // "SPACE" part
            graphics.fillRect(32, 48, 16, 32); // S
            graphics.fillRect(56, 48, 16, 32); // P
            graphics.fillRect(80, 48, 16, 32); // A
            graphics.fillRect(104, 48, 16, 32); // C
            graphics.fillRect(128, 48, 16, 32); // E
            
            // "X" part
            graphics.fillStyle(0xff0000);
            graphics.fillTriangle(160, 48, 176, 80, 144, 80); // X (simplified)
            graphics.fillTriangle(176, 48, 192, 80, 208, 48); // X (simplified)
            
            // Generate texture
            graphics.generateTexture('spacex-logo', 256, 128);
            graphics.destroy();
            console.log('spacex-logo sprite generated successfully!');
        } catch (error) {
            console.error('Error generating spacex-logo:', error);
        }
    }

    /**
     * Generate an asteroid sprite
     */
    generateAsteroid(): void {
        console.log('Generating asteroid sprite...');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.fillStyle = '#4a5568';
            ctx.beginPath();
            ctx.arc(16, 16, 12, 0, Math.PI * 2);
            ctx.fill();

            // Add some texture/craters
            ctx.fillStyle = '#2d3748';
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 / 5) * i;
                const x = 16 + Math.cos(angle) * 8;
                const y = 16 + Math.sin(angle) * 8;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            this.scene.textures.addCanvas('asteroid', canvas);
            console.log('Asteroid sprite generated successfully!');
        } catch (error) {
            console.error('Error generating asteroid:', error);
        }
    }

    /**
     * Generate power-up sprites
     */
    generatePowerUps(): void {
        console.log('Generating power-up sprites...');
        try {
            // Create a spritesheet canvas
            const canvas = document.createElement('canvas');
            canvas.width = 128; // 4 sprites * 32 pixels
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Generate shield power-up (blue shield icon)
            ctx.save();
            ctx.translate(16, 16);
            ctx.fillStyle = '#4299e1';
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2b6cb0';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Add shield detail
            ctx.strokeStyle = '#63b3ed';
            ctx.beginPath();
            ctx.arc(0, 0, 8, -Math.PI * 0.25, Math.PI * 0.25);
            ctx.stroke();
            ctx.restore();

            // Generate fuel power-up (green fuel can)
            ctx.save();
            ctx.translate(48, 16);
            ctx.fillStyle = '#48bb78';
            ctx.fillRect(-8, -12, 16, 24);
            // Add fuel can details
            ctx.strokeStyle = '#2f855a';
            ctx.lineWidth = 2;
            ctx.strokeRect(-8, -12, 16, 24);
            ctx.fillStyle = '#2f855a';
            ctx.fillRect(-4, -14, 8, 4);
            ctx.restore();

            // Generate thrust power-up (orange flame)
            ctx.save();
            ctx.translate(80, 16);
            ctx.fillStyle = '#ed8936';
            // Draw flame shape
            ctx.beginPath();
            ctx.moveTo(-8, 12);
            ctx.quadraticCurveTo(-12, 0, -8, -12);
            ctx.quadraticCurveTo(0, -4, 8, -12);
            ctx.quadraticCurveTo(12, 0, 8, 12);
            ctx.quadraticCurveTo(0, 8, -8, 12);
            ctx.fill();
            // Add inner flame
            ctx.fillStyle = '#f6ad55';
            ctx.beginPath();
            ctx.moveTo(-4, 8);
            ctx.quadraticCurveTo(-6, 0, -4, -8);
            ctx.quadraticCurveTo(0, -2, 4, -8);
            ctx.quadraticCurveTo(6, 0, 4, 8);
            ctx.quadraticCurveTo(0, 6, -4, 8);
            ctx.fill();
            ctx.restore();

            // Generate stability power-up (purple gyroscope)
            ctx.save();
            ctx.translate(112, 16);
            // Outer ring
            ctx.strokeStyle = '#805ad5';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.stroke();
            // Inner ring
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.stroke();
            // Cross lines
            ctx.beginPath();
            ctx.moveTo(-12, 0);
            ctx.lineTo(12, 0);
            ctx.moveTo(0, -12);
            ctx.lineTo(0, 12);
            ctx.strokeStyle = '#6b46c1';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            // Generate texture
            this.scene.textures.addCanvas('powerups', canvas);
            
            // Generate shield effect sprite
            const shieldCanvas = document.createElement('canvas');
            shieldCanvas.width = 64;
            shieldCanvas.height = 64;
            const shieldCtx = shieldCanvas.getContext('2d');
            if (!shieldCtx) return;

            // Draw shield bubble effect
            const gradient = shieldCtx.createRadialGradient(32, 32, 20, 32, 32, 30);
            gradient.addColorStop(0, 'rgba(66, 153, 225, 0.1)');
            gradient.addColorStop(0.8, 'rgba(66, 153, 225, 0.3)');
            gradient.addColorStop(1, 'rgba(66, 153, 225, 0.5)');
            
            shieldCtx.fillStyle = gradient;
            shieldCtx.beginPath();
            shieldCtx.arc(32, 32, 30, 0, Math.PI * 2);
            shieldCtx.fill();

            // Add shield border
            shieldCtx.strokeStyle = 'rgba(66, 153, 225, 0.8)';
            shieldCtx.lineWidth = 2;
            shieldCtx.stroke();

            this.scene.textures.addCanvas('shield', shieldCanvas);
            console.log('Power-up sprites generated successfully!');
        } catch (error) {
            console.error('Error generating power-up sprites:', error);
        }
    }

    private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 15, y - 10, 15, 0, Math.PI * 2);
        ctx.arc(x + 15, y + 10, 15, 0, Math.PI * 2);
        ctx.arc(x + 30, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawMountainRange(ctx: CanvasRenderingContext2D, startX: number, startY: number, count: number, snow: boolean = false): void {
        for (let i = 0; i < count; i++) {
            const x = startX + (i * 300);
            const height = snow ? 200 : 250;
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x + 150, startY - height);
            ctx.lineTo(x + 300, startY);
            ctx.fill();
        }
    }

    private drawCraters(ctx: CanvasRenderingContext2D): void {
        // Draw base surface
        ctx.fillRect(0, 400, 800, 200);

        // Add craters
        ctx.fillStyle = '#718096';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 200 + 400;
            const size = Math.random() * 30 + 10;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    private drawNebula(ctx: CanvasRenderingContext2D): void {
        const colors = ['#ff6b6b', '#4a90e2', '#68d391'];
        colors.forEach(color => {
            ctx.fillStyle = color + '33';
            for (let i = 0; i < 5; i++) {
                const x = Math.random() * 800;
                const y = Math.random() * 600;
                const size = Math.random() * 100 + 50;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    private drawMarsianTerrain(ctx: CanvasRenderingContext2D): void {
        // Draw base surface
        ctx.fillRect(0, 400, 800, 200);

        // Add rock formations
        ctx.fillStyle = '#9b2c2c';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 100 + 450;
            const size = Math.random() * 20 + 5;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    private generateStars(): void {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 600;
            const size = Math.random() * 2;
            ctx.fillRect(x, y, size, size);
        }

        this.scene.textures.addCanvas('stars', canvas);
    }
} 