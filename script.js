/**
 * AI Music Genre Detector
 * Main JavaScript functionality for music genre detection
 * Enhanced with expanded genre range covering 80+ music genres
 */

class MusicGenreDetector {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.setupEventListeners();
        this.genres = [
            // Musik Populer Mainstream
            'Pop', 'Dance Pop', 'Synthpop', 'Teen Pop',
            'Rock', 'Classic Rock', 'Hard Rock', 'Alternative Rock', 'Punk Rock', 'Indie Rock',
            'Hip-Hop', 'Trap', 'Boom Bap', 'Gangsta Rap', 'Lo-fi Hip Hop',
            'R&B', 'Contemporary R&B', 'Neo-Soul', 'Motown',
            'Country', 'Country Pop', 'Bluegrass',
            'Folk', 'Indie Folk', 'Americana', 'Folk Rock',
            
            // Musik Elektronik
            'Electronic', 'EDM', 'House', 'Techno', 'Trance', 'Dubstep', 'Drum and Bass',
            'Ambient', 'Synthwave', 'Lo-fi', 'Electropop',
            
            // Musik Eksperimental/Alternatif
            'Experimental Rock', 'Art Pop', 'Noise Music', 'Avant-Garde', 'Post-Rock',
            'Shoegaze', 'Dream Pop',
            
            // Musik Klasik & Tradisional
            'Classical', 'Baroque', 'Romantic', 'Modern Classical', 'Opera',
            'Gamelan', 'Flamenco', 'Traditional Ethnic',
            
            // Musik Teater & Film
            'Musical Theater', 'Soundtrack', 'Film Score',
            
            // Musik Rohani & Spiritualitas
            'Gospel', 'Christian Contemporary', 'Qasidah', 'Nasheed',
            
            // Musik Dunia
            'Latin', 'Reggaeton', 'Salsa', 'Bossa Nova', 'Afrobeat',
            'K-Pop', 'J-Pop', 'C-Pop', 'Dangdut', 'Bollywood',
            
            // Metal
            'Heavy Metal', 'Thrash Metal', 'Death Metal', 'Black Metal', 'Metalcore', 'Symphonic Metal',
            
            // Jazz & Blues
            'Jazz', 'Bebop', 'Smooth Jazz', 'Swing', 'Blues', 'Delta Blues', 'Electric Blues',
            
            // Urban & Alternatif Baru
            'Indie Pop', 'Bedroom Pop', 'Hyperpop', 'Chillwave', 'Vaporwave', 'Reggae'
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
            let confidence = Math.random() * 0.2 + 0.05; // Lower base confidence for more genres

            // Detailed feature-based classification
            confidence += this.calculateGenreConfidence(genre, features);

            predictions.push({
                genre,
                confidence: Math.min(0.95, confidence)
            });
        });

        // Sort by confidence and return top 8 (more results for expanded genres)
        return predictions.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
    }

    /**
     * Calculate confidence score for a specific genre based on features
     * @param {string} genre - Genre name
     * @param {Object} features - Audio features
     * @returns {number} Additional confidence score
     */
    calculateGenreConfidence(genre, features) {
        let confidence = 0;

        // Electronic Music Family
        if (['Electronic', 'EDM', 'House', 'Techno', 'Trance', 'Dubstep', 'Electropop'].includes(genre)) {
            if (features.energy > 70 && features.danceability > 60) confidence += 0.4;
            if (features.tempo > 120) confidence += 0.2;
        }

        // Rock Family
        if (['Rock', 'Hard Rock', 'Alternative Rock', 'Punk Rock', 'Heavy Metal', 'Thrash Metal'].includes(genre)) {
            if (features.energy > 70 && features.tempo > 110) confidence += 0.4;
            if (features.valence < 50) confidence += 0.1; // Often more aggressive
        }

        // Pop Family
        if (['Pop', 'Dance Pop', 'Teen Pop', 'K-Pop', 'J-Pop', 'C-Pop'].includes(genre)) {
            if (features.danceability > 50 && features.valence > 50) confidence += 0.3;
            if (features.tempo > 90 && features.tempo < 140) confidence += 0.2;
        }

        // Hip-Hop Family
        if (['Hip-Hop', 'Trap', 'Boom Bap', 'Gangsta Rap'].includes(genre)) {
            if (features.tempo > 70 && features.tempo < 120 && features.energy > 60) confidence += 0.4;
            if (features.danceability > 40) confidence += 0.1;
        }

        // Jazz Family
        if (['Jazz', 'Bebop', 'Smooth Jazz', 'Swing'].includes(genre)) {
            if (features.tempo > 100 && features.tempo < 150 && features.valence > 50) confidence += 0.3;
            if (features.energy > 30 && features.energy < 70) confidence += 0.2;
        }

        // Classical Family
        if (['Classical', 'Baroque', 'Romantic', 'Modern Classical', 'Opera'].includes(genre)) {
            if (features.energy < 50 && features.valence > 60) confidence += 0.35;
            if (features.tempo < 120) confidence += 0.15;
        }

        // Blues Family
        if (['Blues', 'Delta Blues', 'Electric Blues'].includes(genre)) {
            if (features.energy > 40 && features.energy < 80) confidence += 0.3;
            if (features.valence < 60) confidence += 0.1;
        }

        // Ambient/Chill Family
        if (['Ambient', 'Lo-fi', 'Chillwave', 'Bedroom Pop'].includes(genre)) {
            if (features.energy < 40 && features.tempo < 100) confidence += 0.4;
            if (features.valence > 40) confidence += 0.1;
        }

        // Latin Family
        if (['Latin', 'Reggaeton', 'Salsa', 'Bossa Nova'].includes(genre)) {
            if (features.danceability > 60 && features.valence > 55) confidence += 0.3;
            if (features.tempo > 90) confidence += 0.2;
        }

        // Folk/Country Family
        if (['Folk', 'Country', 'Bluegrass', 'Americana'].includes(genre)) {
            if (features.energy > 30 && features.energy < 70) confidence += 0.25;
            if (features.valence > 50) confidence += 0.15;
        }

        // R&B Family
        if (['R&B', 'Contemporary R&B', 'Neo-Soul', 'Motown'].includes(genre)) {
            if (features.valence > 45 && features.danceability > 40) confidence += 0.3;
            if (features.tempo > 80 && features.tempo < 130) confidence += 0.2;
        }

        // Metal Family
        if (['Heavy Metal', 'Death Metal', 'Black Metal', 'Metalcore'].includes(genre)) {
            if (features.energy > 80) confidence += 0.4;
            if (features.tempo > 120) confidence += 0.2;
            if (features.valence < 40) confidence += 0.1;
        }

        return confidence;
    }

    /**
     * Get genre category for better organization
     * @param {string} genre - Genre name
     * @returns {string} Genre category
     */
    getGenreCategory(genre) {
        const categories = {
            'Mainstream Pop': ['Pop', 'Dance Pop', 'Synthpop', 'Teen Pop', 'K-Pop', 'J-Pop', 'C-Pop'],
            'Rock & Metal': ['Rock', 'Classic Rock', 'Hard Rock', 'Alternative Rock', 'Punk Rock', 'Indie Rock', 'Heavy Metal', 'Thrash Metal', 'Death Metal', 'Black Metal', 'Metalcore', 'Symphonic Metal'],
            'Hip-Hop & Rap': ['Hip-Hop', 'Trap', 'Boom Bap', 'Gangsta Rap', 'Lo-fi Hip Hop'],
            'Electronic': ['Electronic', 'EDM', 'House', 'Techno', 'Trance', 'Dubstep', 'Drum and Bass', 'Ambient', 'Synthwave', 'Lo-fi', 'Electropop'],
            'R&B & Soul': ['R&B', 'Contemporary R&B', 'Neo-Soul', 'Motown'],
            'Country & Folk': ['Country', 'Country Pop', 'Bluegrass', 'Folk', 'Indie Folk', 'Americana', 'Folk Rock'],
            'Jazz & Blues': ['Jazz', 'Bebop', 'Smooth Jazz', 'Swing', 'Blues', 'Delta Blues', 'Electric Blues'],
            'Classical': ['Classical', 'Baroque', 'Romantic', 'Modern Classical', 'Opera'],
            'World Music': ['Latin', 'Reggaeton', 'Salsa', 'Bossa Nova', 'Afrobeat', 'Dangdut', 'Bollywood', 'Gamelan', 'Flamenco', 'Traditional Ethnic'],
            'Alternative': ['Experimental Rock', 'Art Pop', 'Noise Music', 'Avant-Garde', 'Post-Rock', 'Shoegaze', 'Dream Pop', 'Indie Pop', 'Bedroom Pop', 'Hyperpop', 'Chillwave', 'Vaporwave'],
            'Other': ['Musical Theater', 'Soundtrack', 'Film Score', 'Gospel', 'Christian Contemporary', 'Qasidah', 'Nasheed', 'Reggae']
        };

        for (const [category, genres] of Object.entries(categories)) {
            if (genres.includes(genre)) return category;
        }
        return 'Other';
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
            const category = this.getGenreCategory(prediction.genre);
            
            resultDiv.innerHTML = `
                <div class="genre-name">${prediction.genre}</div>
                <div class="genre-category">${category}</div>
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

    /**
     * Get total number of supported genres
     * @returns {number} Total genre count
     */
    getTotalGenres() {
        return this.genres.length;
    }

    /**
     * Get genres by category for display purposes
     * @returns {Object} Genres organized by category
     */
    getGenresByCategory() {
        const genresByCategory = {};
        
        this.genres.forEach(genre => {
            const category = this.getGenreCategory(genre);
            if (!genresByCategory[category]) {
                genresByCategory[category] = [];
            }
            genresByCategory[category].push(genre);
        });

        return genresByCategory;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const detector = new MusicGenreDetector();
    
    // Display total genre count for user reference
    console.log(`🎵 Music Genre Detector initialized with ${detector.getTotalGenres()} supported genres`);
    console.log('📊 Supported genre categories:', Object.keys(detector.getGenresByCategory()));
});
