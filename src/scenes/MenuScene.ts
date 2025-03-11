import Phaser from 'phaser';
import * as Storage from '../utils/storage';
import { getMaxLevel } from '../config/levels';

export class MenuScene extends Phaser.Scene {
    private backgroundSound: any = null;
    private audioContext: AudioContext | null = null;
    private audioMessage: Phaser.GameObjects.Text | null = null;
    private audioEnabled: boolean = false;
    private musicNodes: any[] = [];
    
    constructor() {
        super('MenuScene');
    }
    
    create(): void {
        console.log('MenuScene: create() called');
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add stars background
        const stars = this.add.tileSprite(width / 2, height / 2, width, height, 'stars');
        
        // Add title
        const title = this.add.text(width / 2, height / 4, 'SPACE X LANDER', {
            font: 'bold 48px Arial',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);
        
        // Add subtitle
        const subtitle = this.add.text(width / 2, height / 4 + 60, 'FALCON 9 LANDING SIMULATOR', {
            font: '24px Arial',
            color: '#cccccc',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        subtitle.setOrigin(0.5);
        
        // Add play button
        const playButton = this.add.text(width / 2, height / 2, 'START MISSION', {
            font: 'bold 32px Arial',
            color: '#ffffff',
            backgroundColor: '#1a73e8',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        });
        playButton.setOrigin(0.5);
        playButton.setInteractive({ useHandCursor: true });
        
        // Add hover effect
        playButton.on('pointerover', () => {
            playButton.setStyle({ backgroundColor: '#4285f4' });
        });
        
        playButton.on('pointerout', () => {
            playButton.setStyle({ backgroundColor: '#1a73e8' });
        });
        
        // Add click handler
        playButton.on('pointerdown', () => {
            // Stop all sounds before starting the game
            console.log('Stopping menu music before starting game');
            this.stopAllSounds();
            
            // Clean up audio context
            if (this.audioContext && this.audioContext.state !== 'closed') {
                try {
                    // In some browsers, AudioContext doesn't have a close method
                    if (this.audioContext.close) {
                        this.audioContext.close();
                    }
                    this.audioContext = null;
                    this.backgroundSound = null;
                } catch (error) {
                    console.error('Error closing audio context:', error);
                }
            }
            
            // Reset score in storage when starting a new game
            Storage.saveScore(0);
            
            // Start the game
            this.scene.start('GameScene', { level: 1 });
        });
        
        // Add instructions
        const instructions = this.add.text(width / 2, height * 3/4, 
            'Use ARROW KEYS to control the rocket\nLAND GENTLY on the platform', {
            font: '20px Arial',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        instructions.setOrigin(0.5);
        
        // Add high score display
        const highScore = Storage.loadHighScore();
        if (highScore > 0) {
            const highScoreText = this.add.text(width / 2, height * 3/4 + 80, 
                `HIGH SCORE: ${highScore}`, {
                font: '18px monospace',
                color: '#ffff00',
                align: 'center'
            });
            highScoreText.setOrigin(0.5);
        }
        
        // Add level progress display
        const completedLevels = Storage.getCompletedLevels();
        const maxLevel = getMaxLevel();
        if (completedLevels.length > 0) {
            const progressText = this.add.text(width / 2, height * 3/4 + 110, 
                `LEVELS COMPLETED: ${completedLevels.length}/${maxLevel}`, {
                font: '18px monospace',
                color: '#00ffff',
                align: 'center'
            });
            progressText.setOrigin(0.5);
            
            // Add continue button if there are completed levels
            const continueButton = this.add.text(width / 2, height / 2 + 60, 'CONTINUE MISSION', {
                font: 'bold 24px Arial',
                color: '#ffffff',
                backgroundColor: '#4caf50',
                padding: { left: 20, right: 20, top: 10, bottom: 10 }
            });
            continueButton.setOrigin(0.5);
            continueButton.setInteractive({ useHandCursor: true });
            
            // Add hover effect
            continueButton.on('pointerover', () => {
                continueButton.setStyle({ backgroundColor: '#66bb6a' });
            });
            
            continueButton.on('pointerout', () => {
                continueButton.setStyle({ backgroundColor: '#4caf50' });
            });
            
            // Add click handler
            continueButton.on('pointerdown', () => {
                // Stop all sounds before starting the game
                console.log('Stopping menu music before continuing game');
                this.stopAllSounds();
                
                // Clean up audio context
                if (this.audioContext && this.audioContext.state !== 'closed') {
                    try {
                        // In some browsers, AudioContext doesn't have a close method
                        if (this.audioContext.close) {
                            this.audioContext.close();
                        }
                        this.audioContext = null;
                        this.backgroundSound = null;
                    } catch (error) {
                        console.error('Error closing audio context:', error);
                    }
                }
                
                // Start the game at the last unlocked level
                const lastLevel = Math.min(Math.max(...completedLevels) + 1, maxLevel);
                const savedScore = Storage.loadScore();
                this.scene.start('GameScene', { level: lastLevel, score: savedScore });
            });
        }
        
        // Add reset progress button
        const resetButton = this.add.text(width - 20, height - 20, 'RESET PROGRESS', {
            font: '14px Arial',
            color: '#ff6666',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        });
        resetButton.setOrigin(1, 1);
        resetButton.setInteractive({ useHandCursor: true });
        
        // Add hover effect
        resetButton.on('pointerover', () => {
            resetButton.setStyle({ color: '#ff0000' });
        });
        
        resetButton.on('pointerout', () => {
            resetButton.setStyle({ color: '#ff6666' });
        });
        
        // Add click handler with confirmation
        resetButton.on('pointerdown', () => {
            // Create confirmation dialog
            const confirmBg = this.add.rectangle(width / 2, height / 2, 400, 200, 0x000000, 0.8);
            const confirmText = this.add.text(width / 2, height / 2 - 40, 
                'Are you sure you want to reset all progress?', {
                font: '18px Arial',
                color: '#ffffff',
                align: 'center'
            });
            confirmText.setOrigin(0.5);
            
            // Add yes button
            const yesButton = this.add.text(width / 2 - 60, height / 2 + 20, 'YES', {
                font: 'bold 20px Arial',
                color: '#ffffff',
                backgroundColor: '#ff0000',
                padding: { left: 20, right: 20, top: 10, bottom: 10 }
            });
            yesButton.setOrigin(0.5);
            yesButton.setInteractive({ useHandCursor: true });
            
            // Add no button
            const noButton = this.add.text(width / 2 + 60, height / 2 + 20, 'NO', {
                font: 'bold 20px Arial',
                color: '#ffffff',
                backgroundColor: '#4caf50',
                padding: { left: 20, right: 20, top: 10, bottom: 10 }
            });
            noButton.setOrigin(0.5);
            noButton.setInteractive({ useHandCursor: true });
            
            // Add click handlers
            yesButton.on('pointerdown', () => {
                // Reset progress
                Storage.resetGameProgress();
                
                // Remove dialog
                confirmBg.destroy();
                confirmText.destroy();
                yesButton.destroy();
                noButton.destroy();
                
                // Restart scene to reflect changes
                this.scene.restart();
            });
            
            noButton.on('pointerdown', () => {
                // Remove dialog
                confirmBg.destroy();
                confirmText.destroy();
                yesButton.destroy();
                noButton.destroy();
            });
        });
        
        // Add animation to stars
        this.tweens.add({
            targets: stars,
            tilePositionX: { from: 0, to: 100 },
            ease: 'Linear',
            duration: 8000,
            repeat: -1
        });
        
        // Show audio message first
        this.showAudioMessage('Enable audio');
        
        // Add audio controls (which will position the message)
        this.addAudioControls();
        
        // Add click handler for the entire scene to enable audio
        this.input.on('pointerdown', this.enableAudio, this);
        
        console.log('MenuScene: create() completed');
    }
    
    private enableAudio(): void {
        if (this.audioEnabled) return;
        
        try {
            console.log('Enabling audio...');
            
            // Create Web Audio API context
            // @ts-ignore - AudioContext might not be available in all browsers
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.audioContext) {
                // Create master gain node
                const masterGain = this.audioContext.createGain();
                masterGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                masterGain.connect(this.audioContext.destination);
                
                // Store reference to master gain
                this.backgroundSound = {
                    masterGain: masterGain,
                    isPlaying: true
                };
                
                // Create ambient music
                this.createAmbientMusic(masterGain);
                
                // Mark audio as enabled
                this.audioEnabled = true;
                
                // Remove the audio message
                if (this.audioMessage) {
                    this.audioMessage.destroy();
                    this.audioMessage = null;
                }
                
                // Remove the event listener
                this.input.off('pointerdown', this.enableAudio, this);
                
                console.log('Audio enabled successfully');
            }
        } catch (error) {
            console.error('Error enabling audio:', error);
        }
    }
    
    private createAmbientMusic(masterGain: GainNode): void {
        if (!this.audioContext) return;
        
        // Clear any existing nodes
        this.stopAllSounds();
        this.musicNodes = [];
        
        // Create a reverb effect
        const convolver = this.audioContext.createConvolver();
        const reverbGain = this.audioContext.createGain();
        reverbGain.gain.value = 0.3;
        
        // Create impulse response for reverb
        const impulseLength = this.audioContext.sampleRate * 2; // 2 seconds
        const impulse = this.audioContext.createBuffer(2, impulseLength, this.audioContext.sampleRate);
        
        // Fill the impulse buffer with decaying noise
        for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
            const impulseData = impulse.getChannelData(channel);
            for (let i = 0; i < impulseLength; i++) {
                impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2);
            }
        }
        
        convolver.buffer = impulse;
        convolver.connect(reverbGain);
        reverbGain.connect(masterGain);
        
        // Create notes for a pleasant ambient chord progression
        const notes = [
            { freq: 220.0, type: 'sine' },     // A3
            { freq: 277.2, type: 'sine' },     // C#4
            { freq: 329.6, type: 'sine' },     // E4
            { freq: 440.0, type: 'sine' },     // A4
            { freq: 164.8, type: 'triangle' }, // E3
            { freq: 110.0, type: 'triangle' }  // A2
        ];
        
        // Create oscillators for each note
        notes.forEach((note, index) => {
            // Create oscillator
            const oscillator = this.audioContext!.createOscillator();
            oscillator.type = note.type as OscillatorType;
            oscillator.frequency.setValueAtTime(note.freq, this.audioContext!.currentTime);
            
            // Create gain node for this oscillator
            const gain = this.audioContext!.createGain();
            
            // Set different volumes for different notes
            const baseVolume = 0.1;
            const volume = baseVolume / (index + 1);
            gain.gain.setValueAtTime(volume, this.audioContext!.currentTime);
            
            // Add slight detuning for a richer sound
            if (oscillator.detune) {
                oscillator.detune.setValueAtTime(Math.random() * 10 - 5, this.audioContext!.currentTime);
            }
            
            // Connect oscillator to gain
            oscillator.connect(gain);
            
            // Connect to both direct output and reverb
            gain.connect(masterGain);
            gain.connect(convolver);
            
            // Start the oscillator
            oscillator.start();
            
            // Add LFO (Low Frequency Oscillator) for subtle volume changes
            const lfo = this.audioContext!.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.1, this.audioContext!.currentTime);
            
            const lfoGain = this.audioContext!.createGain();
            lfoGain.gain.setValueAtTime(volume * 0.2, this.audioContext!.currentTime);
            
            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);
            lfo.start();
            
            // Store references for cleanup
            this.musicNodes.push({ oscillator, gain, lfo, lfoGain });
            
            // Schedule note changes for evolving ambient sound
            this.scheduleNoteChanges(oscillator, gain, index);
        });
    }
    
    private scheduleNoteChanges(oscillator: OscillatorNode, gain: GainNode, index: number): void {
        if (!this.audioContext) return;
        
        // Base chord progression (A minor, F major, G major, E minor)
        const progressions = [
            [220.0, 277.2, 329.6, 440.0],  // A minor
            [174.6, 220.0, 261.6, 349.2],  // F major
            [196.0, 246.9, 293.7, 392.0],  // G major
            [164.8, 196.0, 246.9, 329.6]   // E minor
        ];
        
        // Only apply progression to the first 4 oscillators (melody notes)
        if (index < 4) {
            // Schedule changes every 4 seconds
            for (let i = 1; i <= 4; i++) {
                const time = this.audioContext.currentTime + i * 4;
                const progression = progressions[i % progressions.length];
                const freq = progression[index];
                
                // Smooth transition to new frequency
                oscillator.frequency.linearRampToValueAtTime(freq, time);
                
                // Fade volume slightly for transition
                gain.gain.linearRampToValueAtTime(0.05 / (index + 1), time - 0.1);
                gain.gain.linearRampToValueAtTime(0.1 / (index + 1), time + 0.1);
            }
        }
    }
    
    private stopAllSounds(): void {
        // Stop all music nodes
        this.musicNodes.forEach(node => {
            try {
                if (node.oscillator) node.oscillator.stop();
                if (node.lfo) node.lfo.stop();
            } catch (e) {
                console.error('Error stopping sound:', e);
            }
        });
        
        this.musicNodes = [];
    }
    
    private showAudioMessage(message: string): void {
        // Remove any existing message
        if (this.audioMessage) {
            this.audioMessage.destroy();
        }
        
        // Create a new message - position will be set in addAudioControls
        this.audioMessage = this.add.text(
            0, 0, 
            message, 
            {
                font: '12px Arial',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { left: 5, right: 5, top: 3, bottom: 3 },
                align: 'center'
            }
        );
        
        // Default origin will be set in addAudioControls
        
        // Add a pulsing effect
        this.tweens.add({
            targets: this.audioMessage,
            alpha: { from: 1, to: 0.5 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }
    
    private addAudioControls(): void {
        try {
            const width = this.cameras.main.width;
            
            // Create mute button in top-right corner
            const muteButton = this.add.text(width - 40, 30, '🔊', {
                font: '32px Arial',
                color: '#ffffff'
            });
            
            muteButton.setInteractive({ useHandCursor: true });
            muteButton.setOrigin(0.5);
            
            // Position the audio message to the left of the audio button if it exists
            if (this.audioMessage) {
                this.audioMessage.setPosition(width - 80, 30);
                this.audioMessage.setOrigin(1, 0.5); // Right align horizontally, center vertically
            }
            
            // Add click handler
            muteButton.on('pointerdown', () => {
                if (!this.backgroundSound || !this.audioContext) return;
                
                // Toggle mute
                if (this.backgroundSound.isPlaying) {
                    // Mute by setting master volume to 0
                    this.backgroundSound.masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
                    this.backgroundSound.isPlaying = false;
                    muteButton.setText('🔇');
                } else {
                    // Unmute by setting master volume back to 0.2
                    this.backgroundSound.masterGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    this.backgroundSound.isPlaying = true;
                    muteButton.setText('🔊');
                }
                
                console.log('Sound mute toggled:', !this.backgroundSound.isPlaying);
            });
        } catch (error) {
            console.error('Error creating audio controls:', error);
        }
    }
    
    private getHighScore(): number {
        return Storage.loadHighScore();
    }
    
    shutdown(): void {
        // Clean up audio resources
        this.stopAllSounds();
        
        // Clean up audio context
        if (this.audioContext && this.audioContext.state !== 'closed') {
            try {
                // In some browsers, AudioContext doesn't have a close method
                if (this.audioContext.close) {
                    this.audioContext.close();
                }
                this.audioContext = null;
                this.backgroundSound = null;
            } catch (error) {
                console.error('Error closing audio context:', error);
            }
        }
    }
} 