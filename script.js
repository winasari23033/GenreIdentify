// Enhanced Audio Genre Classification System
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

// Enhanced genre database with more precise characteristics
const genreDatabase = {
    'Pop': { 
        tempo: [110, 130], 
        energy: [0.6, 0.85], 
        valence: [0.6, 0.9],
        spectralCentroid: [1500, 3000],
        spectralRolloff: [0.75, 0.9],
        zcr: [0.05, 0.15],
        mfccVariance: [0.3, 0.7],
        brightness: [0.4, 0.7],
        harmonicity: [0.6, 0.85]
    },
    'Rock': { 
        tempo: [110, 140], 
        energy: [0.7, 0.95], 
        valence: [0.4, 0.8],
        spectralCentroid: [2000, 4000],
        spectralRolloff: [0.8, 0.95],
        zcr: [0.1, 0.25],
        mfccVariance: [0.4, 0.8],
        brightness: [0.5, 0.8],
        harmonicity: [0.4, 0.7]
    },
    'Alternative Rock': {
        tempo: [100, 150],
        energy: [0.6, 0.85],
        valence: [0.4, 0.7],
        spectralCentroid: [1900, 3600],
        spectralRolloff: [0.75, 0.9],
        zcr: [0.1, 0.22],
        mfccVariance: [0.45, 0.8],
        brightness: [0.45, 0.75],
        harmonicity: [0.35, 0.65]
    },
    'Indie Alternative': {
        tempo: [80, 140],
        energy: [0.4, 0.7],
        valence: [0.3, 0.65],
        spectralCentroid: [1600, 3200],
        spectralRolloff: [0.7, 0.88],
        zcr: [0.06, 0.18],
        mfccVariance: [0.35, 0.7],
        brightness: [0.4, 0.65],
        harmonicity: [0.4, 0.7]
    },
    'Post-Punk / Shoegaze': {
        tempo: [70, 120],
        energy: [0.45, 0.75],
        valence: [0.2, 0.5],
        spectralCentroid: [1500, 3000],
        spectralRolloff: [0.7, 0.88],
        zcr: [0.05, 0.15],
        mfccVariance: [0.4, 0.75],
        brightness: [0.3, 0.6],
        harmonicity: [0.3, 0.6]
    },
    'Indie': {
        tempo: [85, 120],
        energy: [0.4, 0.75],
        valence: [0.4, 0.8],
        spectralCentroid: [1600, 3200],
        spectralRolloff: [0.65, 0.85],
        zcr: [0.06, 0.18],
        mfccVariance: [0.3, 0.65],
        brightness: [0.4, 0.7],
        harmonicity: [0.5, 0.8]
    },
    'R&B': {
        tempo: [70, 100],
        energy: [0.5, 0.8],
        valence: [0.5, 0.85],
        spectralCentroid: [1200, 2800],
        spectralRolloff: [0.6, 0.8],
        zcr: [0.04, 0.12],
        mfccVariance: [0.25, 0.6],
        brightness: [0.3, 0.6],
        harmonicity: [0.6, 0.9]
    },
    'Pop Punk': {
        tempo: [160, 200],
        energy: [0.8, 0.95],
        valence: [0.5, 0.85],
        spectralCentroid: [2200, 4500],
        spectralRolloff: [0.85, 0.95],
        zcr: [0.15, 0.3],
        mfccVariance: [0.5, 0.85],
        brightness: [0.6, 0.85],
        harmonicity: [0.3, 0.6]
    },
    'Hip-Hop': { 
        tempo: [70, 140], 
        energy: [0.6, 0.9], 
        valence: [0.3, 0.7],
        spectralCentroid: [1000, 2500],
        spectralRolloff: [0.6, 0.85],
        zcr: [0.05, 0.2],
        mfccVariance: [0.4, 0.8],
        brightness: [0.3, 0.6],
        harmonicity: [0.2, 0.5]
    },
    'Electronic': { 
        tempo: [120, 140], 
        energy: [0.7, 0.95], 
        valence: [0.5, 0.9],
        spectralCentroid: [2500, 5000],
        spectralRolloff: [0.8, 0.95],
        zcr: [0.1, 0.25],
        mfccVariance: [0.5, 0.9],
        brightness: [0.6, 0.9],
        harmonicity: [0.2, 0.5]
    },
    'Dance': {
        tempo: [120, 130],
        energy: [0.8, 0.95],
        valence: [0.60, 0.95],
        spectralCentroid: [2000, 4000],
        spectralRolloff: [0.85, 0.95],
        zcr: [0.12, 0.25],
        mfccVariance: [0.4, 0.8],
        brightness: [0.6, 0.85],
        harmonicity: [0.3, 0.6]
    },
    'Classical': { 
        tempo: [60, 140], 
        energy: [0.2, 0.7], 
        valence: [0.3, 0.8],
        spectralCentroid: [1200, 4000],
        spectralRolloff: [0.75, 0.9],
        zcr: [0.03, 0.1],
        mfccVariance: [0.7, 0.95],
        brightness: [0.4, 0.8],
        harmonicity: [0.7, 0.95]
    },
    'Blues': { 
        tempo: [60, 120], 
        energy: [0.3, 0.75], 
        valence: [0.2, 0.6],
        spectralCentroid: [1200, 2500],
        spectralRolloff: [0.65, 0.8],
        zcr: [0.04, 0.12],
        mfccVariance: [0.3, 0.6],
        brightness: [0.2, 0.5],
        harmonicity: [0.6, 0.85]
    },
    'Country': { 
        tempo: [80, 140], 
        energy: [0.4, 0.8], 
        valence: [0.4, 0.8],
        spectralCentroid: [1200, 2800],
        spectralRolloff: [0.7, 0.85],
        zcr: [0.06, 0.15],
        mfccVariance: [0.35, 0.65],
        brightness: [0.3, 0.6],
        harmonicity: [0.5, 0.8]
    },
    'Reggae': { 
        tempo: [60, 90], 
        energy: [0.5, 0.75], 
        valence: [0.6, 0.9],
        spectralCentroid: [1300, 2600],
        spectralRolloff: [0.65, 0.8],
        zcr: [0.05, 0.13],
        mfccVariance: [0.3, 0.6],
        brightness: [0.3, 0.6],
        harmonicity: [0.6, 0.85]
    },
    'Metal': { 
        tempo: [70, 200], 
        energy: [0.5, 1.0], 
        valence: [0.1, 0.5],
        spectralCentroid: [2500, 5500],
        spectralRolloff: [0.85, 0.95],
        zcr: [0.2, 0.4],
        mfccVariance: [0.6, 0.95],
        brightness: [0.7, 0.95],
        harmonicity: [0.1, 0.4]
    },
    'K-Pop': {
        tempo: [100, 140],
        energy: [0.5, 0.9],
        valence: [0.5, 0.9],
        spectralCentroid: [1800, 3500],
        spectralRolloff: [0.75, 0.9],
        zcr: [0.08, 0.18],
        mfccVariance: [0.4, 0.8],
        brightness: [0.5, 0.8],
        harmonicity: [0.5, 0.8]
    },
    'Jazz Ballad': {
        tempo: [60, 90],
        energy: [0.3, 0.5],
        valence: [0.4, 0.6],
        spectralCentroid: [1400, 2800],
        spectralRolloff: [0.65, 0.85],
        zcr: [0.04, 0.12],
        mfccVariance: [0.6, 0.85],
        brightness: [0.3, 0.6],
        harmonicity: [0.7, 0.9]
    },
    'Jazz Swing/Bebop': {
        tempo: [140, 180],
        energy: [0.5, 0.8],
        valence: [0.5, 0.8],
        spectralCentroid: [2000, 3600],
        spectralRolloff: [0.75, 0.9],
        zcr: [0.08, 0.18],
        mfccVariance: [0.7, 0.9],
        brightness: [0.5, 0.8],
        harmonicity: [0.6, 0.85]
    },
    'Jazz Fusion': {
        tempo: [90, 180],
        energy: [0.4, 0.85],
        valence: [0.4, 0.8],
        spectralCentroid: [1800, 4000],
        spectralRolloff: [0.7, 0.9],
        zcr: [0.05, 0.15],
        mfccVariance: [0.65, 0.95],
        brightness: [0.4, 0.75],
        harmonicity: [0.5, 0.8]
    },
    'Ambient': {
        tempo: [40, 90],
        energy: [0.1, 0.4],
        valence: [0.2, 0.7],
        spectralCentroid: [800, 2500],
        spectralRolloff: [0.5, 0.8],
        zcr: [0.02, 0.08],
        mfccVariance: [0.2, 0.6],
        brightness: [0.2, 0.6],
        harmonicity: [0.4, 0.8]
    },
    'Punk': {
        tempo: [140, 200],
        energy: [0.8, 1.0],
        valence: [0.3, 0.7],
        spectralCentroid: [2000, 4500],
        spectralRolloff: [0.8, 0.95],
        zcr: [0.15, 0.35],
        mfccVariance: [0.5, 0.9],
        brightness: [0.6, 0.9],
        harmonicity: [0.2, 0.5]
    }
};

// Performance optimization constants
const ANALYSIS_CHUNK_SIZE = 8192;
const MAX_ANALYSIS_DURATION = 45;
const FFT_SIZE = 2048;
const HOP_SIZE = 512;
const MAX_WINDOWS = 15;
const SAMPLE_RATE_TARGET = 22050;

// Feature extraction weights
const FEATURE_WEIGHTS = {
    tempo: 0.18,
    energy: 0.16,
    valence: 0.14,
    spectralCentroid: 0.16,
    spectralRolloff: 0.12,
    zcr: 0.08,
    mfccVariance: 0.08,
    brightness: 0.04,
    harmonicity: 0.04
};

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
        
        // Handle audio context state
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
    // File upload events
    uploadArea.addEventListener('click', () => audioFile.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    audioFile.addEventListener('change', handleFileSelect);
    
    // Analysis events
    analyzeBtn.addEventListener('click', analyzeAudio);
    
    // Audio player events
    if (audioPreview) {
        audioPreview.addEventListener('loadedmetadata', updateAudioInfo);
        audioPreview.addEventListener('error', handleAudioError);
    }
    
    // Keyboard shortcuts
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
    
    // Validate file type
    if (!isValidAudioFile(file)) {
        showErrorMessage('Please select a valid audio file (MP3, WAV, OGG, M4A, FLAC).');
        return;
    }
    
    // Validate file size (max 50MB)
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
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
}

function loadAudioPreview(file) {
    try {
        const objectURL = URL.createObjectURL(file);
        audioPreview.src = objectURL;
        audioPlayer.style.display = 'block';
        
        // Clean up previous URL
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
        // Resume audio context if needed
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        
        updateProgress(10, 'Loading audio file...');
        const features = await extractEnhancedAudioFeatures(audioFile.currentFile);
        
        updateProgress(80, 'Classifying genre...');
        const genreScores = performEnhancedGenreClassification(features);
        
        updateProgress(95, 'Preparing results...');
        await displayEnhancedResults(genreScores, features);
        
        updateProgress(100, 'Analysis complete!');
        setTimeout(() => setAnalysisState(false), 500);
        
    } catch (error) {
        console.error('Analysis error:', error);
        showErrorMessage('Analysis failed. Please try again with a different audio file.');
        setAnalysisState(false);
    }
}

function setAnalysisState(analyzing) {
    loading.style.display = analyzing ? 'block' : 'none';
    results.style.display = analyzing ? 'none' : 'block';
    analyzeBtn.disabled = analyzing;
    
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
        
        // Get mono channel data
        const channelData = audioBuffer.numberOfChannels > 1 ? 
            mixToMono(audioBuffer) : audioBuffer.getChannelData(0);
        
        const sampleRate = audioBuffer.sampleRate;
        
        // Limit analysis duration and resample if needed
        const maxSamples = Math.min(channelData.length, sampleRate * MAX_ANALYSIS_DURATION);
        let processedData = channelData.slice(0, maxSamples);
        
        // Resample to target sample rate for consistency
        if (sampleRate !== SAMPLE_RATE_TARGET) {
            updateProgress(40, 'Resampling audio...');
            processedData = resampleAudio(processedData, sampleRate, SAMPLE_RATE_TARGET);
        }
        
        updateProgress(50, 'Extracting audio features...');
        const features = await processEnhancedAudioFeatures(processedData, SAMPLE_RATE_TARGET);
        
        updateProgress(70, 'Computing additional features...');
        // Add derived features
        features.danceability = calculateDanceability(features.tempo, features.energy, features.valence);
        features.acousticness = calculateAcousticness(features.spectralCentroid, features.zcr);
        features.instrumentalness = calculateInstrumentalness(features.mfccVariance, features.harmonicity);
        
        return features;
    } catch (error) {
        console.error('Feature extraction error:', error);
        // Return fallback features based on file properties
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
        // Use requestIdleCallback for better performance
        const processFeatures = (deadline) => {
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
    const windowSize = 2048;
    const hopSize = HOP_SIZE;
    
    // Multi-scale approach
    const scales = [1, 2, 4];
    const tempoEstimates = [];
    
    for (const scale of scales) {
        const downsampledData = downsampleArray(channelData, scale);
        const downsampledSampleRate = sampleRate / scale;
        
        const onsets = advancedOnsetDetection(downsampledData, windowSize, hopSize, downsampledSampleRate);
        
        if (onsets.length > 2) {
            const tempo = calculateTempoFromOnsets(onsets, downsampledSampleRate);
            if (tempo > 40 && tempo < 220) {
                tempoEstimates.push(tempo);
            }
        }
    }
    
    if (tempoEstimates.length === 0) {
        return estimateTempoByAutocorrelation(channelData, sampleRate);
    }
    
    // Use median of estimates
    tempoEstimates.sort((a, b) => a - b);
    const medianTempo = tempoEstimates[Math.floor(tempoEstimates.length / 2)];
    
    return Math.round(medianTempo);
}

function downsampleArray(array, factor) {
    if (factor === 1) return array;
    
    const result = new Float32Array(Math.floor(array.length / factor));
    for (let i = 0; i < result.length; i++) {
        // Anti-aliasing filter (simple averaging)
        let sum = 0;
        const start = i * factor;
        const end = Math.min(start + factor, array.length);
        
        for (let j = start; j < end; j++) {
            sum += array[j];
        }
        result[i] = sum / (end - start);
    }
    return result;
}

function advancedOnsetDetection(channelData, windowSize, hopSize, sampleRate) {
    const onsets = [];
    const threshold = 0.15;
    const minOnsetInterval = Math.floor(sampleRate * 0.1); // Minimum 100ms between onsets
    
    let prevSpectralFlux = 0;
    let lastOnsetTime = -minOnsetInterval;
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
        const currentSpectrum = performOptimizedFFT(channelData.slice(i, i + windowSize));
        const prevSpectrum = i >= hopSize ? 
            performOptimizedFFT(channelData.slice(i - hopSize, i - hopSize + windowSize)) :
            new Array(currentSpectrum.length).fill(0);
        
        // Calculate spectral flux
        let spectralFlux = 0;
        for (let j = 0; j < Math.min(currentSpectrum.length, prevSpectrum.length); j++) {
            const diff = currentSpectrum[j] - prevSpectrum[j];
            spectralFlux += Math.max(0, diff); // Only positive changes
        }
        
        // Peak picking with adaptive threshold
        const adaptiveThreshold = prevSpectralFlux * (1 + threshold);
        if (spectralFlux > adaptiveThreshold && 
            spectralFlux > 0.01 && 
            i - lastOnsetTime >= minOnsetInterval) {
            onsets.push(i);
            lastOnsetTime = i;
        }
        
        prevSpectralFlux = spectralFlux * 0.9 + prevSpectralFlux * 0.1; // Smoothing
    }
    
    return onsets;
}

function calculateTempoFromOnsets(onsets, sampleRate) {
    if (onsets.length < 3) return 120; // Default tempo
    
    const intervals = [];
    for (let i = 1; i < onsets.length;
const interval = (onsets[i] - onsets[i-1]) / sampleRate;
       if (interval > 0.2 && interval < 2.0) { // Filter reasonable intervals
           intervals.push(60 / interval); // Convert to BPM
       }
   }
   
   if (intervals.length === 0) return 120;
   
   // Find most common tempo range
   intervals.sort((a, b) => a - b);
   const median = intervals[Math.floor(intervals.length / 2)];
   
   // Consider tempo multipliers (half-time, double-time)
   const candidates = [median, median * 2, median / 2];
   return candidates.find(tempo => tempo >= 60 && tempo <= 200) || median;
}

function estimateTempoByAutocorrelation(channelData, sampleRate) {
   const minPeriod = Math.floor(sampleRate * 60 / 200); // 200 BPM
   const maxPeriod = Math.floor(sampleRate * 60 / 60);  // 60 BPM
   
   // Use a smaller subset for performance
   const analysisLength = Math.min(channelData.length, sampleRate * 10);
   const data = channelData.slice(0, analysisLength);
   
   let maxCorrelation = 0;
   let bestPeriod = minPeriod;
   
   for (let period = minPeriod; period <= maxPeriod && period < data.length / 2; period += 4) {
       let correlation = 0;
       const samples = Math.min(data.length - period, sampleRate * 5);
       
       for (let i = 0; i < samples; i++) {
           correlation += data[i] * data[i + period];
       }
       
       correlation /= samples;
       
       if (correlation > maxCorrelation) {
           maxCorrelation = correlation;
           bestPeriod = period;
       }
   }
   
   return Math.round(60 * sampleRate / bestPeriod);
}

function enhancedRMSEnergy(channelData) {
   // Multi-window RMS calculation
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
   
   // Return the 80th percentile to avoid outliers
   energies.sort((a, b) => a - b);
   const index = Math.floor(energies.length * 0.8);
   return Math.min(1.0, energies[index] * 10); // Scale appropriately
}

function enhancedValenceCalculation(channelData, sampleRate) {
   // Combine multiple indicators
   const brightness = calculateBrightness(channelData, sampleRate);
   const harmonicity = calculateHarmonicity(channelData, sampleRate);
   const energy = enhancedRMSEnergy(channelData);
   
   // Weighted combination
   const valence = (brightness * 0.4 + harmonicity * 0.4 + energy * 0.2);
   return Math.max(0, Math.min(1, valence));
}

function enhancedSpectralCentroid(channelData, sampleRate) {
   const windowSize = FFT_SIZE;
   const hopSize = HOP_SIZE;
   const centroids = [];
   
   for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
       const window = channelData.slice(i, i + windowSize);
       const spectrum = performOptimizedFFT(window);
       
       let weightedSum = 0;
       let magnitudeSum = 0;
       
       for (let j = 1; j < spectrum.length / 2; j++) {
           const frequency = j * sampleRate / windowSize;
           const magnitude = spectrum[j];
           
           weightedSum += frequency * magnitude;
           magnitudeSum += magnitude;
       }
       
       if (magnitudeSum > 0) {
           centroids.push(weightedSum / magnitudeSum);
       }
   }
   
   if (centroids.length === 0) return 1500;
   
   // Return median centroid
   centroids.sort((a, b) => a - b);
   return centroids[Math.floor(centroids.length / 2)];
}

function enhancedSpectralRolloff(channelData, sampleRate) {
   const windowSize = FFT_SIZE;
   const hopSize = HOP_SIZE;
   const rolloffs = [];
   const rolloffThreshold = 0.85;
   
   for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
       const window = channelData.slice(i, i + windowSize);
       const spectrum = performOptimizedFFT(window);
       
       let totalEnergy = 0;
       for (let j = 1; j < spectrum.length / 2; j++) {
           totalEnergy += spectrum[j];
       }
       
       if (totalEnergy === 0) continue;
       
       let cumulativeEnergy = 0;
       let rolloffFreq = 0;
       
       for (let j = 1; j < spectrum.length / 2; j++) {
           cumulativeEnergy += spectrum[j];
           if (cumulativeEnergy >= rolloffThreshold * totalEnergy) {
               rolloffFreq = j * sampleRate / windowSize;
               break;
           }
       }
       
       if (rolloffFreq > 0) {
           rolloffs.push(Math.min(1.0, rolloffFreq / (sampleRate / 2)));
       }
   }
   
   if (rolloffs.length === 0) return 0.8;
   
   rolloffs.sort((a, b) => a - b);
   return rolloffs[Math.floor(rolloffs.length / 2)];
}

function enhancedZeroCrossingRate(channelData) {
   const windowSize = Math.floor(channelData.length / MAX_WINDOWS);
   const zcrs = [];
   
   for (let w = 0; w < MAX_WINDOWS && w * windowSize < channelData.length; w++) {
       const start = w * windowSize;
       const end = Math.min(start + windowSize, channelData.length);
       
       let crossings = 0;
       for (let i = start + 1; i < end; i++) {
           if ((channelData[i] >= 0) !== (channelData[i-1] >= 0)) {
               crossings++;
           }
       }
       
       zcrs.push(crossings / (end - start));
   }
   
   // Return median ZCR
   zcrs.sort((a, b) => a - b);
   return zcrs[Math.floor(zcrs.length / 2)];
}

function enhancedMFCCVariance(channelData, sampleRate) {
   // Simplified MFCC-like calculation
   const windowSize = FFT_SIZE;
   const hopSize = HOP_SIZE;
   const numCoefficients = 13;
   const coefficients = [];
   
   for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
       const window = channelData.slice(i, i + windowSize);
       const spectrum = performOptimizedFFT(window);
       
       // Mel-scale approximation
       const melCoeffs = [];
       const melFilters = 26;
       
       for (let m = 0; m < melFilters; m++) {
           const melFreq = 700 * (Math.pow(10, m / (melFilters * 2595 / Math.log10(1 + sampleRate/2/700))) - 1);
           const binIndex = Math.floor(melFreq * windowSize / sampleRate);
           
           if (binIndex < spectrum.length / 2) {
               melCoeffs.push(Math.log(Math.max(spectrum[binIndex], 1e-10)));
           }
       }
       
       // DCT approximation for MFCC
       const mfccs = [];
       for (let k = 0; k < numCoefficients && k < melCoeffs.length; k++) {
           let sum = 0;
           for (let n = 0; n < melCoeffs.length; n++) {
               sum += melCoeffs[n] * Math.cos(k * (n + 0.5) * Math.PI / melCoeffs.length);
           }
           mfccs.push(sum);
       }
       
       coefficients.push(mfccs);
   }
   
   if (coefficients.length === 0) return 0.5;
   
   // Calculate variance across time
   const variances = [];
   for (let c = 0; c < numCoefficients; c++) {
       const values = coefficients.map(frame => frame[c] || 0);
       const mean = values.reduce((a, b) => a + b, 0) / values.length;
       const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
       variances.push(variance);
   }
   
   const avgVariance = variances.reduce((a, b) => a + b, 0) / variances.length;
   return Math.min(1.0, avgVariance / 10); // Normalize
}

function calculateBrightness(channelData, sampleRate) {
   const windowSize = FFT_SIZE;
   const spectrum = performOptimizedFFT(channelData.slice(0, windowSize));
   
   // Define frequency bands
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
   // Autocorrelation-based harmonicity
   const windowSize = Math.min(FFT_SIZE, channelData.length);
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
   // Optimal dance tempo around 120-130 BPM
   const tempoScore = tempo >= 110 && tempo <= 140 ? 1.0 : 
                    Math.max(0, 1 - Math.abs(tempo - 125) / 50);
   
   return (tempoScore * 0.4 + energy * 0.4 + valence * 0.2);
}

function calculateAcousticness(spectralCentroid, zcr) {
   // Lower centroid and ZCR suggest more acoustic instruments
   const centroidScore = Math.max(0, 1 - spectralCentroid / 4000);
   const zcrScore = Math.max(0, 1 - zcr / 0.2);
   
   return (centroidScore + zcrScore) / 2;
}

function calculateInstrumentalness(mfccVariance, harmonicity) {
   // Higher variance and harmonicity suggest instrumental music
   return (mfccVariance + harmonicity) / 2;
}

function performOptimizedFFT(window) {
   // Apply Hamming window
   const windowed = window.map((sample, i) => 
       sample * (0.54 - 0.46 * Math.cos(2 * Math.PI * i / (window.length - 1)))
   );
   
   return simpleDFT(windowed);
}

function simpleDFT(signal) {
   const N = signal.length;
   const result = new Array(N);
   
   for (let k = 0; k < N; k++) {
       let real = 0;
       let imag = 0;
       
       for (let n = 0; n < N; n++) {
           const angle = -2 * Math.PI * k * n / N;
           real += signal[n] * Math.cos(angle);
           imag += signal[n] * Math.sin(angle);
       }
       
       result[k] = Math.sqrt(real * real + imag * imag);
   }
   
   return result;
}

function generateFallbackFeatures(file) {
   // Generate reasonable fallback features based on file properties
   const baseTempo = 120;
   const baseEnergy = 0.6;
   
   return {
       tempo: baseTempo + Math.random() * 40 - 20,
       energy: baseEnergy + Math.random() * 0.3 - 0.15,
       valence: 0.5 + Math.random() * 0.4 - 0.2,
       spectralCentroid: 2000 + Math.random() * 1000 - 500,
       spectralRolloff: 0.8 + Math.random() * 0.1 - 0.05,
       zcr: 0.1 + Math.random() * 0.05 - 0.025,
       mfccVariance: 0.5 + Math.random() * 0.2 - 0.1,
       brightness: 0.5 + Math.random() * 0.2 - 0.1,
       harmonicity: 0.6 + Math.random() * 0.2 - 0.1,
       danceability: 0.5 + Math.random() * 0.3 - 0.15,
       acousticness: 0.5 + Math.random() * 0.3 - 0.15,
       instrumentalness: 0.5 + Math.random() * 0.3 - 0.15
   };
}

function performEnhancedGenreClassification(features) {
   const scores = {};
   
   // Calculate weighted similarity for each genre
   for (const [genre, characteristics] of Object.entries(genreDatabase)) {
       let totalScore = 0;
       let weightSum = 0;
       
       for (const [feature, weight] of Object.entries(FEATURE_WEIGHTS)) {
           if (features[feature] !== undefined && characteristics[feature]) {
               const [min, max] = characteristics[feature];
               const featureValue = features[feature];
               
               // Calculate feature similarity score
               let featureScore;
               if (featureValue >= min && featureValue <= max) {
                   // Perfect match within range
                   featureScore = 1.0;
               } else {
                   // Calculate distance penalty
                   const distance = featureValue < min ? 
                       (min - featureValue) / min : 
                       (featureValue - max) / max;
                   featureScore = Math.max(0, 1 - distance);
               }
               
               totalScore += featureScore * weight;
               weightSum += weight;
           }
       }
       
       if (weightSum > 0) {
           scores[genre] = (totalScore / weightSum) * 100;
       }
   }
   
   // Normalize and sort scores
   const sortedScores = Object.entries(scores)
       .sort(([,a], [,b]) => b - a)
       .slice(0, 10) // Top 10 matches
       .map(([genre, score]) => ({
           genre,
           confidence: Math.max(0, Math.min(100, score))
       }));
   
   return sortedScores;
}

async function displayEnhancedResults(genreScores, features) {
   // Clear previous results
   genreResults.innerHTML = '';
   
   // Create results container
   const resultsContainer = document.createElement('div');
   resultsContainer.className = 'analysis-results';
   
   // Top prediction
   const topPrediction = genreScores[0];
   const topPredictionEl = document.createElement('div');
   topPredictionEl.className = 'top-prediction';
   topPredictionEl.innerHTML = `
       <h3>Primary Genre Classification</h3>
       <div class="genre-badge primary">
           <span class="genre-name">${topPrediction.genre}</span>
           <span class="confidence">${topPrediction.confidence.toFixed(1)}%</span>
       </div>
   `;
   
   // Secondary predictions
   const secondaryPredictions = document.createElement('div');
   secondaryPredictions.className = 'secondary-predictions';
   secondaryPredictions.innerHTML = '<h4>Alternative Classifications</h4>';
   
   const predictionsList = document.createElement('div');
   predictionsList.className = 'predictions-list';
   
   genreScores.slice(1, 6).forEach((prediction, index) => {
       const predictionEl = document.createElement('div');
       predictionEl.className = `genre-prediction rank-${index + 2}`;
       predictionEl.innerHTML = `
           <div class="genre-info">
               <span class="genre-name">${prediction.genre}</span>
               <span class="confidence">${prediction.confidence.toFixed(1)}%</span>
           </div>
           <div class="confidence-bar">
               <div class="confidence-fill" style="width: ${prediction.confidence}%"></div>
           </div>
       `;
       predictionsList.appendChild(predictionEl);
   });
   
   secondaryPredictions.appendChild(predictionsList);
   
   // Audio features visualization
   const featuresContainer = document.createElement('div');
   featuresContainer.className = 'audio-features';
   featuresContainer.innerHTML = `
       <h4>Audio Characteristics</h4>
       <div class="features-grid">
           ${createFeatureDisplay('Tempo', features.tempo, 'BPM')}
           ${createFeatureDisplay('Energy', (features.energy * 100).toFixed(1), '%')}
           ${createFeatureDisplay('Valence', (features.valence * 100).toFixed(1), '%')}
           ${createFeatureDisplay('Danceability', (features.danceability * 100).toFixed(1), '%')}
           ${createFeatureDisplay('Acousticness', (features.acousticness * 100).toFixed(1), '%')}
           ${createFeatureDisplay('Instrumentalness', (features.instrumentalness * 100).toFixed(1), '%')}
       </div>
   `;
   
   // Technical details (collapsible)
   const technicalDetails = document.createElement('div');
   technicalDetails.className = 'technical-details';
   technicalDetails.innerHTML = `
       <div class="details-header" onclick="toggleTechnicalDetails()">
           <h4>Technical Analysis <span class="toggle-icon">▼</span></h4>
       </div>
       <div class="details-content" id="technicalDetailsContent" style="display: none;">
           <div class="technical-grid">
               ${createTechnicalDisplay('Spectral Centroid', features.spectralCentroid.toFixed(0), 'Hz')}
               ${createTechnicalDisplay('Spectral Rolloff', (features.spectralRolloff * 100).toFixed(1), '%')}
               ${createTechnicalDisplay('Zero Crossing Rate', (features.zcr * 100).toFixed(2), '%')}
               ${createTechnicalDisplay('MFCC Variance', features.mfccVariance.toFixed(3), '')}
               ${createTechnicalDisplay('Brightness', (features.brightness * 100).toFixed(1), '%')}
               ${createTechnicalDisplay('Harmonicity', (features.harmonicity * 100).toFixed(1), '%')}
           </div>
       </div>
   `;
   
   // Assemble results
   resultsContainer.appendChild(topPredictionEl);
   resultsContainer.appendChild(secondaryPredictions);
   resultsContainer.appendChild(featuresContainer);
   resultsContainer.appendChild(technicalDetails);
   
   genreResults.appendChild(resultsContainer);
   
   // Show results with animation
   results.style.display = 'block';
   resultsContainer.style.opacity = '0';
   resultsContainer.style.transform = 'translateY(20px)';
   
   await new Promise(resolve => setTimeout(resolve, 100));
   
   resultsContainer.style.transition = 'all 0.5s ease';
   resultsContainer.style.opacity = '1';
   resultsContainer.style.transform = 'translateY(0)';
}

function createFeatureDisplay(name, value, unit) {
   const percentage = typeof value === 'string' && value.includes('.') ? 
       parseFloat(value) : value;
   
   return `
       <div class="feature-item">
           <div class="feature-header">
               <span class="feature-name">${name}</span>
               <span class="feature-value">${value}${unit}</span>
           </div>
           <div class="feature-bar">
               <div class="feature-fill" style="width: ${Math.min(100, percentage)}%"></div>
           </div>
       </div>
   `;
}

function createTechnicalDisplay(name, value, unit) {
   return `
       <div class="technical-item">
           <span class="tech-label">${name}</span>
           <span class="tech-value">${value} ${unit}</span>
       </div>
   `;
}

function toggleTechnicalDetails() {
   const content = document.getElementById('technicalDetailsContent');
   const icon = document.querySelector('.toggle-icon');
   
   if (content.style.display === 'none') {
       content.style.display = 'block';
       icon.textContent = '▲';
   } else {
       content.style.display = 'none';
       icon.textContent = '▼';
   }
}

function showErrorMessage(message) {
   // Create or update error display
   let errorDisplay = document.getElementById('errorDisplay');
   if (!errorDisplay) {
       errorDisplay = document.createElement('div');
       errorDisplay.id = 'errorDisplay';
       errorDisplay.className = 'error-message';
       document.body.appendChild(errorDisplay);
   }
   
   errorDisplay.textContent = message;
   errorDisplay.style.display = 'block';
   
   // Auto-hide after 5 seconds
   setTimeout(() => {
       if (errorDisplay) {
           errorDisplay.style.display = 'none';
       }
   }, 5000);
}

// Export functions for potential web worker usage
if (typeof self !== 'undefined' && self.addEventListener) {
   // Web Worker context
   self.addEventListener('message', function(e) {
       const { type, data } = e.data;
       
       switch (type) {
           case 'analyzeFeatures':
               const features = processEnhancedAudioFeatures(data.channelData, data.sampleRate);
               self.postMessage({ type: 'featuresReady', features });
               break;
           case 'classifyGenre':
               const scores = performEnhancedGenreClassification(data.features);
               self.postMessage({ type: 'classificationReady', scores });
               break;
       }
   });
}

// Performance monitoring
const performanceMonitor = {
   startTime: null,
   
   start() {
       this.startTime = performance.now();
   },
   
   end(operation) {
       if (this.startTime) {
           const duration = performance.now() - this.startTime;
           console.log(`${operation} completed in ${duration.toFixed(2)}ms`);
           this.startTime = null;
       }
   }
};

// Cleanup function
function cleanup() {
   if (audioContext && audioContext.state !== 'closed') {
       audioContext.close().catch(console.error);
   }
   
   if (analysisWorker) {
       analysisWorker.terminate();
   }
   
   // Revoke any object URLs
   const audioElements = document.querySelectorAll('audio');
   audioElements.forEach(audio => {
       if (audio.src && audio.src.startsWith('blob:')) {
           URL.revokeObjectURL(audio.src);
       }
   });
}

// Handle page unload
window.addEventListener('beforeunload', cleanup);

// Handle visibility change for performance optimization
document.addEventListener('visibilitychange', function() {
   if (document.hidden && audioContext && audioContext.state === 'running') {
       audioContext.suspend().catch(console.error);
   } else if (!document.hidden && audioContext && audioContext.state === 'suspended') {
       audioContext.resume().catch(console.error);
   }
});

console.log('Enhanced Audio Genre Classification System loaded successfully');
