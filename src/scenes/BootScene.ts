import Phaser from 'phaser';
import { SpriteGenerator } from '../utils/SpriteGenerator';
import { AudioManager } from '../utils/AudioManager';

// Minimal type declarations for missing Phaser methods
declare module 'phaser' {
    namespace GameObjects {
        interface Image {
            alpha: number;
            width: number;
            setOrigin(x: number, y?: number): this;
            setScale(scale: number): this;
        }
        
        interface Text {
            alpha: number;
            setOrigin(x: number, y?: number): this;
        }
        
        interface Graphics {
            alpha: number;
            fillStyle(color: number, alpha?: number): this;
            fillRect(x: number, y: number, width: number, height: number): this;
            lineStyle(lineWidth: number, color: number, alpha?: number): this;
            strokeRect(x: number, y: number, width: number, height: number): this;
            beginPath(): this;
            moveTo(x: number, y: number): this;
            lineTo(x: number, y: number): this;
            closePath(): this;
            strokePath(): this;
            fillPath(): this;
        }
        
        interface Container {
            alpha: number;
            add(gameObjects: Phaser.GameObjects.GameObject[]): this;
        }
        
        interface GameObjectFactory {
            rectangle(x: number, y: number, width: number, height: number, fillColor?: number, fillAlpha?: number): Phaser.GameObjects.Rectangle;
            graphics(config?: any): Phaser.GameObjects.Graphics;
            container(x: number, y: number): Phaser.GameObjects.Container;
        }
    }
    
    namespace Input {
        interface InputPlugin {
            on(event: string, callback: Function, context?: any): this;
            off(event: string, callback: Function, context?: any): this;
        }
    }
    
    namespace Textures {
        interface TextureManager {
            exists(key: string): boolean;
        }
    }
    
    namespace Scene {
        interface Systems {
            textures: Phaser.Textures.TextureManager;
        }
    }
}

/**
 * BootScene - The initial scene that loads minimal assets and displays the game logo
 */
export class BootScene extends Phaser.Scene {
    private logoContainer: Phaser.GameObjects.Container | null = null;
    private logo: Phaser.GameObjects.Image | null = null;
    private audioManager: AudioManager | null = null;
    public registry: any; // Add registry property
    private useCustomLogo: boolean = false;

    constructor() {
        super('BootScene');
    }

    preload(): void {
        // We'll use the custom logo by default since the file loading is having issues
        this.useCustomLogo = true;
        
        // Create a loading text
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const loadingText = this.add.text(width / 2, height / 2 + 50, 'Loading...', {
            font: '20px monospace',
            color: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);
    }

    create(): void {
        console.log('BootScene: create() called');
        try {
            const width = this.cameras.main.width;
            const height = this.cameras.main.height;
            
            // Initialize audio manager
            this.audioManager = new AudioManager(this);
            
            // Store audio manager in registry for other scenes to access
            if (!this.registry.values) {
                this.registry.values = {};
            }
            this.registry.values.audioManager = this.audioManager;
            
            // Display the logo
            this.displayLogo(width, height);
            
            // Generate sprites using our sprite generator
            const spriteGenerator = new SpriteGenerator(this);
            spriteGenerator.generateAllSprites();
            
            // Show continue message
            this.showContinueMessage();
            
            // Add click/tap handler for the entire scene
            this.input.on('pointerdown', this.handleUserInteraction, this);
            
        } catch (error) {
            console.error('Error in BootScene.create():', error);
            this.proceedToNextScene();
        }
    }
    
    /**
     * Display the SpaceX logo
     */
    private displayLogo(width: number, height: number): void {
        // Always use the custom logo since file loading is having issues
        this.createCustomLogo(width, height);
    }
    
    /**
     * Create a custom SpaceX-like logo using graphics
     */
    private createCustomLogo(width: number, height: number): void {
        // Create a container for the logo elements - position it higher up and to the right
        this.logoContainer = this.add.container(width * 0.55, height * 0.35);
        
        // Create a background for the logo
        const logoBg = this.add.graphics();
        logoBg.fillStyle(0x000000, 0.5);
        logoBg.fillRect(-180, -50, 360, 100);
        
        // Create the "SPACE" text with improved styling
        const spaceText = this.add.text(0, 0, 'SPACE', {
            font: 'bold 56px Arial',
            color: '#ffffff'
        });
        spaceText.setOrigin(1, 0.5); // Right align
        spaceText.setPosition(-15, 0); // Position to the left of center
        
        // Create the "X" text with improved styling
        const xText = this.add.text(0, 0, 'X', {
            font: 'bold 56px Arial',
            color: '#ffffff'
        });
        xText.setOrigin(0, 0.5); // Left align
        xText.setPosition(15, 0); // Position to the right of center
        
        // Add a line between the texts
        const graphics = this.add.graphics();
        graphics.lineStyle(4, 0xffffff, 1);
        graphics.beginPath();
        graphics.moveTo(0, -35);
        graphics.lineTo(0, 35);
        graphics.strokePath();
        
        // Add all elements to the container
        if (this.logoContainer) {
            this.logoContainer.add([logoBg, spaceText, xText, graphics]);
            
            // Add a fade-in effect
            this.logoContainer.alpha = 0;
            this.tweens.add({
                targets: this.logoContainer,
                alpha: 1,
                duration: 1000,
                ease: 'Power2'
            });
        }
    }
    
    /**
     * Show the "Click to Continue" message
     */
    private showContinueMessage(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a container for the message - position it lower
        const bg = this.add.rectangle(width / 2, height * 0.75, 300, 80, 0x000000, 0.7);
        
        // Add the main message
        const continueMessage = this.add.text(width / 2, height * 0.75, 'CLICK TO CONTINUE', {
            font: 'bold 24px Arial',
            color: '#ffffff',
            align: 'center'
        });
        continueMessage.setOrigin(0.5);
        
        // Add a pulsing effect to draw attention
        this.tweens.add({
            targets: continueMessage,
            alpha: { from: 1, to: 0.5 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * Handle user interaction (click/tap)
     */
    private handleUserInteraction(): void {
        // Try to unlock audio
        if (this.audioManager) {
            this.audioManager.unlock();
        }
        
        // Remove the event listener to prevent multiple calls
        this.input.off('pointerdown', this.handleUserInteraction, this);
        
        // Proceed with the scene transition after a short delay
        this.time.delayedCall(1000, () => {
            this.fadeOutAndProceed();
        });
    }
    
    /**
     * Fade out the logo and proceed to the next scene
     */
    private fadeOutAndProceed(): void {
        if (this.logo) {
            this.tweens.add({
                targets: this.logo,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    this.proceedToNextScene();
                }
            });
        } else if (this.logoContainer) {
            this.tweens.add({
                targets: this.logoContainer,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    this.proceedToNextScene();
                }
            });
        } else {
            this.proceedToNextScene();
        }
    }
    
    /**
     * Proceed to the next scene
     */
    private proceedToNextScene(): void {
        console.log('BootScene: Proceeding to PreloadScene');
        this.scene.start('PreloadScene');
    }
} 