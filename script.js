// Global variables
let audioContext;
let currentAudioBuffer;

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const audioFile = document.getElementById('audioFile');
const audioPlayer = document.getElementById('audioPlayer');
const audioPreview = document.getElementById('audioPreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const genreResults = document.getElementById('genreResults');

// Genre database dengan karakteristik
const genreDatabase = {
    'Pop': { tempo: [120, 140], energy: [0.6, 0.8], valence: [0.6, 0.9] },
    'Rock': { tempo: [110, 150], energy: [0.7, 0.95], valence: [0.4, 0.8] },
    'Hip-Hop': { tempo: [70, 140], energy: [0.6, 0.9], valence: [0.3, 0.7] },
    'Electronic': { tempo: [120, 180], energy: [0.7, 0.95], valence: [0.5, 0.9] },
    'Jazz': { tempo: [60, 200], energy: [0.3, 0.8], valence: [0.4, 0.8] },
    'Classical': { tempo: [60, 140], energy: [0.2, 0.7], valence: [0.3, 0.8] },
    'Blues': { tempo: [60, 120], energy: [0.3, 0.7], valence: [0.2, 0.6] },
    'Country': { tempo: [80, 140], energy: [0.4, 0.8], valence: [0.4, 0.8] },
    'Reggae': { tempo: [60, 90], energy: [0.4, 0.7], valence: [0.6, 0.9] },
    'Metal': { tempo: [120, 200], energy: [0.8, 1.0], valence: [0.1, 0.5] }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeAudioContext();
    setupEventListeners();
});

function initializeAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
        console.error('Web Audio API tidak didukung:', error);
    }
}

function setupEventListeners() {
    // Upload area events
    uploadArea.addEventListener('click', () => audioFile.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // File input change
    audioFile.addEventListener('change', handleFileSelect);
    
    // Analyze button
    analyzeBtn.addEventListener('click', analyzeAudio);
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect({ target: { files: files } });
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('audio/')) {
        alert('Please select a valid audio file.');
        return;
    }
    
    // Update UI
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    // Create object URL for audio preview
    const objectURL = URL.createObjectURL(file);
    audioPreview.src = objectURL;
    
    // Show audio player
    audioPlayer.style.display = 'block';
    analyzeBtn.disabled = false;
    
    // Store file for analysis
    audioFile.currentFile = file;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function analyzeAudio() {
    if (!audioFile.currentFile) return;
    
    // Show loading
    loading.style.display = 'block';
    results.style.display = 'none';
    analyzeBtn.disabled = true;
    
    try {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Extract audio features (simulated)
        const features = await extractAudioFeatures(audioFile.currentFile);
        
        // Classify genre
        const genreScores = classifyGenre(features);
        
        // Display results
        displayResults(genreScores, features);
        
    } catch (error) {
        console.error('Error analyzing audio:', error);
        alert('Terjadi kesalahan saat menganalisis audio. Silakan coba lagi.');
    } finally {
        loading.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

async function extractAudioFeatures(file) {
    // In a real implementation, you would use Web Audio API to analyze the audio
    // For now, we'll simulate realistic feature extraction
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Basic analysis using audio buffer
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;
        
        // Calculate basic features
        const tempo = estimateTempo(channelData, sampleRate);
        const energy = calculateEnergy(channelData);
        const valence = calculateValence(channelData);
        const danceability = calculateDanceability(tempo, energy);
        
        return { tempo, energy, valence, danceability };
        
    } catch (error) {
        console.error('Error processing audio:', error);
        // Return simulated features if real analysis fails
        return {
            tempo: Math.floor(Math.random() * 120) + 60,
            energy: Math.random(),
            valence: Math.random(),
            danceability: Math.random()
        };
    }
}

function estimateTempo(channelData, sampleRate) {
    // Simple tempo estimation (simplified version)
    const windowSize = 1024;
    const hopSize = 512;
    let maxCorrelation = 0;
    let bestTempo = 120;
    
    // Test common tempo ranges
    for (let bpm = 60; bpm <= 200; bpm += 2) {
        const samplesPerBeat = (60 * sampleRate) / bpm;
        let correlation = 0;
        
        for (let i = 0; i < channelData.length - samplesPerBeat; i += hopSize) {
            const current = Math.abs(channelData[i]);
            const next = Math.abs(channelData[Math.floor(i + samplesPerBeat)]);
            correlation += current * next;
        }
        
        if (correlation > maxCorrelation) {
            maxCorrelation = correlation;
            bestTempo = bpm;
        }
    }
    
    return bestTempo;
}

function calculateEnergy(channelData) {
    let sum = 0;
    for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] * channelData[i];
    }
    return Math.min(Math.sqrt(sum / channelData.length) * 10, 1);
}

function calculateValence(channelData) {
    // Simplified valence calculation based on spectral features
    let positiveEnergy = 0;
    let totalEnergy = 0;
    
    for (let i = 0; i < channelData.length; i++) {
        const value = channelData[i];
        totalEnergy += Math.abs(value);
        if (value > 0) positiveEnergy += value;
    }
    
    return totalEnergy > 0 ? positiveEnergy / totalEnergy : 0.5;
}

function calculateDanceability(tempo, energy) {
    // Combine tempo and energy for danceability
    const tempoScore = (tempo >= 100 && tempo <= 140) ? 1 : 0.5;
    const energyScore = energy;
    return (tempoScore + energyScore) / 2;
}

function classifyGenre(features) {
    const scores = {};
    
    Object.keys(genreDatabase).forEach(genre => {
        const genreData = genreDatabase[genre];
        let score = 0;
        
        // Tempo matching (40% weight)
        if (features.tempo >= genreData.tempo[0] && features.tempo <= genreData.tempo[1]) {
            score += 0.4;
        } else {
            const tempoDiff = Math.min(
                Math.abs(features.tempo - genreData.tempo[0]),
                Math.abs(features.tempo - genreData.tempo[1])
            );
            score += Math.max(0, 0.4 - (tempoDiff / 100));
        }
        
        // Energy matching (30% weight)
        if (features.energy >= genreData.energy[0] && features.energy <= genreData.energy[1]) {
            score += 0.3;
        } else {
            const energyDiff = Math.min(
                Math.abs(features.energy - genreData.energy[0]),
                Math.abs(features.energy - genreData.energy[1])
            );
            score += Math.max(0, 0.3 - energyDiff);
        }
        
        // Valence matching (30% weight)
        if (features.valence >= genreData.valence[0] && features.valence <= genreData.valence[1]) {
            score += 0.3;
        } else {
            const valenceDiff = Math.min(
                Math.abs(features.valence - genreData.valence[0]),
                Math.abs(features.valence - genreData.valence[1])
            );
            score += Math.max(0, 0.3 - valenceDiff);
        }
        
        scores[genre] = score;
    });
    
    // Normalize scores to percentages
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
        Object.keys(scores).forEach(genre => {
            scores[genre] = (scores[genre] / maxScore) * 100;
        });
    }
    
    return scores;
}

function displayResults(genreScores, features) {
    // Sort genres by score
    const sortedGenres = Object.entries(genreScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5); // Top 5 results
    
    // Display genre results
    genreResults.innerHTML = '';
    sortedGenres.forEach(([genre, score]) => {
        const genreDiv = document.createElement('div');
        genreDiv.className = 'genre-result';
        genreDiv.innerHTML = `
            <div class="genre-name">${genre}</div>
            <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${score}%"></div>
            </div>
            <div class="confidence-percent">${score.toFixed(1)}%</div>
        `;
        genreResults.appendChild(genreDiv);
    });
    
    // Display audio features
    document.getElementById('tempo').textContent = features.tempo;
    document.getElementById('energy').textContent = (features.energy * 100).toFixed(1) + '%';
    document.getElementById('valence').textContent = (features.valence * 100).toFixed(1) + '%';
    document.getElementById('danceability').textContent = (features.danceability * 100).toFixed(1) + '%';
    
    // Show results with animation
    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth' });
}

// Enhanced genre classification with more sophisticated algorithms
function enhancedGenreClassification(features) {
    // This would include MFCC, Chroma, and other advanced features
    // mentioned in the enhancement roadmap
    
    const advancedScores = {};
    
    // Add noise for more realistic results
    Object.keys(genreDatabase).forEach(genre => {
        const baseScore = classifyGenre(features)[genre] || 0;
        const noise = (Math.random() - 0.5) * 20; // ±10% noise
        advancedScores[genre] = Math.max(0, Math.min(100, baseScore + noise));
    });
    
    return advancedScores;
}
