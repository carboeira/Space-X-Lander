import Phaser from 'phaser';

/**
 * Utility class to generate placeholder sound effects
 * This is used when no audio assets are available
 */
export class SoundGenerator {
    private scene: Phaser.Scene;
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        
        // Try to create an AudioContext for generating sounds
        try {
            // @ts-ignore - AudioContext might not be available in all browsers
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (this.audioContext) {
                this.masterGain = this.audioContext.createGain();
                this.masterGain.gain.value = 0.5; // Set master volume
                this.masterGain.connect(this.audioContext.destination);
                console.log('AudioContext created successfully');
            }
        } catch (error) {
            console.error('Error creating AudioContext:', error);
            this.audioContext = null;
        }
    }

    /**
     * Generate all game sounds
     */
    generateAllSounds(): void {
        console.log('Generating all sounds...');
        try {
            // Create basic sound effects
            this.createBasicSounds();
            
            // Generate procedural sounds as fallbacks
            this.generateThrustSound();
            this.generateExplosionSound();
            this.generateSuccessSound();
            this.generateBackgroundMusic();
            
            // Log available sounds
            console.log('Available sounds:', {
                thrust: !!this.scene.sound.get('thrust'),
                explosion: !!this.scene.sound.get('explosion'),
                success: !!this.scene.sound.get('success'),
                music: !!this.scene.sound.get('music')
            });
            
            console.log('All sounds generated successfully!');
        } catch (error) {
            console.error('Error generating sounds:', error);
        }
    }

    /**
     * Create basic sound effects using Phaser's built-in sound manager
     * This is a simpler approach that should work more reliably
     */
    private createBasicSounds(): void {
        try {
            // Check if sounds already exist
            if (!this.scene.sound.get('thrust')) {
                // Create a simple thrust sound using WebAudio
                const buffer = this.createThrustBuffer();
                if (buffer) {
                    this.scene.sound.add('thrust', {
                        loop: true,
                        volume: 0.5
                    });
                    console.log('Thrust sound created');
                }
            }
            
            if (!this.scene.sound.get('explosion')) {
                // Create a simple explosion sound
                const buffer = this.createExplosionBuffer();
                if (buffer) {
                    this.scene.sound.add('explosion', {
                        loop: false,
                        volume: 0.8
                    });
                    console.log('Explosion sound created');
                }
            }
            
            if (!this.scene.sound.get('success')) {
                // Create a simple success sound
                const buffer = this.createSuccessBuffer();
                if (buffer) {
                    this.scene.sound.add('success', {
                        loop: false,
                        volume: 0.8
                    });
                    console.log('Success sound created');
                }
            }
            
            if (!this.scene.sound.get('music')) {
                // Create simple background music
                const buffer = this.createMusicBuffer();
                if (buffer) {
                    this.scene.sound.add('music', {
                        loop: true,
                        volume: 0.3
                    });
                    console.log('Background music created');
                }
            }
        } catch (error) {
            console.error('Error creating basic sounds:', error);
        }
    }
    
    /**
     * Create a buffer for the thrust sound
     */
    private createThrustBuffer(): AudioBuffer | null {
        if (!this.audioContext) return null;
        
        try {
            // Create a 1-second buffer for the thrust sound
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(1, sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            // Generate a filtered noise for the thrust sound
            for (let i = 0; i < sampleRate; i++) {
                // Mix noise with a low-frequency oscillation
                const noise = Math.random() * 2 - 1;
                const lfo = Math.sin(i * 0.01) * 0.5 + 0.5;
                data[i] = noise * 0.3 * lfo;
            }
            
            // Add the buffer to Phaser's sound manager
            this.addBufferToPhaser('thrust', buffer);
            
            return buffer;
        } catch (error) {
            console.error('Error creating thrust buffer:', error);
            return null;
        }
    }
    
    /**
     * Create a buffer for the explosion sound
     */
    private createExplosionBuffer(): AudioBuffer | null {
        if (!this.audioContext) return null;
        
        try {
            // Create a 1.5-second buffer for the explosion sound
            const sampleRate = this.audioContext.sampleRate;
            const duration = 1.5;
            const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
            const data = buffer.getChannelData(0);
            
            // Generate an explosion sound (filtered noise with exponential decay)
            for (let i = 0; i < sampleRate * duration; i++) {
                const t = i / sampleRate;
                const decay = Math.exp(-t * 5);
                const noise = Math.random() * 2 - 1;
                data[i] = noise * decay;
            }
            
            // Add the buffer to Phaser's sound manager
            this.addBufferToPhaser('explosion', buffer);
            
            return buffer;
        } catch (error) {
            console.error('Error creating explosion buffer:', error);
            return null;
        }
    }
    
    /**
     * Create a buffer for the success sound
     */
    private createSuccessBuffer(): AudioBuffer | null {
        if (!this.audioContext) return null;
        
        try {
            // Create a 1-second buffer for the success sound
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(1, sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            // Generate a success sound (ascending tones)
            const frequencies = [440, 554, 659, 880];
            
            for (let i = 0; i < sampleRate; i++) {
                const t = i / sampleRate;
                let sample = 0;
                
                // Mix multiple frequencies with different start times
                for (let j = 0; j < frequencies.length; j++) {
                    const freq = frequencies[j];
                    const start = j * 0.1;
                    if (t >= start && t < start + 0.3) {
                        const phase = (t - start) * freq * Math.PI * 2;
                        const envelope = Math.sin((t - start) / 0.3 * Math.PI);
                        sample += Math.sin(phase) * envelope * 0.25;
                    }
                }
                
                data[i] = sample;
            }
            
            // Add the buffer to Phaser's sound manager
            this.addBufferToPhaser('success', buffer);
            
            return buffer;
        } catch (error) {
            console.error('Error creating success buffer:', error);
            return null;
        }
    }
    
    /**
     * Create a buffer for the background music
     */
    private createMusicBuffer(): AudioBuffer | null {
        if (!this.audioContext) return null;
        
        try {
            // Create a 5-second buffer for the background music (will be looped)
            const sampleRate = this.audioContext.sampleRate;
            const duration = 5;
            const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
            const data = buffer.getChannelData(0);
            
            // Generate simple ambient music
            const baseFreq = 110; // A2
            const notes = [1, 1.5, 2, 2.5]; // Simple pentatonic-like scale
            
            for (let i = 0; i < sampleRate * duration; i++) {
                const t = i / sampleRate;
                let sample = 0;
                
                // Add a bass note
                const bassFreq = baseFreq;
                const bassPhase = t * bassFreq * Math.PI * 2;
                const bassEnvelope = 0.3 + 0.1 * Math.sin(t * 0.5 * Math.PI * 2);
                sample += Math.sin(bassPhase) * bassEnvelope * 0.2;
                
                // Add some higher notes that change over time
                const noteIndex = Math.floor(t * 0.2) % notes.length;
                const noteFreq = baseFreq * notes[noteIndex] * 2;
                const notePhase = t * noteFreq * Math.PI * 2;
                const noteEnvelope = 0.5 + 0.5 * Math.sin(t * 0.2 * Math.PI * 2);
                sample += Math.sin(notePhase) * noteEnvelope * 0.1;
                
                // Add some noise for texture
                const noise = (Math.random() * 2 - 1) * 0.02;
                
                data[i] = sample + noise;
            }
            
            // Add the buffer to Phaser's sound manager
            this.addBufferToPhaser('music', buffer);
            
            return buffer;
        } catch (error) {
            console.error('Error creating music buffer:', error);
            return null;
        }
    }
    
    /**
     * Add an AudioBuffer to Phaser's sound manager
     */
    private addBufferToPhaser(key: string, buffer: AudioBuffer): void {
        try {
            // Convert AudioBuffer to a Blob
            const numberOfChannels = buffer.numberOfChannels;
            const length = buffer.length;
            const sampleRate = buffer.sampleRate;
            const audioData = new Float32Array(length * numberOfChannels);
            
            // Mix down all channels
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const channelData = buffer.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    audioData[i * numberOfChannels + channel] = channelData[i];
                }
            }
            
            // Create a WAV file
            const wavHeader = this.createWavHeader(length, numberOfChannels, sampleRate);
            const wavData = new Uint8Array(wavHeader.length + audioData.length * 2);
            wavData.set(wavHeader, 0);
            
            // Convert Float32Array to Int16Array
            const view = new DataView(wavData.buffer, wavHeader.length);
            for (let i = 0; i < audioData.length; i++) {
                const s = Math.max(-1, Math.min(1, audioData[i]));
                view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
            
            // Create a Blob and add it to Phaser's cache
            const blob = new Blob([wavData], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            
            // Add the sound to Phaser's cache
            this.scene.cache.audio.add(key, url);
            
            // Also add the sound to the sound manager
            if (!this.scene.sound.get(key)) {
                const config = {
                    loop: key === 'thrust' || key === 'music',
                    volume: key === 'music' ? 0.3 : 0.5
                };
                
                try {
                    const sound = this.scene.sound.add(key, config);
                    console.log(`Added ${key} sound to sound manager:`, sound);
                } catch (e) {
                    console.error(`Error adding ${key} to sound manager:`, e);
                }
            }
            
            console.log(`Added ${key} sound to Phaser's cache`);
        } catch (error) {
            console.error(`Error adding ${key} buffer to Phaser:`, error);
        }
    }
    
    /**
     * Create a WAV file header
     */
    private createWavHeader(dataLength: number, numChannels: number, sampleRate: number): Uint8Array {
        const header = new ArrayBuffer(44);
        const view = new DataView(header);
        
        // RIFF chunk descriptor
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataLength * 2, true);
        this.writeString(view, 8, 'WAVE');
        
        // fmt sub-chunk
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // fmt chunk size
        view.setUint16(20, 1, true); // audio format (1 for PCM)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true); // byte rate
        view.setUint16(32, numChannels * 2, true); // block align
        view.setUint16(34, 16, true); // bits per sample
        
        // data sub-chunk
        this.writeString(view, 36, 'data');
        view.setUint32(40, dataLength * 2, true);
        
        return new Uint8Array(header);
    }
    
    /**
     * Write a string to a DataView
     */
    private writeString(view: DataView, offset: number, string: string): void {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
    
    /**
     * Generate a thrust sound
     */
    private generateThrustSound(): void {
        // Already handled in createBasicSounds
    }
    
    /**
     * Generate an explosion sound
     */
    private generateExplosionSound(): void {
        // Already handled in createBasicSounds
    }
    
    /**
     * Generate a success sound
     */
    private generateSuccessSound(): void {
        // Already handled in createBasicSounds
    }
    
    /**
     * Generate background music
     */
    private generateBackgroundMusic(): void {
        // Already handled in createBasicSounds
    }
} 