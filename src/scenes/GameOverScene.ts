import Phaser from 'phaser';
import * as Storage from '../utils/storage';

export class GameOverScene extends Phaser.Scene {
    private score: number = 0;
    private success: boolean = false;
    private reason: string = '';
    private level: number = 1;
    
    constructor() {
        super('GameOverScene');
    }
    
    init(data: { score: number, success?: boolean, reason?: string, level?: number }): void {
        this.score = data.score || 0;
        this.success = data.success !== undefined ? data.success : false;
        this.reason = data.reason || '';
        this.level = data.level || 1;
        console.log('GameOverScene initialized with:', { score: this.score, success: this.success, reason: this.reason, level: this.level });
    }
    
    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add background
        this.add.image(width / 2, height / 2, 'background');
        
        // Add stars
        const stars = this.add.tileSprite(width / 2, height / 2, width, height, 'stars');
        
        // Add game over text based on success or failure
        let titleText: string;
        let titleColor: string;
        
        if (this.success) {
            titleText = 'MISSION COMPLETE';
            titleColor = '#4CAF50';
        } else {
            titleText = 'MISSION FAILED';
            titleColor = '#ff0000';
        }
        
        const gameOverText = this.add.text(width / 2, height / 4, titleText, {
            font: '48px monospace',
            color: titleColor,
            backgroundColor: '#000000',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        });
        gameOverText.setOrigin(0.5);
        
        // Add reason text if available
        if (this.reason && !this.success) {
            const reasonText = this.add.text(width / 2, height / 3, this.reason, {
                font: '24px monospace',
                color: '#ffffff'
            });
            reasonText.setOrigin(0.5);
        }
        
        // Add level reached text
        const levelText = this.add.text(width / 2, height / 3 + 40, `LEVEL REACHED: ${this.level}`, {
            font: '24px monospace',
            color: '#ffffff'
        });
        levelText.setOrigin(0.5);
        
        // Add score text
        const scoreText = this.add.text(width / 2, height / 2, `FINAL SCORE: ${this.score}`, {
            font: '32px monospace',
            color: '#ffffff',
            resolution: 2,
            testString: 'FINAL SCORE: 0123456789'
        });
        scoreText.setOrigin(0.5);
        
        // Add high score message if applicable
        const highScore = this.getHighScore();
        if (this.score > highScore) {
            this.setHighScore(this.score);
            
            const newHighScoreText = this.add.text(width / 2, height / 2 + 50, 'NEW HIGH SCORE!', {
                font: '24px monospace',
                color: '#ffff00'
            });
            newHighScoreText.setOrigin(0.5);
        } else {
            const highScoreText = this.add.text(width / 2, height / 2 + 50, `HIGH SCORE: ${highScore}`, {
                font: '24px monospace',
                color: '#cccccc'
            });
            highScoreText.setOrigin(0.5);
        }
        
        // Add restart button
        const restartButton = this.add.text(width / 2, height * 2/3, 'NEW MISSION', {
            font: '32px monospace',
            color: '#ffffff',
            backgroundColor: '#1a73e8',
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive({ useHandCursor: true });
        
        // Button hover effect
        restartButton.on('pointerover', () => {
            restartButton.setStyle({ backgroundColor: '#4285f4' });
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setStyle({ backgroundColor: '#1a73e8' });
        });
        
        // Restart game on click
        restartButton.on('pointerdown', () => {
            // Reset score in storage before starting a new game
            Storage.saveScore(0);
            
            this.scene.start('MenuScene');
        });
        
        // Add menu button
        const menuButton = this.add.text(width / 2, height * 2/3 + 60, 'MAIN MENU', {
            font: '24px monospace',
            color: '#ffffff',
            backgroundColor: '#555555',
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        });
        menuButton.setOrigin(0.5);
        menuButton.setInteractive({ useHandCursor: true });
        
        // Button hover effect
        menuButton.on('pointerover', () => {
            menuButton.setStyle({ backgroundColor: '#777777' });
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setStyle({ backgroundColor: '#555555' });
        });
        
        // Go to menu on click
        menuButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        // Add animation to stars
        this.tweens.add({
            targets: stars,
            tilePositionX: { from: 0, to: 100 },
            ease: 'Linear',
            duration: 8000,
            repeat: -1
        });
        
        // Play appropriate sound
        if (this.success) {
            try {
                this.sound.play('success', { volume: 0.8 });
            } catch (error) {
                console.error('Error playing success sound:', error);
            }
        } else {
            try {
                this.sound.play('explosion', { volume: 0.8 });
            } catch (error) {
                console.error('Error playing explosion sound:', error);
            }
        }
    }
    
    private getHighScore(): number {
        const highScore = localStorage.getItem('falconLanderHighScore');
        return highScore ? parseInt(highScore) : 0;
    }
    
    private setHighScore(score: number): void {
        localStorage.setItem('falconLanderHighScore', score.toString());
    }
} 