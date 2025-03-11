// This script uses the lame.js library to convert WAV files to MP3
// First, install lame.js: npm install lamejs

const fs = require('fs');
const path = require('path');
const lamejs = require('lamejs');

// Function to read a WAV file and convert it to MP3
function convertWavToMp3(inputFile, outputFile) {
    try {
        console.log(`Converting ${inputFile} to ${outputFile}`);
        
        // Read the WAV file
        const wavBuffer = fs.readFileSync(inputFile);
        
        // Parse the WAV header
        const sampleRate = wavBuffer.readUInt32LE(24);
        const numChannels = wavBuffer.readUInt16LE(22);
        const bitsPerSample = wavBuffer.readUInt16LE(34);
        
        console.log(`WAV info: ${numChannels} channels, ${sampleRate} Hz, ${bitsPerSample} bits per sample`);
        
        // Find the data chunk
        let dataOffset = 44; // Default data offset for standard WAV files
        
        // Skip the WAV header and get to the PCM data
        const dataChunkSize = wavBuffer.readUInt32LE(40);
        
        // Create MP3 encoder
        const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, 128);
        const mp3Data = [];
        
        // Convert 16-bit PCM data to MP3
        const samples = new Int16Array(dataChunkSize / 2);
        for (let i = 0; i < samples.length; i++) {
            samples[i] = wavBuffer.readInt16LE(dataOffset + i * 2);
        }
        
        // Process the samples in chunks
        const chunkSize = 1152; // Must be a multiple of 576 for mono, 1152 for stereo
        for (let i = 0; i < samples.length; i += chunkSize) {
            const chunk = samples.slice(i, i + chunkSize);
            
            let mp3buf;
            if (numChannels === 1) {
                mp3buf = mp3encoder.encodeBuffer(chunk);
            } else {
                // Split stereo channels
                const left = new Int16Array(chunk.length / 2);
                const right = new Int16Array(chunk.length / 2);
                
                for (let j = 0, k = 0; j < chunk.length; j += 2, k++) {
                    left[k] = chunk[j];
                    right[k] = chunk[j + 1];
                }
                
                mp3buf = mp3encoder.encodeBuffer(left, right);
            }
            
            if (mp3buf.length > 0) {
                mp3Data.push(Buffer.from(mp3buf));
            }
        }
        
        // Finalize the MP3
        const end = mp3encoder.flush();
        if (end.length > 0) {
            mp3Data.push(Buffer.from(end));
        }
        
        // Write the MP3 file
        const mp3Buffer = Buffer.concat(mp3Data);
        fs.writeFileSync(outputFile, mp3Buffer);
        
        console.log(`Successfully converted ${inputFile} to ${outputFile}`);
    } catch (error) {
        console.error(`Error converting ${inputFile} to MP3:`, error);
    }
}

// Convert all WAV files in the audio directory to MP3
const audioDir = path.join('assets', 'audio');
const wavFiles = fs.readdirSync(audioDir).filter(file => file.endsWith('.wav'));

console.log(`Found ${wavFiles.length} WAV files to convert`);

wavFiles.forEach(wavFile => {
    const inputFile = path.join(audioDir, wavFile);
    const outputFile = path.join(audioDir, wavFile.replace('.wav', '.mp3'));
    convertWavToMp3(inputFile, outputFile);
});

console.log('All conversions completed!'); 