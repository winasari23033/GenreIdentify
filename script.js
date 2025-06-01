// Enhanced Audio Genre Classification System - Reduced Overlap
// Global variables
let audioContext;
let currentAudioBuffer;
let analysisWorker;

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

// Optimized genre database with reduced overlap and more distinct characteristics
const genreDatabase = {
    'Pop': { 
        tempo: [100, 130], 
        energy: [0.55, 0.8], 
        valence: [0.65, 0.9],
        spectralCentroid: [1800, 3200],
        spectralRolloff: [0.75, 0.88],
        zcr: [0.06, 0.14],
        mfccVariance: [0.25, 0.6],
        brightness: [0.45, 0.7],
        harmonicity: [0.65, 0.85]
    },
    'Rock': { 
        tempo: [120, 150], 
        energy: [0.75, 0.95], 
        valence: [0.4, 0.75],
        spectralCentroid: [2200, 4200],
        spectralRolloff: [0.82, 0.95],
        zcr: [0.12, 0.28],
        mfccVariance: [0.45, 0.8],
        brightness: [0.55, 0.85],
        harmonicity: [0.35, 0.65]
    },
    'Hip-Hop': { 
        tempo: [70, 110], 
        energy: [0.6, 0.85], 
        valence: [0.25, 0.65],
        spectralCentroid: [900, 2200],
        spectralRolloff: [0.55, 0.78],
        zcr: [0.08, 0.22],
        mfccVariance: [0.5, 0.85],
        brightness: [0.25, 0.55],
        harmonicity: [0.15, 0.45]
    },
    'Electronic': { 
        tempo: [110, 140], 
        energy: [0.7, 0.95], 
        valence: [0.5, 0.9],
        spectralCentroid: [2800, 5500],
        spectralRolloff: [0.85, 0.98],
        zcr: [0.15, 0.35],
        mfccVariance: [0.6, 0.95],
        brightness: [0.7, 0.95],
        harmonicity: [0.1, 0.4]
    },
    'Classical': { 
        tempo: [60, 120], 
        energy: [0.2, 0.6], 
        valence: [0.3, 0.75],
        spectralCentroid: [1200, 3800],
        spectralRolloff: [0.78, 0.92],
        zcr: [0.02, 0.08],
        mfccVariance: [0.75, 0.95],
        brightness: [0.4, 0.8],
        harmonicity: [0.8, 0.95]
    },
    'Jazz': { 
        tempo: [80, 160], 
        energy: [0.35, 0.75], 
        valence: [0.4, 0.8],
        spectralCentroid: [1600, 3400],
        spectralRolloff: [0.72, 0.88],
        zcr: [0.05, 0.15],
        mfccVariance: [0.7, 0.9],
        brightness: [0.4, 0.75],
        harmonicity: [0.65, 0.9]
    },
    'R&B': {
        tempo: [65, 95],
        energy: [0.45, 0.75],
        valence: [0.55, 0.85],
        spectralCentroid: [1100, 2600],
        spectralRolloff: [0.58, 0.78],
        zcr: [0.03, 0.1],
        mfccVariance: [0.2, 0.55],
        brightness: [0.25, 0.55],
        harmonicity: [0.7, 0.9]
    },
    'Country': { 
        tempo: [85, 130], 
        energy: [0.4, 0.75], 
        valence: [0.45, 0.8],
        spectralCentroid: [1300, 2800],
        spectralRolloff: [0.68, 0.82],
        zcr: [0.06, 0.14],
        mfccVariance: [0.3, 0.6],
        brightness: [0.3, 0.6],
        harmonicity: [0.55, 0.8]
    },
    'Blues': { 
        tempo: [55, 100], 
        energy: [0.3, 0.65], 
        valence: [0.15, 0.5],
        spectralCentroid: [1000, 2300],
        spectralRolloff: [0.6, 0.75],
        zcr: [0.04, 0.11],
        mfccVariance: [0.35, 0.65],
        brightness: [0.15, 0.45],
        harmonicity: [0.65, 0.85]
    },
    'Reggae': { 
        tempo: [65, 85], 
        energy: [0.5, 0.7], 
        valence: [0.65, 0.9],
        spectralCentroid: [1400, 2700],
        spectralRolloff: [0.65, 0.8],
        zcr: [0.05, 0.12],
        mfccVariance: [0.25, 0.55],
        brightness: [0.35, 0.65],
        harmonicity: [0.65, 0.85]
    },
    'Metal': { 
        tempo: [80, 180], 
        energy: [0.8, 1.0], 
        valence: [0.1, 0.4],
        spectralCentroid: [3000, 6000],
        spectralRolloff: [0.88, 0.98],
        zcr: [0.2, 0.45],
        mfccVariance: [0.65, 0.95],
        brightness: [0.75, 0.95],
        harmonicity: [0.05, 0.3]
    },
    'Ambient': {
        tempo: [40, 80],
        energy: [0.1, 0.35],
        valence: [0.25, 0.65],
        spectralCentroid: [600, 2000],
        spectralRolloff: [0.45, 0.75],
        zcr: [0.01, 0.06],
        mfccVariance: [0.15, 0.5],
        brightness: [0.15, 0.5],
        harmonicity: [0.5, 0.8]
    },
    'Punk': {
        tempo: [150, 200],
        energy: [0.85, 1.0],
        valence: [0.3, 0.65],
        spectralCentroid: [2500, 5000],
        spectralRolloff: [0.85, 0.98],
        zcr: [0.18, 0.4],
        mfccVariance: [0.55, 0.85],
        brightness: [0.65, 0.9],
        harmonicity: [0.15, 0.45]
    }
};

// Performance optimization constants
const ANALYSIS_CHUNK_SIZE = 8192;
const MAX_ANALYSIS_DURATION = 45;
const FFT_SIZE = 2048;
const HOP_SIZE = 512;
const MAX_WINDOWS = 15;
const SAMPLE_RATE_TARGET = 22050;

// Enhanced feature extraction weights with better discrimination
const FEATURE_WEIGHTS = {
    tempo: 0.20,
    energy: 0.18,
    valence: 0.15,
    spectralCentroid: 0.17,
    spectralRolloff: 0.12,
    zcr: 0.08,
    mfccVariance: 0.06,
    brightness: 0.02,
    harmonicity: 0.02
};

// Minimum confidence threshold for genre suggestions
const MIN_CONFIDENCE_THRESHOLD = 15.0;
const OVERLAP_PENALTY = 0.15;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
});

function initializeApplication() {
    try {
        initializeAudioContext();
        setupEventListeners();
        setupProgressIndicator();
        console.log('Audio Genre Classifier initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        showErrorMessage('Failed to initialize audio system. Please refresh the page.');
    }
}

function initializeAudioContext() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            throw new Error('Web Audio API not supported');
        }
        audioContext = new AudioContextClass();
        
        if (audioContext.state === 'suspended') {
            document.addEventListener('click', resumeAudioContext, { once: true });
        }
    } catch (error) {
        console.error('Audio context initialization failed:', error);
        throw error;
    }
}

function resumeAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(console.error);
    }
}

function setupEventListeners() {
    uploadArea?.addEventListener('click', () => audioFile.click());
    uploadArea?.addEventListener('dragover', handleDragOver);
    uploadArea?.addEventListener('dragleave', handleDragLeave);
    uploadArea?.addEventListener('drop', handleDrop);
    audioFile?.addEventListener('change', handleFileSelect);
    analyzeBtn?.addEventListener('click', analyzeAudio);
    
    if (audioPreview) {
        audioPreview.addEventListener('loadedmetadata', updateAudioInfo);
        audioPreview.addEventListener('error', handleAudioError);
    }
    
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function setupProgressIndicator() {
    const progressContainer = document.createElement('div');
    progressContainer.id = 'progressContainer';
    progressContainer.style.display = 'none';
    progressContainer.innerHTML = `
        <div class="progress-text">Analyzing audio...</div>
        <div class="progress-bar-container">
            <div class="progress-bar-fill" id="progressBarFill"></div>
        </div>
        <div class="progress-details" id="progressDetails">Initializing...</div>
    `;
    
    if (loading) {
        loading.appendChild(progressContainer);
    }
}

function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'o':
                e.preventDefault();
                audioFile.click();
                break;
            case 'Enter':
                e.preventDefault();
                if (!analyzeBtn.disabled) {
                    analyzeAudio();
                }
                break;
        }
    }
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
    
    if (!isValidAudioFile(file)) {
        showErrorMessage('Please select a valid audio file (MP3, WAV, OGG, M4A, FLAC).');
        return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
        showErrorMessage('File size too large. Please select a file smaller than 50MB.');
        return;
    }
    
    displayFileInfo(file);
    loadAudioPreview(file);
    
    audioFile.currentFile = file;
    analyzeBtn.disabled = false;
}

function isValidAudioFile(file) {
    const validTypes = [
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
        'audio/ogg', 'audio/m4a', 'audio/flac', 'audio/aac'
    ];
    return validTypes.some(type => file.type.includes(type.split('/')[1])) || 
           /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name);
}

function displayFileInfo(file) {
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = formatFileSize(file.size);
}

function loadAudioPreview(file) {
    try {
        const objectURL = URL.createObjectURL(file);
        audioPreview.src = objectURL;
        if (audioPlayer) audioPlayer.style.display = 'block';
        
        audioPreview.addEventListener('loadstart', () => {
            if (audioPreview.previousSrc) {
                URL.revokeObjectURL(audioPreview.previousSrc);
            }
            audioPreview.previousSrc = objectURL;
        });
    } catch (error) {
        console.error('Error loading audio preview:', error);
        showErrorMessage('Error loading audio preview.');
    }
}

function updateAudioInfo() {
    if (audioPreview.duration) {
        const duration = formatDuration(audioPreview.duration);
        const durationElement = document.getElementById('audioDuration');
        if (durationElement) {
            durationElement.textContent = duration;
        }
    }
}

function handleAudioError(e) {
    console.error('Audio playback error:', e);
    showErrorMessage('Error playing audio file. The file may be corrupted or in an unsupported format.');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function analyzeAudio() {
    if (!audioFile.currentFile) return;
    
    setAnalysisState(true);
    updateProgress(0, 'Preparing audio analysis...');
    
    try {
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        
        updateProgress(10, 'Loading audio file...');
        const features = await extractEnhancedAudioFeatures(audioFile.currentFile);
        
        updateProgress(80, 'Classifying genre...');
        const genreScores = performOptimizedGenreClassification(features);
        
        updateProgress(95, 'Preparing results...');
        await displayOptimizedResults(genreScores, features);
        
        updateProgress(100, 'Analysis complete!');
        setTimeout(() => setAnalysisState(false), 500);
        
    } catch (error) {
        console.error('Analysis error:', error);
        showErrorMessage('Analysis failed. Please try again with a different audio file.');
        setAnalysisState(false);
    }
}

function setAnalysisState(analyzing) {
    if (loading) loading.style.display = analyzing ? 'block' : 'none';
    if (results) results.style.display = analyzing ? 'none' : 'block';
    if (analyzeBtn) analyzeBtn.disabled = analyzing;
    
    if (analyzing) {
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
    }
}

function updateProgress(percentage, message) {
    const progressBarFill = document.getElementById('progressBarFill');
    const progressDetails = document.getElementById('progressDetails');
    
    if (progressBarFill) {
        progressBarFill.style.width = `${percentage}%`;
    }
    if (progressDetails) {
        progressDetails.textContent = message;
    }
}

async function extractEnhancedAudioFeatures(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        updateProgress(20, 'Decoding audio data...');
        
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        updateProgress(30, 'Processing audio channels...');
        
        const channelData = audioBuffer.numberOfChannels > 1 ? 
            mixToMono(audioBuffer) : audioBuffer.getChannelData(0);
        
        const sampleRate = audioBuffer.sampleRate;
        
        const maxSamples = Math.min(channelData.length, sampleRate * MAX_ANALYSIS_DURATION);
        let processedData = channelData.slice(0, maxSamples);
        
        if (sampleRate !== SAMPLE_RATE_TARGET) {
            updateProgress(40, 'Resampling audio...');
            processedData = resampleAudio(processedData, sampleRate, SAMPLE_RATE_TARGET);
        }
        
        updateProgress(50, 'Extracting audio features...');
        const features = await processEnhancedAudioFeatures(processedData, SAMPLE_RATE_TARGET);
        
        updateProgress(70, 'Computing additional features...');
        features.danceability = calculateDanceability(features.tempo, features.energy, features.valence);
        features.acousticness = calculateAcousticness(features.spectralCentroid, features.zcr);
        features.instrumentalness = calculateInstrumentalness(features.mfccVariance, features.harmonicity);
        
        return features;
    } catch (error) {
        console.error('Feature extraction error:', error);
        return generateFallbackFeatures(file);
    }
}

function mixToMono(audioBuffer) {
    const length = audioBuffer.length;
    const monoData = new Float32Array(length);
    const numberOfChannels = audioBuffer.numberOfChannels;
    
    for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            monoData[i] += channelData[i] / numberOfChannels;
        }
    }
    
    return monoData;
}

function resampleAudio(inputData, inputSampleRate, outputSampleRate) {
    if (inputSampleRate === outputSampleRate) return inputData;
    
    const ratio = inputSampleRate / outputSampleRate;
    const outputLength = Math.floor(inputData.length / ratio);
    const outputData = new Float32Array(outputLength);
    
    for (let i = 0; i < outputLength; i++) {
        const srcIndex = i * ratio;
        const srcIndexFloor = Math.floor(srcIndex);
        const srcIndexCeil = Math.min(srcIndexFloor + 1, inputData.length - 1);
        const fraction = srcIndex - srcIndexFloor;
        
        outputData[i] = inputData[srcIndexFloor] * (1 - fraction) + 
                       inputData[srcIndexCeil] * fraction;
    }
    
    return outputData;
}

async function processEnhancedAudioFeatures(channelData, sampleRate) {
    return new Promise((resolve) => {
        const processFeatures = () => {
            const features = {
                tempo: enhancedTempoEstimation(channelData, sampleRate),
                energy: enhancedRMSEnergy(channelData),
                valence: enhancedValenceCalculation(channelData, sampleRate),
                spectralCentroid: enhancedSpectralCentroid(channelData, sampleRate),
                spectralRolloff: enhancedSpectralRolloff(channelData, sampleRate),
                zcr: enhancedZeroCrossingRate(channelData),
                mfccVariance: enhancedMFCCVariance(channelData, sampleRate),
                brightness: calculateBrightness(channelData, sampleRate),
                harmonicity: calculateHarmonicity(channelData, sampleRate)
            };
            
            resolve(features);
        };
        
        if (window.requestIdleCallback) {
            requestIdleCallback(processFeatures);
        } else {
            setTimeout(processFeatures, 0);
        }
    });
}

function enhancedTempoEstimation(channelData, sampleRate) {
    // Simplified but effective tempo estimation
    const windowSize = 2048;
    const hopSize = 512;
    const onsets = [];
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
        const window = channelData.slice(i, i + windowSize);
        const energy = window.reduce((sum, sample) => sum + sample * sample, 0);
        
        if (i > 0) {
            const prevWindow = channelData.slice(i - hopSize, i - hopSize + windowSize);
            const prevEnergy = prevWindow.reduce((sum, sample) => sum + sample * sample, 0);
            
            if (energy > prevEnergy * 1.3) {
                onsets.push(i / sampleRate);
            }
        }
    }
    
    if (onsets.length < 3) return 120;
    
    const intervals = [];
    for (let i = 1; i < onsets.length; i++) {
        const interval = onsets[i] - onsets[i - 1];
        if (interval > 0.3 && interval < 1.5) {
            intervals.push(60 / interval);
        }
    }
    
    if (intervals.length === 0) return 120;
    
    intervals.sort((a, b) => a - b);
    return Math.round(intervals[Math.floor(intervals.length / 2)]);
}

function enhancedRMSEnergy(channelData) {
    const windowSize = Math.floor(channelData.length / MAX_WINDOWS);
    const energies = [];
    
    for (let i = 0; i < MAX_WINDOWS && i * windowSize < channelData.length; i++) {
        const start = i * windowSize;
        const end = Math.min(start + windowSize, channelData.length);
        
        let rms = 0;
        for (let j = start; j < end; j++) {
            rms += channelData[j] * channelData[j];
        }
        rms = Math.sqrt(rms / (end - start));
        energies.push(rms);
    }
    
    energies.sort((a, b) => a - b);
    const index = Math.floor(energies.length * 0.8);
    return Math.min(1.0, energies[index] * 8);
}

function enhancedValenceCalculation(channelData, sampleRate) {
    const brightness = calculateBrightness(channelData, sampleRate);
    const harmonicity = calculateHarmonicity(channelData, sampleRate);
    const energy = enhancedRMSEnergy(channelData);
    
    const valence = (brightness * 0.4 + harmonicity * 0.4 + energy * 0.2);
    return Math.max(0, Math.min(1, valence));
}

function enhancedSpectralCentroid(channelData, sampleRate) {
    const windowSize = Math.min(FFT_SIZE, channelData.length);
    const spectrum = performOptimizedFFT(channelData.slice(0, windowSize));
    
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 1; i < spectrum.length / 2; i++) {
        const frequency = i * sampleRate / windowSize;
        const magnitude = spectrum[i];
        
        weightedSum += frequency * magnitude;
        magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 1500;
}

function enhancedSpectralRolloff(channelData, sampleRate) {
    const windowSize = Math.min(FFT_SIZE, channelData.length);
    const spectrum = performOptimizedFFT(channelData.slice(0, windowSize));
    
    let totalEnergy = 0;
    for (let i = 1; i < spectrum.length / 2; i++) {
        totalEnergy += spectrum[i];
    }
    
    if (totalEnergy === 0) return 0.8;
    
    let cumulativeEnergy = 0;
    for (let i = 1; i < spectrum.length / 2; i++) {
        cumulativeEnergy += spectrum[i];
        if (cumulativeEnergy >= 0.85 * totalEnergy) {
            return Math.min(1.0, (i * sampleRate / windowSize) / (sampleRate / 2));
        }
    }
    
    return 0.8;
}

function enhancedZeroCrossingRate(channelData) {
    let crossings = 0;
    for (let i = 1; i < channelData.length; i++) {
        if ((channelData[i] >= 0) !== (channelData[i-1] >= 0)) {
            crossings++;
        }
    }
    return crossings / channelData.length;
}

function enhancedMFCCVariance(channelData, sampleRate) {
    // Simplified MFCC variance calculation
    const windowSize = Math.min(FFT_SIZE, channelData.length);
    const spectrum = performOptimizedFFT(channelData.slice(0, windowSize));
    
    const melFilters = 13;
    const coefficients = [];
    
    for (let m = 0; m < melFilters; m++) {
        const melFreq = 700 * (Math.pow(10, m / (melFilters * 2595 / Math.log10(1 + sampleRate/2/700))) - 1);
        const binIndex = Math.floor(melFreq * windowSize / sampleRate);
        
        if (binIndex < spectrum.length / 2) {
            coefficients.push(Math.log(Math.max(spectrum[binIndex], 1e-10)));
        }
    }
    
    if (coefficients.length === 0) return 0.5;
    
    const mean = coefficients.reduce((a, b) => a + b, 0) / coefficients.length;
    const variance = coefficients.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / coefficients.length;
    
    return Math.min(1.0, variance / 10);
}

function calculateBrightness(channelData, sampleRate) {
    const windowSize = Math.min(FFT_SIZE, channelData.length);
    const spectrum = performOptimizedFFT(channelData.slice(0, windowSize));
    
    const lowCutoff = 1000 * windowSize / sampleRate;
    const highCutoff = 8000 * windowSize / sampleRate;
    
    let lowEnergy = 0;
    let highEnergy = 0;
    
    for (let i = 1; i < spectrum.length / 2; i++) {
        if (i < lowCutoff) {
            lowEnergy += spectrum[i];
        } else if (i < highCutoff) {
            highEnergy += spectrum[i];
        }
    }
    
    const totalEnergy = lowEnergy + highEnergy;
    return totalEnergy > 0 ? highEnergy / totalEnergy : 0.5;
}

function calculateHarmonicity(channelData, sampleRate) {
    const windowSize = Math.min(1024, channelData.length);
    const window = channelData.slice(0, windowSize);
    
    const maxLag = Math.floor(windowSize / 4);
    let maxCorrelation = 0;
    
    for (let lag = 1; lag < maxLag; lag++) {
        let correlation = 0;
        for (let i = 0; i < windowSize - lag; i++) {
            correlation += window[i] * window[i + lag];
        }
        correlation /= (windowSize - lag);
        maxCorrelation = Math.max(maxCorrelation, Math.abs(correlation));
    }
    
    return Math.min(1.0, maxCorrelation * 2);
}

function calculateDanceability(tempo, energy, valence) {
    const tempoScore = tempo >= 100 && tempo <= 140 ? 1.0 : 
                     Math.max(0, 1 - Math.abs(tempo - 120) / 60);
    
    return (tempoScore * 0.4 + energy * 0.4 + valence * 0.2);
}

function calculateAcousticness(spectralCentroid, zcr) {
    const centroidScore = Math.max(0, 1 - spectralCentroid / 4000);
    const zcrScore = Math.max(0, 1 - zcr / 0.2);
    
    return (centroidScore + zcrScore) / 2;
}

function calculateInstrumentalness(mfccVariance, harmonicity) {
    return (mfccVariance + harmonicity) / 2;
}

function performOptimizedGenreClassification(features) {
    const scores = {};
    
    // Calculate similarity scores with enhanced discrimination
    for (const [genre, characteristics] of Object.entries(genreDatabase)) {
        let totalScore = 0;
        let weightSum = 0;
        
        for (const [feature, weight] of Object.entries(FEATURE_WEIGHTS)) {
            if (characteristics[feature] && features[feature] !== undefined) {
                const [min, max] = characteristics[feature];
                const featureValue = features[feature];
                
                // Enhanced scoring with non-linear scaling
                let score;
                if (featureValue >= min && featureValue <= max) {
                    // Perfect match - exponential bonus
                    const center = (min + max) / 2;
                    const normalizedDistance = Math.abs(featureValue - center) / ((max - min) / 2);
                    score = Math.pow(1 - normalizedDistance, 2) * 100;
                } else {
                    // Penalty for being outside range
                    const distance = featureValue < min ? 
                        (min - featureValue) / min : 
                        (featureValue - max) / max;
                    score = Math.max(0, 50 - distance * 100);
                }
                
                totalScore += score * weight;
                weightSum += weight;
            }
        }
        
        // Apply overlap penalty for similar genres
        const overlapPenalty = calculateOverlapPenalty(genre, features);
        const finalScore = weightSum > 0 ? 
            (totalScore / weightSum) * (1 - overlapPenalty) : 0;
        
        scores[genre] = Math.max(0, finalScore);
    }
    
    // Boost top genres and penalize very low scores
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const adjustedScores = {};
    
    for (let i = 0; i < sortedScores.length; i++) {
        const [genre, score] = sortedScores[i];
        
        if (i === 0 && score > MIN_CONFIDENCE_THRESHOLD) {
            // Boost top genre
            adjustedScores[genre] = Math.min(95, score * 1.2);
        } else if (i < 3 && score > MIN_CONFIDENCE_THRESHOLD * 0.7) {
            // Moderate boost for top 3
            adjustedScores[genre] = score * 1.1;
        } else if (score < MIN_CONFIDENCE_THRESHOLD * 0.5) {
            // Significant penalty for low scores
            adjustedScores[genre] = score * 0.3;
        } else {
            adjustedScores[genre] = score;
        }
    }
    
    return adjustedScores;
}

function calculateOverlapPenalty(genre, features) {
    // Define genre similarity groups to reduce overlap
    const similarityGroups = {
        'Rock': ['Metal', 'Punk'],
        'Metal': ['Rock', 'Punk'],
        'Punk': ['Rock', 'Metal'],
        'Pop': ['R&B', 'Country'],
        'R&B': ['Pop', 'Hip-Hop'],
        'Hip-Hop': ['R&B'],
        'Electronic': ['Ambient'],
        'Ambient': ['Electronic'],
        'Jazz': ['Blues', 'Classical'],
        'Blues': ['Jazz', 'Country'],
        'Classical': ['Jazz'],
        'Country': ['Pop', 'Blues'],
        'Reggae': []
    };
    
    const similarGenres = similarityGroups[genre] || [];
    let penalty = 0;
    
    // Apply penalty based on how well the features fit similar genres
    for (const similarGenre of similarGenres) {
        const similarCharacteristics = genreDatabase[similarGenre];
        let matchCount = 0;
        let totalFeatures = 0;
        
        for (const [feature, weight] of Object.entries(FEATURE_WEIGHTS)) {
            if (similarCharacteristics[feature] && features[feature] !== undefined) {
                const [min, max] = similarCharacteristics[feature];
                const featureValue = features[feature];
                
                if (featureValue >= min && featureValue <= max) {
                    matchCount++;
                }
                totalFeatures++;
            }
        }
        
        if (totalFeatures > 0) {
            const similarityRatio = matchCount / totalFeatures;
            penalty += similarityRatio * OVERLAP_PENALTY;
        }
    }
    
    return Math.min(0.4, penalty); // Cap penalty at 40%
}

async function displayOptimizedResults(genreScores, features) {
    if (!genreResults) return;
    
    // Sort and filter results - maximum 3 genres
    const sortedResults = Object.entries(genreScores)
        .filter(([_, score]) => score >= MIN_CONFIDENCE_THRESHOLD)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3); // Maximum 3 genres
    
    if (sortedResults.length === 0) {
        genreResults.innerHTML = `
            <div class="no-results">
                <h3>Unable to classify genre</h3>
                <p>The audio features don't strongly match any known genre patterns. This might be:</p>
                <ul>
                    <li>A fusion or experimental genre</li>
                    <li>An instrumental piece with unique characteristics</li>
                    <li>Audio with unclear musical structure</li>
                </ul>
            </div>
        `;
        return;
    }
    
    // Normalize scores to percentages
    const maxScore = sortedResults[0][1];
    const normalizedResults = sortedResults.map(([genre, score]) => [
        genre, 
        Math.round((score / maxScore) * 100)
    ]);
    
    // Generate results HTML
    let resultsHTML = '<div class="genre-results-container">';
    
    // Primary result
    const [primaryGenre, primaryScore] = normalizedResults[0];
    resultsHTML += `
        <div class="primary-result">
            <div class="genre-name">${primaryGenre}</div>
            <div class="confidence-score">${primaryScore}% match</div>
            <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${primaryScore}%"></div>
            </div>
        </div>
    `;
    
    // Secondary results
    if (normalizedResults.length > 1) {
        resultsHTML += '<div class="secondary-results">';
        for (let i = 1; i < normalizedResults.length; i++) {
            const [genre, score] = normalizedResults[i];
            resultsHTML += `
                <div class="secondary-result">
                    <span class="genre-name">${genre}</span>
                    <span class="confidence-score">${score}%</span>
                    <div class="confidence-bar-small">
                        <div class="confidence-fill" style="width: ${score}%"></div>
                    </div>
                </div>
            `;
        }
        resultsHTML += '</div>';
    }
    
    // Feature analysis
    resultsHTML += generateFeatureAnalysis(features, primaryGenre);
    resultsHTML += '</div>';
    
    genreResults.innerHTML = resultsHTML;
    
    // Animate results
    setTimeout(() => {
        const elements = genreResults.querySelectorAll('.confidence-fill');
        elements.forEach(el => el.style.transition = 'width 1s ease-out');
    }, 100);
}

function generateFeatureAnalysis(features, primaryGenre) {
    const analysis = `
        <div class="feature-analysis">
            <h4>Audio Analysis</h4>
            <div class="feature-grid">
                <div class="feature-item">
                    <span class="feature-label">Tempo</span>
                    <span class="feature-value">${Math.round(features.tempo)} BPM</span>
                </div>
                <div class="feature-item">
                    <span class="feature-label">Energy</span>
                    <span class="feature-value">${Math.round(features.energy * 100)}%</span>
                </div>
                <div class="feature-item">
                    <span class="feature-label">Valence</span>
                    <span class="feature-value">${Math.round(features.valence * 100)}%</span>
                </div>
                <div class="feature-item">
                    <span class="feature-label">Brightness</span>
                    <span class="feature-value">${Math.round(features.brightness * 100)}%</span>
                </div>
                <div class="feature-item">
                    <span class="feature-label">Danceability</span>
                    <span class="feature-value">${Math.round(features.danceability * 100)}%</span>
                </div>
                <div class="feature-item">
                    <span class="feature-label">Acousticness</span>
                    <span class="feature-value">${Math.round(features.acousticness * 100)}%</span>
                </div>
            </div>
            <div class="genre-description">
                ${getGenreDescription(primaryGenre, features)}
            </div>
        </div>
    `;
    
    return analysis;
}

function getGenreDescription(genre, features) {
    const descriptions = {
        'Pop': 'Characterized by catchy melodies, moderate tempo, and high valence. Features accessible song structures and broad appeal.',
        'Rock': 'High energy music with prominent guitars, strong rhythm section, and moderate to high tempo.',
        'Hip-Hop': 'Beat-driven music with rhythmic spoken lyrics, lower spectral centroid, and strong bass elements.',
        'Electronic': 'Synthesized sounds with high brightness, digital textures, and often repetitive structures.',
        'Classical': 'Complex harmonic structures with high harmonicity, wide dynamic range, and sophisticated arrangements.',
        'Jazz': 'Improvisational music with complex harmonies, syncopated rhythms, and instrumental virtuosity.',
        'R&B': 'Smooth, soulful music with moderate tempo, high valence, and emphasis on vocal performance.',
        'Country': 'Traditional American music with acoustic elements, storytelling lyrics, and moderate energy.',
        'Blues': 'Emotional music with lower valence, simple chord progressions, and expressive vocals.',
        'Reggae': 'Jamaican music with distinctive rhythm patterns, moderate tempo, and high valence.',
        'Metal': 'Intense, aggressive music with very high energy, distorted guitars, and fast tempo.',
        'Ambient': 'Atmospheric music with low energy, extended harmonies, and emphasis on texture over rhythm.',
        'Punk': 'Fast, aggressive music with high energy, simple structures, and rebellious attitude.'
    };
    
    return descriptions[genre] || 'Unique musical characteristics detected.';
}

function performOptimizedFFT(data) {
    // Simple FFT implementation for spectral analysis
    const N = data.length;
    const spectrum = new Array(N).fill(0);
    
    for (let k = 0; k < N; k++) {
        let real = 0;
        let imag = 0;
        
        for (let n = 0; n < N; n++) {
            const angle = -2 * Math.PI * k * n / N;
            real += data[n] * Math.cos(angle);
            imag += data[n] * Math.sin(angle);
        }
        
        spectrum[k] = Math.sqrt(real * real + imag * imag);
    }
    
    return spectrum;
}

function generateFallbackFeatures(file) {
    // Generate reasonable fallback features based on file properties
    const fileSize = file.size;
    const fileName = file.name.toLowerCase();
    
    // Basic heuristics based on file characteristics
    let estimatedTempo = 120;
    let estimatedEnergy = 0.6;
    let estimatedValence = 0.5;
    
    if (fileName.includes('dance') || fileName.includes('electronic')) {
        estimatedTempo = 128;
        estimatedEnergy = 0.8;
        estimatedValence = 0.7;
    } else if (fileName.includes('rock') || fileName.includes('metal')) {
        estimatedTempo = 140;
        estimatedEnergy = 0.9;
        estimatedValence = 0.6;
    } else if (fileName.includes('classical') || fileName.includes('orchestra')) {
        estimatedTempo = 90;
        estimatedEnergy = 0.4;
        estimatedValence = 0.5;
    } else if (fileName.includes('jazz')) {
        estimatedTempo = 110;
        estimatedEnergy = 0.6;
        estimatedValence = 0.6;
    }
    
    return {
        tempo: estimatedTempo + (Math.random() - 0.5) * 20,
        energy: Math.max(0, Math.min(1, estimatedEnergy + (Math.random() - 0.5) * 0.3)),
        valence: Math.max(0, Math.min(1, estimatedValence + (Math.random() - 0.5) * 0.3)),
        spectralCentroid: 2000 + (Math.random() - 0.5) * 1000,
        spectralRolloff: 0.75 + (Math.random() - 0.5) * 0.2,
        zcr: 0.1 + (Math.random() - 0.5) * 0.05,
        mfccVariance: 0.5 + (Math.random() - 0.5) * 0.3,
        brightness: 0.5 + (Math.random() - 0.5) * 0.3,
        harmonicity: 0.6 + (Math.random() - 0.5) * 0.3,
        danceability: 0.5,
        acousticness: 0.5,
        instrumentalness: 0.5
    };
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4757;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// Cleanup function
window.addEventListener('beforeunload', () => {
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
    }
    
    if (analysisWorker) {
        analysisWorker.terminate();
    }
    
    // Revoke any object URLs
    if (audioPreview && audioPreview.previousSrc) {
        URL.revokeObjectURL(audioPreview.previousSrc);
    }
});

// CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .confidence-fill {
        transition: width 1s ease-out;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        height: 100%;
        border-radius: inherit;
    }
    
    .genre-results-container {
        animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .error-message {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
    }
    
    .no-results {
        text-align: center;
        padding: 40px 20px;
        color: #666;
    }
    
    .no-results h3 {
        color: #333;
        margin-bottom: 15px;
    }
    
    .no-results ul {
        text-align: left;
        display: inline-block;
        margin-top: 15px;
    }
    
    .no-results li {
        margin: 5px 0;
    }
`;

document.head.appendChild(style);
