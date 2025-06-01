/**
 * AI Music Genre Detector - Fixed Version
 * Main JavaScript functionality for music genre detection with consistent results
 */

class MusicGenreDetector {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.cachedFeatures = null; // Cache features for consistency
        this.cachedResults = null;  // Cache results for consistency
        this.setupEventListeners();
        
        // Expanded and more specific genres
        this.genres = [
            // Electronic sub-genres
            'House', 'Techno', 'Dubstep', 'Trance', 'Drum & Bass',
            // Rock sub-genres
            'Alternative Rock', 'Punk Rock', 'Heavy Metal', 'Indie Rock', 'Grunge',
            // Hip-Hop sub-genres
            'Hip-Hop', 'Trap', 'Rap', 'Lo-Fi Hip-Hop',
            // Pop variants
            'Pop', 'Electropop', 'K-Pop', 'Indie Pop',
            // Traditional genres
            'Jazz', 'Blues', 'Classical', 'Country', 'Folk',
            // Other genres
            'R&B', 'Soul', 'Funk', 'Reggae', 'Latin', 'World Music',
            'Ambient', 'Post-Rock', 'Shoegaze', 'Synthwave'
        ];
    }

    /**
     * Set up all event listeners for the application
     */
    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('audioFile');
        const analyzeBtn = document.getElementById('analyzeBtn');

        // Upload area click
        uploadArea.addEventListener('click', () => fileInput.click());

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Analyze button
        analyzeBtn.addEventListener('click', () => {
            this.analyzeGenre();
        });
    }

    /**
     * Handle file upload and validation
     * @param {File} file - The uploaded audio file
     */
    handleFileUpload(file) {
        if (!file.type.startsWith('audio/')) {
            alert('Mohon upload file audio yang valid!');
            return;
        }

        // Reset cache when new file is uploaded
        this.cachedFeatures = null;
        this.cachedResults = null;

        // Update UI
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
        
        const audioPreview = document.getElementById('audioPreview');
        audioPreview.src = URL.createObjectURL(file);
        
        document.getElementById('audioPlayer').style.display = 'block';
        document.getElementById('analyzeBtn').disabled = false;
        document.getElementById('results').style.display = 'none';

        // Load audio for analysis
        this.loadAudioFile(file);
    }

    /**
     * Format file size in human readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Load and decode audio file for analysis
     * @param {File} file - The audio file to load
     */
    async loadAudioFile(file) {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.error('Error loading audio:', error);
            alert('Error loading audio file. Please try another file.');
        }
    }

    /**
     * Main function to analyze genre
     */
    async analyzeGenre() {
        if (!this.audioBuffer) {
            alert('Mohon upload file audio terlebih dahulu!');
            return;
        }

        // Return cached results if available
        if (this.cachedResults && this.cachedFeatures) {
            this.displayResults(this.cachedResults, this.cachedFeatures);
            return;
        }

        // Show loading
        document.getElementById('loading').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        document.getElementById('analyzeBtn').disabled = true;

        // Simulate AI analysis
        await this.simulateAnalysis();

        // Extract audio features (cached for consistency)
        if (!this.cachedFeatures) {
            this.cachedFeatures = this.extractAudioFeatures();
        }

        // Generate genre predictions based on features (cached for consistency)
        if (!this.cachedResults) {
            this.cachedResults = this.generateGenrePredictions(this.cachedFeatures);
        }

        // Display results
        this.displayResults(this.cachedResults, this.cachedFeatures);

        // Hide loading
        document.getElementById('loading').style.display = 'none';
        document.getElementById('analyzeBtn').disabled = false;
    }

    /**
     * Simulate AI processing time
     */
    async simulateAnalysis() {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    /**
     * Generate a consistent hash from audio buffer for deterministic results
     * @returns {number} Consistent hash value
     */
    generateAudioHash() {
        const channelData = this.audioBuffer.getChannelData(0);
        let hash = 0;
        
        // Sample every 1000th sample for consistency
        for (let i = 0; i < channelData.length; i += 1000) {
            const sample = Math.round(channelData[i] * 1000000);
            hash = ((hash << 5) - hash + sample) & 0xffffffff;
        }
        
        return Math.abs(hash);
    }

    /**
     * Extract audio features from the loaded audio buffer
     * @returns {Object} Extracted audio features
     */
    extractAudioFeatures() {
        const channelData = this.audioBuffer.getChannelData(0);
        const sampleRate = this.audioBuffer.sampleRate;
        const duration = this.audioBuffer.duration;
        const audioHash = this.generateAudioHash();

        // Use hash for consistent pseudo-random values
        const seededRandom = (seed) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        // Calculate more stable features
        const tempo = this.estimateTempoStable(channelData, sampleRate, audioHash);
        const energy = this.calculateEnergyStable(channelData);
        const spectralFeatures = this.calculateSpectralFeaturesStable(channelData, audioHash);
        const valence = spectralFeatures.brightness;
        const danceability = this.calculateDanceabilityStable(tempo, energy);

        return {
            tempo: Math.round(tempo),
            energy: Math.round(energy * 100),
            valence: Math.round(valence * 100),
            danceability: Math.round(danceability * 100),
            duration,
            audioHash
        };
    }

    /**
     * Stable tempo estimation
     * @param {Float32Array} channelData - Audio channel data
     * @param {number} sampleRate - Audio sample rate
     * @param {number} seed - Seed for consistency
     * @returns {number} Estimated tempo in BPM
     */
    estimateTempoStable(channelData, sampleRate, seed) {
        // More stable tempo estimation
        const windowSize = 2048;
        const hopSize = 1024;
        let energyPeaks = [];

        // Calculate energy in windows
        for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
            const window = channelData.slice(i, i + windowSize);
            const rms = Math.sqrt(window.reduce((sum, val) => sum + val * val, 0) / windowSize);
            energyPeaks.push(rms);
        }

        // Find average energy and use it for tempo estimation
        const avgEnergy = energyPeaks.reduce((sum, val) => sum + val, 0) / energyPeaks.length;
        const normalizedEnergy = Math.min(1, avgEnergy * 10);
        
        // Use hash-based calculation for consistency
        const baseValue = (seed % 1000) / 1000;
        const tempoMultiplier = 0.6 + (normalizedEnergy * 0.8);
        const estimatedTempo = 60 + (baseValue * 120) * tempoMultiplier;
        
        return Math.max(60, Math.min(200, estimatedTempo));
    }

    /**
     * Stable energy calculation
     * @param {Float32Array} channelData - Audio channel data
     * @returns {number} Energy level (0-1)
     */
    calculateEnergyStable(channelData) {
        const rms = Math.sqrt(channelData.reduce((sum, val) => sum + val * val, 0) / channelData.length);
        return Math.min(1, rms * 5); // Normalize and cap at 1
    }

    /**
     * Stable spectral features calculation
     * @param {Float32Array} channelData - Audio channel data
     * @param {number} seed - Seed for consistency
     * @returns {Object} Spectral features
     */
    calculateSpectralFeaturesStable(channelData, seed) {
        // Simplified but stable spectral analysis
        const sampleSize = Math.min(4096, channelData.length);
        const samples = channelData.slice(0, sampleSize);
        
        // Calculate zero crossing rate
        let zeroCrossings = 0;
        for (let i = 1; i < samples.length; i++) {
            if ((samples[i] >= 0) !== (samples[i - 1] >= 0)) {
                zeroCrossings++;
            }
        }
        
        const zcr = zeroCrossings / samples.length;
        const brightness = Math.min(1, zcr * 2); // Normalize
        
        return {
            brightness: brightness
        };
    }

    /**
     * Stable danceability calculation
     * @param {number} tempo - Tempo in BPM
     * @param {number} energy - Energy level
     * @returns {number} Danceability score (0-1)
     */
    calculateDanceabilityStable(tempo, energy) {
        const idealTempo = 120;
        const tempoScore = 1 - Math.abs(tempo - idealTempo) / idealTempo;
        const normalizedTempoScore = Math.max(0, Math.min(1, tempoScore));
        
        return (normalizedTempoScore * 0.6) + (energy * 0.4);
    }

    /**
     * Generate genre predictions based on extracted features (deterministic)
     * @param {Object} features - Extracted audio features
     * @returns {Array} Array of genre predictions with confidence scores
     */
    generateGenrePredictions(features) {
        const predictions = [];
        const { audioHash } = features;

        // Generate consistent pseudo-random values based on audio hash
        const seededRandom = (genre, seed) => {
            let hash = 0;
            const str = genre + seed.toString();
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash % 1000) / 1000;
        };

        this.genres.forEach(genre => {
            // Consistent base confidence using audio hash
            let confidence = seededRandom(genre, audioHash) * 0.1 + 0.05;

            // Rule-based classification (deterministic)
            switch (genre) {
                case 'House':
                    if (features.tempo >= 120 && features.tempo <= 130 && features.danceability > 70) confidence += 0.6;
                    break;
                case 'Techno':
                    if (features.tempo >= 130 && features.tempo <= 150 && features.energy > 75) confidence += 0.65;
                    break;
                case 'Dubstep':
                    if (features.tempo >= 140 && features.tempo <= 150 && features.energy > 80) confidence += 0.55;
                    break;
                case 'Trance':
                    if (features.tempo >= 125 && features.tempo <= 140 && features.valence > 60) confidence += 0.5;
                    break;
                case 'Drum & Bass':
                    if (features.tempo >= 160 && features.tempo <= 180 && features.energy > 70) confidence += 0.6;
                    break;
                case 'Alternative Rock':
                    if (features.tempo >= 100 && features.tempo <= 140 && features.energy > 60 && features.energy < 85) confidence += 0.5;
                    break;
                case 'Punk Rock':
                    if (features.tempo >= 140 && features.tempo <= 180 && features.energy > 80) confidence += 0.55;
                    break;
                case 'Heavy Metal':
                    if (features.tempo >= 120 && features.tempo <= 160 && features.energy > 85) confidence += 0.6;
                    break;
                case 'Hip-Hop':
                    if (features.tempo >= 70 && features.tempo <= 100 && features.energy > 50) confidence += 0.5;
                    break;
                case 'Trap':
                    if (features.tempo >= 120 && features.tempo <= 160 && features.energy > 60) confidence += 0.55;
                    break;
                case 'Pop':
                    if (features.tempo >= 100 && features.tempo <= 130 && features.danceability > 60 && features.valence > 50) confidence += 0.45;
                    break;
                case 'Jazz':
                    if (features.tempo >= 80 && features.tempo <= 160 && features.valence > 50 && features.energy < 70) confidence += 0.45;
                    break;
                case 'Classical':
                    if (features.energy < 50 && features.valence > 60 && features.danceability < 40) confidence += 0.5;
                    break;
                case 'Ambient':
                    if (features.tempo < 80 && features.energy < 30 && features.valence > 40) confidence += 0.5;
                    break;
                default:
                    // Use consistent pseudo-random value instead of Math.random()
                    confidence += seededRandom(genre + 'default', audioHash) * 0.2;
            }

            predictions.push({
                genre,
                confidence: Math.min(0.95, confidence)
            });
        });

        // Sort by confidence and return top 6
        return predictions.sort((a, b) => b.confidence - a.confidence).slice(0, 6);
    }

    /**
     * Display analysis results in the UI
     * @param {Array} predictions - Genre predictions
     * @param {Object} features - Extracted features
     */
    displayResults(predictions, features) {
        const resultsContainer = document.getElementById('genreResults');
        resultsContainer.innerHTML = '';

        predictions.forEach((prediction, index) => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'genre-result';
            
            const confidence = Math.round(prediction.confidence * 100);
            
            resultDiv.innerHTML = `
                <div class="genre-name">${prediction.genre}</div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidence}%"></div>
                </div>
                <div class="confidence-percent">${confidence}%</div>
            `;
            
            resultsContainer.appendChild(resultDiv);
        });

        // Update feature displays
        document.getElementById('tempo').textContent = features.tempo;
        document.getElementById('energy').textContent = features.energy + '%';
        document.getElementById('valence').textContent = features.valence + '%';
        document.getElementById('danceability').textContent = features.danceability + '%';

        document.getElementById('results').style.display = 'block';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MusicGenreDetector();
});
