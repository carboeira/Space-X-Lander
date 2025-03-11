import Phaser from 'phaser';

/**
 * AudioManager - Centralized audio handling for the game
 * Based on Phaser 3 documentation best practices
 */
export class AudioManager {
    private scene: Phaser.Scene;
    private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
    private muted: boolean = false;
    private unlocked: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupUnlockListener();
    }

    /**
     * Add a sound to the manager
     */
    public addSound(key: string, config: Phaser.Types.Sound.SoundConfig = {}): void {
        try {
            if (!this.sounds.has(key)) {
                const sound = this.scene.sound.add(key, config);
                this.sounds.set(key, sound);
                console.log(`Added sound: ${key}`);
            }
        } catch (error) {
            console.error(`Error adding sound ${key}:`, error);
        }
    }

    /**
     * Play a sound
     */
    public play(key: string, config: Phaser.Types.Sound.SoundConfig = {}): Phaser.Sound.BaseSound | null {
        try {
            let sound = this.sounds.get(key);
            
            // If sound doesn't exist, try to add it
            if (!sound) {
                this.addSound(key, config);
                sound = this.sounds.get(key);
            }
            
            if (sound && !this.muted) {
                sound.play(config);
                return sound;
            }
        } catch (error) {
            console.error(`Error playing sound ${key}:`, error);
        }
        
        return null;
    }

    /**
     * Stop a sound
     */
    public stop(key: string): void {
        try {
            const sound = this.sounds.get(key);
            if (sound && sound.isPlaying) {
                sound.stop();
            }
        } catch (error) {
            console.error(`Error stopping sound ${key}:`, error);
        }
    }

    /**
     * Toggle mute state
     */
    public toggleMute(): boolean {
        this.muted = !this.muted;
        
        // Update all sounds
        this.sounds.forEach(sound => {
            sound.setMute(this.muted);
        });
        
        return this.muted;
    }

    /**
     * Set mute state
     */
    public setMute(muted: boolean): void {
        if (this.muted !== muted) {
            this.toggleMute();
        }
    }

    /**
     * Check if audio is muted
     */
    public isMuted(): boolean {
        return this.muted;
    }

    /**
     * Setup unlock listener for browsers that require user interaction
     */
    private setupUnlockListener(): void {
        if (this.scene.sound.locked) {
            console.log('Audio is locked, waiting for user interaction');
            
            // Add a one-time event listener to unlock audio
            this.scene.sound.once('unlocked', () => {
                console.log('Audio unlocked successfully');
                this.unlocked = true;
            });
        } else {
            console.log('Audio is already unlocked');
            this.unlocked = true;
        }
    }

    /**
     * Attempt to unlock audio (call this on user interaction)
     */
    public unlock(): void {
        if (!this.unlocked && this.scene.sound.locked) {
            console.log('Attempting to unlock audio...');
            this.scene.sound.unlock();
        }
    }

    /**
     * Clean up resources
     */
    public destroy(): void {
        this.sounds.forEach(sound => {
            sound.destroy();
        });
        this.sounds.clear();
    }
} 