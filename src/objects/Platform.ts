import Phaser from 'phaser';

export class Platform extends Phaser.Physics.Arcade.Sprite {
    private isMoving: boolean = false;
    private moveSpeed: number = 50;
    
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        // Call the parent constructor with the required parameters
        super(scene, x, y, texture);
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set up physics properties
        this.setImmovable(true);
        this.setCollideWorldBounds(true);
    }
    
    startMoving(speed: number = 50, width: number = 800): void {
        if (this.isMoving) return;
        
        this.isMoving = true;
        this.moveSpeed = speed;
        
        // Create movement tween with wider boundaries to make landing more challenging
        // since the platform is smaller and moves more
        this.scene.tweens.add({
            targets: this,
            x: {
                from: 120,
                to: width - 120
            },
            ease: 'Sine.easeInOut',
            duration: 12000 / (this.moveSpeed * 0.01),
            yoyo: true,
            repeat: -1
        });
    }
    
    stopMoving(): void {
        if (!this.isMoving) return;
        
        this.isMoving = false;
        this.scene.tweens.killTweensOf(this);
    }
    
    setRandomPosition(minX: number, maxX: number, y: number): void {
        const x = Phaser.Math.Between(minX, maxX);
        this.setPosition(x, y);
    }
} 