/**
 * AI Music Genre Detector
 * Main JavaScript functionality for music genre detection
 */

class MusicGenreDetector {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.setupEventListeners();
        this.genres = [
            'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 
            'Classical', 'R&B', 'Country', 'Reggae', 'Blues'
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

        // Show loading
        document.getElementById('loading').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        document.getElementById('analyzeBtn').disabled = true;

        // Simulate AI analysis
        await this.simulateAnalysis();

        // Extract audio features
        const features = this.extractAudioFeatures();

        // Generate genre predictions based on features
        const predictions = this.generateGenrePredictions(features);

        // Display results
        this.displayResults(predictions, features);

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
     * Extract audio features from the loaded audio buffer
     * @returns {Object} Extracted audio features
     */
    extractAudioFeatures() {
        const channelData = this.audioBuffer.getChannelData(0);
        const sampleRate = this.audioBuffer.sampleRate;
        const duration = this.audioBuffer.duration;

        // Calculate basic features
        const tempo = this.estimateTempo(channelData, sampleRate);
        const energy = this.calculateEnergy(channelData);
        const spectralFeatures = this.calculateSpectralFeatures(channelData);
        const valence = spectralFeatures.brightness;
        const danceability = this.calculateDanceability(tempo, energy);

        return {
            tempo: Math.round(tempo),
            energy: Math.round(energy * 100),
            valence: Math.round(valence * 100),
            danceability: Math.round(danceability * 100),
            duration
        };
    }

    /**
     * Estimate tempo (BPM) from audio data
     * @param {Float32Array} channelData - Audio channel data
     * @param {number} sampleRate - Audio sample rate
     * @returns {number} Estimated tempo in BPM
     */
    estimateTempo(channelData, sampleRate) {
        // Simple tempo estimation based on zero crossings and energy peaks
        const windowSize = 1024;
        const hopSize = 512;
        let peaks = [];

        for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
            const window = channelData.slice(i, i + windowSize);
            const energy = window.reduce((sum, val) => sum + val * val, 0);
            peaks.push(energy);
        }

        // Find average interval between peaks
        const avgInterval = peaks.length / (channelData.length / sampleRate);
        const estimatedTempo = 60 / (avgInterval * hopSize / sampleRate) * 4;
        
        return Math.max(60, Math.min(200, estimatedTempo));
    }

    /**
     * Calculate energy level of the audio
     * @param {Float32Array} channelData - Audio channel data
     * @returns {number} Energy level (0-1)
     */
    calculateEnergy(channelData) {
        const energy = channelData.reduce((sum, val) => sum + val * val, 0) / channelData.length;
        return Math.sqrt(energy);
    }

    /**
     * Calculate spectral features
     * @param {Float32Array} channelData - Audio channel data
     * @returns {Object} Spectral features
     */
    calculateSpectralFeatures(channelData) {
        // Simple spectral analysis
        const fftSize = 2048;
        const fft = this.simpleFFT(channelData.slice(0, fftSize));
        
        let spectralCentroid = 0;
        let totalMagnitude = 0;

        for (let i = 0; i < fft.length / 2; i++) {
            const magnitude = Math.sqrt(fft[i].real * fft[i].real + fft[i].imag * fft[i].imag);
            spectralCentroid += i * magnitude;
            totalMagnitude += magnitude;
        }

        const brightness = totalMagnitude > 0 ? spectralCentroid / totalMagnitude / (fft.length / 2) : 0.5;

        return {
            brightness: Math.max(0, Math.min(1, brightness))
        };
    }

    /**
     * Simple FFT implementation for demo purposes
     * @param {Float32Array} signal - Input signal
     * @returns {Array} FFT result
     */
    simpleFFT(signal) {
        // Simplified FFT implementation for demo purposes
        const N = signal.length;
        const result = [];

        for (let k = 0; k < N; k++) {
            let real = 0;
            let imag = 0;

            for (let n = 0; n < N; n++) {
                const angle = -2 * Math.PI * k * n / N;
                real += signal[n] * Math.cos(angle);
                imag += signal[n] * Math.sin(angle);
            }

            result.push({ real, imag });
        }

        return result;
    }

    /**
     * Calculate danceability score
     * @param {number} tempo - Tempo in BPM
     * @param {number} energy - Energy level
     * @returns {number} Danceability score (0-1)
     */
    calculateDanceability(tempo, energy) {
        // Simple danceability calculation
        const tempoScore = tempo > 90 && tempo < 140 ? 1 : 0.5;
        const energyScore = energy;
        return (tempoScore + energyScore) / 2;
    }

    /**
     * Generate genre predictions based on extracted features
     * @param {Object} features - Extracted audio features
     * @returns {Array} Array of genre predictions with confidence scores
     */
    generateGenrePredictions(features) {
        const predictions = [];

        // Rule-based genre classification based on audio features
        this.genres.forEach(genre => {
            let confidence = Math.random() * 0.3 + 0.1; // Base random confidence

            // Adjust confidence based on features
            switch (genre) {
                case 'Electronic':
                    if (features.energy > 70 && features.danceability > 60) confidence += 0.4;
                    break;
                case 'Jazz':
                    if (features.tempo > 100 && features.tempo < 150 && features.valence > 50) confidence += 0.3;
                    break;
                case 'Classical':
                    if (features.energy < 50 && features.valence > 60) confidence += 0.35;
                    break;
                case 'Hip-Hop':
                    if (features.tempo > 70 && features.tempo < 120 && features.energy > 60) confidence += 0.4;
                    break;
                case 'Rock':
                    if (features.energy > 70 && features.tempo > 110) confidence += 0.4;
                    break;
                case 'Pop':
                    if (features.danceability > 50 && features.valence > 50) confidence += 0.3;
                    break;
                default:
                    confidence += Math.random() * 0.2;
            }

            predictions.push({
                genre,
                confidence: Math.min(0.95, confidence)
            });
        });

        // Sort by confidence and return top 5
        return predictions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
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
