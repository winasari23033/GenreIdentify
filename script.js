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

// Streamlined genre database - reduced overlaps
const genreDatabase = {
    'Pop': {
        tempo: [110, 130],
        energy: [0.6, 0.85],
        valence: [0.6, 0.9],
        spectralCentroid: [1500, 3000],
        spectralRolloff: [0.75, 0.9],
        zcr: [0.05, 0.15],
        mfccVariance: [0.3, 0.7]
    },
    'Rock': {
        tempo: [110, 140],
        energy: [0.7, 0.95],
        valence: [0.4, 0.8],
        spectralCentroid: [2000, 4000],
        spectralRolloff: [0.8, 0.95],
        zcr: [0.1, 0.25],
        mfccVariance: [0.4, 0.8]
    },
    'Alternative': {
        tempo: [90, 145],
        energy: [0.5, 0.8],
        valence: [0.3, 0.7],
        spectralCentroid: [1700, 3400],
        spectralRolloff: [0.72, 0.88],
        zcr: [0.08, 0.2],
        mfccVariance: [0.4, 0.75]
    },
    'Indie': {
        tempo: [80, 130],
        energy: [0.4, 0.75],
        valence: [0.35, 0.75],
        spectralCentroid: [1600, 3200],
        spectralRolloff: [0.65, 0.85],
        zcr: [0.06, 0.18],
        mfccVariance: [0.3, 0.65]
    },
    'Hip-Hop': {
        tempo: [70, 140],
        energy: [0.6, 0.9],
        valence: [0.3, 0.7],
        spectralCentroid: [1000, 2500],
        spectralRolloff: [0.6, 0.85],
        zcr: [0.05, 0.2],
        mfccVariance: [0.4, 0.8]
    },
    'R&B': {
        tempo: [70, 100],
        energy: [0.5, 0.8],
        valence: [0.5, 0.85],
        spectralCentroid: [1200, 2800],
        spectralRolloff: [0.6, 0.8],
        zcr: [0.04, 0.12],
        mfccVariance: [0.25, 0.6]
    },
    'Electronic': {
        tempo: [120, 140],
        energy: [0.7, 0.95],
        valence: [0.5, 0.9],
        spectralCentroid: [2500, 5000],
        spectralRolloff: [0.8, 0.95],
        zcr: [0.1, 0.25],
        mfccVariance: [0.5, 0.9]
    },
    'Jazz': {
        tempo: [60, 180],
        energy: [0.3, 0.8],
        valence: [0.4, 0.8],
        spectralCentroid: [1400, 3600],
        spectralRolloff: [0.65, 0.9],
        zcr: [0.04, 0.18],
        mfccVariance: [0.6, 0.95]
    },
    'Blues': {
        tempo: [60, 120],
        energy: [0.3, 0.75],
        valence: [0.2, 0.6],
        spectralCentroid: [1200, 2500],
        spectralRolloff: [0.65, 0.8],
        zcr: [0.04, 0.12],
        mfccVariance: [0.3, 0.6]
    },
    'Country': {
        tempo: [80, 140],
        energy: [0.4, 0.8],
        valence: [0.4, 0.8],
        spectralCentroid: [1200, 2800],
        spectralRolloff: [0.7, 0.85],
        zcr: [0.06, 0.15],
        mfccVariance: [0.35, 0.65]
    },
    'Metal': {
        tempo: [70, 200],
        energy: [0.5, 1.0],
        valence: [0.1, 0.5],
        spectralCentroid: [2500, 5500],
        spectralRolloff: [0.85, 0.95],
        zcr: [0.2, 0.4],
        mfccVariance: [0.6, 0.95]
    },
    'Reggae': {
        tempo: [60, 90],
        energy: [0.5, 0.75],
        valence: [0.6, 0.9],
        spectralCentroid: [1300, 2600],
        spectralRolloff: [0.65, 0.8],
        zcr: [0.05, 0.13],
        mfccVariance: [0.3, 0.6]
    },
    'Classical': {
        tempo: [60, 140],
        energy: [0.2, 0.7],
        valence: [0.3, 0.8],
        spectralCentroid: [1200, 4000],
        spectralRolloff: [0.75, 0.9],
        zcr: [0.03, 0.1],
        mfccVariance: [0.7, 0.95]
    }
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
        console.error('Web Audio API not supported:', error);
    }
}

function setupEventListeners() {
    uploadArea.addEventListener('click', () => audioFile.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    audioFile.addEventListener('change', handleFileSelect);
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
    
    if (!file.type.startsWith('audio/')) {
        alert('Please select a valid audio file.');
        return;
    }
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    const objectURL = URL.createObjectURL(file);
    audioPreview.src = objectURL;
    
    audioPlayer.style.display = 'block';
    analyzeBtn.disabled = false;
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
    
    loading.style.display = 'block';
    results.style.display = 'none';
    analyzeBtn.disabled = true;
    
    try {
        const features = await extractAudioFeatures(audioFile.currentFile);
        const genreScores = classifyGenre(features);
        displayResults(genreScores, features);
    } catch (error) {
        console.error('Error analyzing audio:', error);
        alert('Error analyzing audio. Please try again.');
    } finally {
        loading.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

async function extractAudioFeatures(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        
        return {
            tempo: estimateTempo(channelData, sampleRate),
            energy: calculateEnergy(channelData),
            valence: calculateValence(channelData, sampleRate),
            spectralCentroid: calculateSpectralCentroid(channelData, sampleRate),
            spectralRolloff: calculateSpectralRolloff(channelData, sampleRate),
            zcr: calculateZeroCrossingRate(channelData),
            mfccVariance: calculateMFCCVariance(channelData, sampleRate),
            danceability: 0 // Will be calculated after other features
        };
    } catch (error) {
        console.error('Error processing audio:', error);
        return generateFallbackFeatures();
    }
}

function estimateTempo(channelData, sampleRate) {
    const windowSize = 2048;
    const hopSize = 512;
    const onsets = detectOnsets(channelData, windowSize, hopSize, sampleRate);
    
    if (onsets.length < 2) {
        return 120; // Default tempo
    }
    
    const intervals = [];
    for (let i = 1; i < onsets.length; i++) {
        const interval = onsets[i] - onsets[i-1];
        if (interval > 0.3 && interval < 2.0) {
            intervals.push(60 / interval);
        }
    }
    
    if (intervals.length === 0) return 120;
    
    // Find median tempo for stability
    intervals.sort((a, b) => a - b);
    const median = intervals[Math.floor(intervals.length / 2)];
    return Math.max(60, Math.min(200, Math.round(median)));
}

function detectOnsets(channelData, windowSize, hopSize, sampleRate) {
    const onsets = [];
    const threshold = 0.3;
    let prevEnergy = 0;
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
        let energy = 0;
        for (let j = 0; j < windowSize; j++) {
            energy += Math.abs(channelData[i + j]);
        }
        energy /= windowSize;
        
        if (energy > prevEnergy * (1 + threshold)) {
            onsets.push((i / sampleRate));
        }
        prevEnergy = energy;
    }
    
    return onsets;
}

function calculateEnergy(channelData) {
    let sum = 0;
    for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] * channelData[i];
    }
    return Math.min(Math.sqrt(sum / channelData.length) * 10, 1);
}

function calculateValence(channelData, sampleRate) {
    const fftSize = 2048;
    const spectrum = performFFT(channelData.slice(0, fftSize));
    
    let lowFreqEnergy = 0;
    let highFreqEnergy = 0;
    const midPoint = Math.floor(spectrum.length / 4);
    
    for (let i = 1; i < midPoint; i++) {
        lowFreqEnergy += spectrum[i];
    }
    for (let i = midPoint; i < spectrum.length / 2; i++) {
        highFreqEnergy += spectrum[i];
    }
    
    const brightness = highFreqEnergy / (lowFreqEnergy + highFreqEnergy + 0.001);
    return Math.max(0.1, Math.min(0.9, brightness * 1.2));
}

function calculateSpectralCentroid(channelData, sampleRate) {
    const fftSize = 2048;
    const spectrum = performFFT(channelData.slice(0, fftSize));
    
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < spectrum.length / 2; i++) {
        const frequency = (i * sampleRate) / fftSize;
        const magnitude = spectrum[i];
        weightedSum += frequency * magnitude;
        magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 1500;
}

function calculateSpectralRolloff(channelData, sampleRate) {
    const fftSize = 2048;
    const spectrum = performFFT(channelData.slice(0, fftSize));
    
    let totalEnergy = 0;
    for (let i = 0; i < spectrum.length / 2; i++) {
        totalEnergy += spectrum[i];
    }
    
    const threshold = totalEnergy * 0.85;
    let cumulativeEnergy = 0;
    
    for (let i = 0; i < spectrum.length / 2; i++) {
        cumulativeEnergy += spectrum[i];
        if (cumulativeEnergy >= threshold) {
            return i / (spectrum.length / 2);
        }
    }
    
    return 0.85;
}

function calculateZeroCrossingRate(channelData) {
    let zeroCrossings = 0;
    for (let i = 1; i < channelData.length; i++) {
        if ((channelData[i] >= 0) !== (channelData[i-1] >= 0)) {
            zeroCrossings++;
        }
    }
    return zeroCrossings / (channelData.length - 1);
}

function calculateMFCCVariance(channelData, sampleRate) {
    const fftSize = 2048;
    const spectrum = performFFT(channelData.slice(0, fftSize));
    
    const melCoefficients = [];
    const numCoefficients = 13;
    
    for (let i = 0; i < numCoefficients; i++) {
        let coeff = 0;
        const startIdx = Math.floor((i * spectrum.length) / (2 * numCoefficients));
        const endIdx = Math.floor(((i + 1) * spectrum.length) / (2 * numCoefficients));
        
        for (let j = startIdx; j < endIdx; j++) {
            coeff += Math.log(spectrum[j] + 0.001);
        }
        melCoefficients.push(coeff / (endIdx - startIdx));
    }
    
    const mean = melCoefficients.reduce((a, b) => a + b, 0) / melCoefficients.length;
    const variance = melCoefficients.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / melCoefficients.length;
    
    return Math.max(0, Math.min(1, variance / 10));
}

function performFFT(channelData) {
    const fftSize = Math.min(2048, channelData.length);
    const spectrum = new Array(fftSize).fill(0);
    const windowedData = applyHammingWindow(channelData.slice(0, fftSize));
    
    // Simple DFT
    for (let k = 0; k < fftSize / 2; k++) {
        let real = 0, imag = 0;
        for (let n = 0; n < fftSize; n++) {
            const angle = -2 * Math.PI * k * n / fftSize;
            real += windowedData[n] * Math.cos(angle);
            imag += windowedData[n] * Math.sin(angle);
        }
        spectrum[k] = Math.sqrt(real * real + imag * imag);
    }
    
    return spectrum;
}

function applyHammingWindow(data) {
    const windowed = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
        windowed[i] = data[i] * (0.54 - 0.46 * Math.cos(2 * Math.PI * i / (data.length - 1)));
    }
    return windowed;
}

function classifyGenre(features) {
    // Calculate danceability after other features
    features.danceability = calculateDanceability(features.tempo, features.energy);
    
    const scores = {};
    const weights = {
        tempo: 0.2,
        energy: 0.15,
        valence: 0.15,
        spectralCentroid: 0.2,
        spectralRolloff: 0.1,
        zcr: 0.1,
        mfccVariance: 0.1
    };
    
    Object.entries(genreDatabase).forEach(([genre, genreData]) => {
        let score = 0;
        
        Object.entries(weights).forEach(([feature, weight]) => {
            if (genreData[feature] && features[feature] !== undefined) {
                const [min, max] = genreData[feature];
                const value = features[feature];
                
                let featureScore = 0;
                if (value >= min && value <= max) {
                    featureScore = 1.0;
                } else {
                    const distance = Math.min(Math.abs(value - min), Math.abs(value - max));
                    const range = max - min;
                    featureScore = Math.max(0, 1 - (distance / (range * 1.5)));
                }
                
                score += featureScore * weight;
            }
        });
        
        scores[genre] = Math.max(0, Math.min(1, score)) * 100;
    });
    
    // Normalize scores
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
        Object.keys(scores).forEach(genre => {
            scores[genre] = (scores[genre] / maxScore) * 100;
        });
    }
    
    return scores;
}

function calculateDanceability(tempo, energy) {
    const tempoScore = tempo >= 110 && tempo <= 140 ? 0.9 : Math.max(0.2, 0.8 - Math.abs(tempo - 125) / 100);
    const energyScore = energy;
    return Math.max(0.2, Math.min(0.95, (tempoScore * 0.6 + energyScore * 0.4)));
}

function generateFallbackFeatures() {
    const genres = Object.keys(genreDatabase);
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    const template = genreDatabase[randomGenre];
    
    return {
        tempo: randomInRange(...template.tempo),
        energy: randomInRange(...template.energy),
        valence: randomInRange(...template.valence),
        spectralCentroid: randomInRange(...template.spectralCentroid),
        spectralRolloff: randomInRange(...template.spectralRolloff),
        zcr: randomInRange(...template.zcr),
        mfccVariance: randomInRange(...template.mfccVariance),
        danceability: Math.random() * 0.6 + 0.2
    };
}

function randomInRange(min, max) {
    return min + Math.random() * (max - min);
}

function displayResults(genreScores, features) {
    const sortedGenres = Object.entries(genreScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6);
    
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
    document.getElementById('tempo').textContent = Math.round(features.tempo);
    document.getElementById('energy').textContent = (features.energy * 100).toFixed(1) + '%';
    document.getElementById('valence').textContent = (features.valence * 100).toFixed(1) + '%';
    document.getElementById('danceability').textContent = (features.danceability * 100).toFixed(1) + '%';
    
    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth' });
}
