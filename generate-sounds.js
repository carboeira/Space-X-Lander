// Simple script to generate WAV files for our game
const fs = require('fs');
const path = require('path');

// Function to create a WAV file header
function createWavHeader(dataLength, numChannels, sampleRate) {
    const header = Buffer.alloc(44);
    
    // RIFF chunk descriptor
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataLength * 2, 4);
    header.write('WAVE', 8);
    
    // fmt sub-chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // fmt chunk size
    header.writeUInt16LE(1, 20); // audio format (1 for PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * numChannels * 2, 28); // byte rate
    header.writeUInt16LE(numChannels * 2, 32); // block align
    header.writeUInt16LE(16, 34); // bits per sample
    
    // data sub-chunk
    header.write('data', 36);
    header.writeUInt32LE(dataLength * 2, 40);
    
    return header;
}

// Function to create a thrust sound (filtered noise)
function createThrustSound() {
    const sampleRate = 44100;
    const duration = 1; // 1 second
    const numSamples = sampleRate * duration;
    const header = createWavHeader(numSamples, 1, sampleRate);
    const audioData = Buffer.alloc(numSamples * 2);
    
    // Generate a filtered noise for the thrust sound
    for (let i = 0; i < numSamples; i++) {
        // Mix noise with a low-frequency oscillation
        const t = i / sampleRate;
        const noise = Math.random() * 2 - 1;
        const lfo = Math.sin(t * 5) * 0.5 + 0.5;
        const sample = noise * 0.3 * lfo;
        
        // Convert to 16-bit PCM
        const pcm = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
        audioData.writeInt16LE(pcm, i * 2);
    }
    
    // Combine header and audio data
    const wavFile = Buffer.concat([header, audioData]);
    fs.writeFileSync(path.join('assets', 'audio', 'thrust.wav'), wavFile);
    console.log('Thrust sound created');
}

// Function to create an explosion sound (filtered noise with exponential decay)
function createExplosionSound() {
    const sampleRate = 44100;
    const duration = 1.5; // 1.5 seconds
    const numSamples = sampleRate * duration;
    const header = createWavHeader(numSamples, 1, sampleRate);
    const audioData = Buffer.alloc(numSamples * 2);
    
    // Generate an explosion sound (filtered noise with exponential decay)
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const decay = Math.exp(-t * 5);
        const noise = Math.random() * 2 - 1;
        const sample = noise * decay;
        
        // Convert to 16-bit PCM
        const pcm = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
        audioData.writeInt16LE(pcm, i * 2);
    }
    
    // Combine header and audio data
    const wavFile = Buffer.concat([header, audioData]);
    fs.writeFileSync(path.join('assets', 'audio', 'explosion.wav'), wavFile);
    console.log('Explosion sound created');
}

// Function to create a success sound (ascending tones)
function createSuccessSound() {
    const sampleRate = 44100;
    const duration = 1; // 1 second
    const numSamples = sampleRate * duration;
    const header = createWavHeader(numSamples, 1, sampleRate);
    const audioData = Buffer.alloc(numSamples * 2);
    
    // Generate a success sound (ascending tones)
    const frequencies = [440, 554, 659, 880];
    
    for (let i = 0; i < numSamples; i++) {
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
        
        // Convert to 16-bit PCM
        const pcm = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
        audioData.writeInt16LE(pcm, i * 2);
    }
    
    // Combine header and audio data
    const wavFile = Buffer.concat([header, audioData]);
    fs.writeFileSync(path.join('assets', 'audio', 'success.wav'), wavFile);
    console.log('Success sound created');
}

// Function to create background music
function createBackgroundMusic() {
    const sampleRate = 44100;
    const duration = 5; // 5 seconds (will be looped)
    const numSamples = sampleRate * duration;
    const header = createWavHeader(numSamples, 1, sampleRate);
    const audioData = Buffer.alloc(numSamples * 2);
    
    // Generate simple ambient music
    const baseFreq = 110; // A2
    const notes = [1, 1.5, 2, 2.5]; // Simple pentatonic-like scale
    
    for (let i = 0; i < numSamples; i++) {
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
        
        // Final sample
        const finalSample = sample + noise;
        
        // Convert to 16-bit PCM
        const pcm = Math.max(-1, Math.min(1, finalSample)) * 0x7FFF;
        audioData.writeInt16LE(pcm, i * 2);
    }
    
    // Combine header and audio data
    const wavFile = Buffer.concat([header, audioData]);
    fs.writeFileSync(path.join('assets', 'audio', 'music.wav'), wavFile);
    console.log('Background music created');
}

// Make sure the audio directory exists
if (!fs.existsSync(path.join('assets', 'audio'))) {
    fs.mkdirSync(path.join('assets', 'audio'), { recursive: true });
}

// Generate all sounds
createThrustSound();
createExplosionSound();
createSuccessSound();
createBackgroundMusic();

console.log('All sounds generated successfully!'); 