import Phaser from 'phaser';

export class GameUI {
    private scene: Phaser.Scene;
    private levelText: Phaser.GameObjects.Text;
    private scoreText: Phaser.GameObjects.Text;
    private fuelText: Phaser.GameObjects.Text;
    private fuelBar: Phaser.GameObjects.Graphics;
    private windText: Phaser.GameObjects.Text;
    private statsText: Phaser.GameObjects.Text;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create UI elements
        this.levelText = this.scene.add.text(20, 20, 'LEVEL: 1', {
            font: '18px monospace',
            color: '#ffffff'
        });
        
        this.scoreText = this.scene.add.text(20, 50, 'SCORE: 0', {
            font: '18px monospace',
            color: '#ffffff'
        });
        
        // Create smaller fuel text and bar
        this.fuelText = this.scene.add.text(20, 80, 'FUEL:', {
            font: '18px monospace',
            color: '#ffffff'
        });
        
        this.fuelBar = this.scene.add.graphics();
        this.updateFuelBar(100);
        
        // Wind indicator
        this.windText = this.scene.add.text(
            width - 150, 
            20, 
            'WIND: → 0', 
            {
                font: '18px monospace',
                color: '#ffffff'
            }
        );
        
        // Stats text (velocity, angle, etc.) - positioned at top center
        this.statsText = this.scene.add.text(
            width / 2,
            20,
            'Vel X: 0 | Vel Y: 0 | Angle: 0',
            {
                font: '14px monospace',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { left: 5, right: 5, top: 3, bottom: 3 }
            }
        );
        this.statsText.setOrigin(0.5, 0);
        
        // Set depth to ensure UI is always on top
        this.levelText.setDepth(10);
        this.scoreText.setDepth(10);
        this.fuelText.setDepth(10);
        this.fuelBar.setDepth(10);
        this.windText.setDepth(10);
        this.statsText.setDepth(10);
    }
    
    updateLevel(level: number): void {
        this.levelText.setText(`LEVEL: ${level}`);
    }
    
    updateScore(score: number): void {
        this.scoreText.setText(`SCORE: ${score}`);
    }
    
    updateFuelBar(fuelPercentage: number): void {
        this.fuelBar.clear();
        
        // Smaller fuel bar (100 pixels wide instead of 150)
        const barWidth = 100;
        const barHeight = 10; // Smaller height
        
        // Draw background
        this.fuelBar.fillStyle(0x333333, 1);
        this.fuelBar.fillRect(80, 85, barWidth, barHeight);
        
        // Calculate fill width based on percentage
        const fillWidth = Math.max(0, Math.min(barWidth * (fuelPercentage / 100), barWidth));
        
        // Choose color based on fuel level
        let color = 0x00ff00; // Green
        if (fuelPercentage < 30) {
            color = 0xff0000; // Red for low fuel
        } else if (fuelPercentage < 60) {
            color = 0xffff00; // Yellow for medium fuel
        }
        
        // Draw fuel level
        this.fuelBar.fillStyle(color, 1);
        this.fuelBar.fillRect(80, 85, fillWidth, barHeight);
        
        // Draw border
        this.fuelBar.lineStyle(1, 0xffffff, 1);
        this.fuelBar.strokeRect(80, 85, barWidth, barHeight);
        
        if (fuelPercentage <= 0) {
            this.fuelText.setText('FUEL: EMPTY');
        } else {
            this.fuelText.setText('FUEL:');
        }
    }
    
    updateWind(wind: number): void {
        const direction = wind > 0 ? '→' : '←';
        this.windText.setText(`WIND: ${direction} ${Math.abs(wind)}`);
    }
    
    updateStats(velX: number, velY: number, angle: number, fuel: number): void {
        this.statsText.setText(
            `Vel X: ${Math.round(velX)} | Vel Y: ${Math.round(velY)} | Angle: ${Math.round(angle)} | Fuel: ${Math.round(fuel)}`
        );
    }
    
    showMessage(message: string, color: string = '#ffffff', fontSize: number = 32): Phaser.GameObjects.Text {
        const text = this.scene.add.text(
            this.scene.cameras.main.width / 2, 
            this.scene.cameras.main.height / 2, 
            message, 
            {
                font: `${fontSize}px monospace`,
                color: color,
                align: 'center',
                backgroundColor: '#000000',
                padding: { left: 10, right: 10, top: 5, bottom: 5 }
            }
        );
        text.setOrigin(0.5);
        text.setDepth(20); // Ensure messages are on top of everything
        return text;
    }
    
    showSuccessMessage(): Phaser.GameObjects.Text {
        return this.showMessage('LANDING SUCCESSFUL!', '#00ff00');
    }
    
    showFailureMessage(): Phaser.GameObjects.Text[] {
        const failText = this.showMessage('LANDING FAILED!', '#ff0000');
        
        const restartText = this.scene.add.text(
            this.scene.cameras.main.width / 2, 
            this.scene.cameras.main.height / 2 + 50, 
            'Press SPACE to try again', 
            {
                font: '18px monospace',
                color: '#ffffff',
                align: 'center',
                backgroundColor: '#000000',
                padding: { left: 10, right: 10, top: 5, bottom: 5 }
            }
        );
        restartText.setOrigin(0.5);
        restartText.setDepth(20);
        
        return [failText, restartText];
    }
} 