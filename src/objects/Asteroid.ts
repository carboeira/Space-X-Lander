import Phaser from 'phaser';

export class Asteroid extends Phaser.Physics.Arcade.Sprite {
    private speed: number = 0;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        // Call the parent constructor with the required parameters
        super(scene, x, y, 'asteroid');
        
        try {
            // Add to scene
            scene.add.existing(this);
            scene.physics.add.existing(this);
            
            // Set up physics properties
            this.setCircle(this.width / 3); // Smaller collision area
            this.setBounce(1);
            this.setCollideWorldBounds(true);
            
            // Make the asteroid visually smaller
            this.setScale(0.5);
            
            // Set random speed and direction
            this.speed = Phaser.Math.Between(50, 150);
            const angle = Phaser.Math.Between(0, 360);
            const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * this.speed;
            const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * this.speed;
            this.setVelocity(velocityX, velocityY);
            
            // Set random rotation
            this.setAngularVelocity(Phaser.Math.Between(-50, 50));
            
            // Set depth to ensure asteroids appear above background but below UI
            this.setDepth(5);
            
            // Set name for easier identification in collision handlers
            this.setName('asteroid');
            
            // Enable game object for physics
            if (this.body) {
                // Make sure the body is enabled
                this.body.enable = true;
                
                // Set the collision category
                this.body.setCollideWorldBounds(true);
                
                // Make sure the asteroid can collide with the rocket
                this.body.onCollide = true;
            }
            
            console.log('Asteroid initialized at', x, y);
        } catch (error) {
            console.error('Error initializing asteroid:', error);
        }
    }
    
    update(): void {
        try {
            // Ensure asteroid stays at a minimum speed
            if (this.body) {
                const currentSpeed = Math.sqrt(
                    Math.pow(this.body.velocity.x, 2) + 
                    Math.pow(this.body.velocity.y, 2)
                );
                
                if (currentSpeed < this.speed * 0.8) {
                    const angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
                    const velocityX = Math.cos(angle) * this.speed;
                    const velocityY = Math.sin(angle) * this.speed;
                    this.setVelocity(velocityX, velocityY);
                }
            }
        } catch (error) {
            console.error('Error updating asteroid:', error);
        }
    }
    
    reset(x: number, y: number): void {
        try {
            this.setPosition(x, y);
            
            // Set new random speed and direction
            this.speed = Phaser.Math.Between(50, 150);
            const angle = Phaser.Math.Between(0, 360);
            const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * this.speed;
            const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * this.speed;
            this.setVelocity(velocityX, velocityY);
            
            // Set new random rotation
            this.setAngularVelocity(Phaser.Math.Between(-50, 50));
            
            // Make sure the asteroid is visible and active
            this.setVisible(true);
            this.setActive(true);
            
            // Make sure the body is enabled
            if (this.body) {
                this.body.enable = true;
            }
        } catch (error) {
            console.error('Error resetting asteroid:', error);
        }
    }
} 