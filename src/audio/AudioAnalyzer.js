// AudioAnalyzer.js
// Captures and analyzes audio input from system microphone or audio devices

export class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.frequencyData = null;
        this.isActive = false;
        
        // Analysis settings
        this.fftSize = 2048;
        this.smoothingTimeConstant = 0.8;
        
        // Frequency bands (in Hz)
        this.bands = {
            subBass: { min: 20, max: 60 },
            bass: { min: 60, max: 250 },
            lowMids: { min: 250, max: 500 },
            mids: { min: 500, max: 2000 },
            highMids: { min: 2000, max: 4000 },
            presence: { min: 4000, max: 6000 },
            brilliance: { min: 6000, max: 20000 }
        };
        
        // Cached analysis results
        this.analysisCache = {
            volume: 0,
            bass: 0,
            mids: 0,
            treble: 0,
            subBass: 0,
            lowMids: 0,
            highMids: 0,
            presence: 0,
            brilliance: 0,
            rms: 0,
            peak: 0,
            beatDetected: false,
            frequencyBins: []
        };
        
        // Beat detection
        this.beatThreshold = 1.3;
        this.beatDecay = 0.98;
        this.beatHistory = [];
        this.lastBeatTime = 0;
        this.beatCooldown = 200; // ms
    }

    /**
     * Initialize audio context and request microphone access
     */
    async initialize(deviceId = null) {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Request microphone access
            const constraints = {
                audio: deviceId ? { deviceId: { exact: deviceId } } : true
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Create analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
            
            // Connect microphone to analyser
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);
            
            // Create data arrays
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            this.frequencyData = new Uint8Array(bufferLength);
            
            this.isActive = true;
            console.log('Audio analyzer initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize audio analyzer:', error);
            return false;
        }
    }

    /**
     * Get list of available audio input devices
     */
    async getAudioDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'audioinput');
        } catch (error) {
            console.error('Failed to enumerate audio devices:', error);
            return [];
        }
    }

    /**
     * Analyze current audio frame
     */
    analyze() {
        if (!this.isActive || !this.analyser) {
            return this.analysisCache;
        }
        
        // Get frequency and time domain data
        this.analyser.getByteFrequencyData(this.frequencyData);
        this.analyser.getByteTimeDomainData(this.dataArray);
        
        // Calculate overall volume (0-1)
        this.analysisCache.volume = this.calculateVolume();
        
        // Calculate RMS and peak
        this.analysisCache.rms = this.calculateRMS();
        this.analysisCache.peak = this.calculatePeak();
        
        // Calculate frequency bands
        this.analysisCache.subBass = this.getFrequencyBandEnergy('subBass');
        this.analysisCache.bass = this.getFrequencyBandEnergy('bass');
        this.analysisCache.lowMids = this.getFrequencyBandEnergy('lowMids');
        this.analysisCache.mids = this.getFrequencyBandEnergy('mids');
        this.analysisCache.highMids = this.getFrequencyBandEnergy('highMids');
        this.analysisCache.presence = this.getFrequencyBandEnergy('presence');
        this.analysisCache.brilliance = this.getFrequencyBandEnergy('brilliance');
        
        // Simplified treble (high frequencies)
        this.analysisCache.treble = (this.analysisCache.presence + this.analysisCache.brilliance) / 2;
        
        // Detect beats
        this.analysisCache.beatDetected = this.detectBeat();
        
        // Get frequency bins (8 bins for simplicity)
        this.analysisCache.frequencyBins = this.getFrequencyBins(8);
        
        return this.analysisCache;
    }

    /**
     * Calculate overall volume from frequency data
     */
    calculateVolume() {
        let sum = 0;
        for (let i = 0; i < this.frequencyData.length; i++) {
            sum += this.frequencyData[i];
        }
        return (sum / this.frequencyData.length) / 255;
    }

    /**
     * Calculate RMS (Root Mean Square) energy
     */
    calculateRMS() {
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            const normalized = (this.dataArray[i] - 128) / 128;
            sum += normalized * normalized;
        }
        return Math.sqrt(sum / this.dataArray.length);
    }

    /**
     * Calculate peak amplitude
     */
    calculatePeak() {
        let max = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            const value = Math.abs(this.dataArray[i] - 128) / 128;
            if (value > max) max = value;
        }
        return max;
    }

    /**
     * Get energy for a specific frequency band
     */
    getFrequencyBandEnergy(bandName) {
        const band = this.bands[bandName];
        if (!band) return 0;
        
        const nyquist = this.audioContext.sampleRate / 2;
        const binCount = this.frequencyData.length;
        
        // Convert Hz to bin indices
        const minBin = Math.floor((band.min / nyquist) * binCount);
        const maxBin = Math.ceil((band.max / nyquist) * binCount);
        
        // Calculate average energy in this band
        let sum = 0;
        let count = 0;
        for (let i = minBin; i < maxBin && i < binCount; i++) {
            sum += this.frequencyData[i];
            count++;
        }
        
        return count > 0 ? (sum / count) / 255 : 0;
    }

    /**
     * Get frequency spectrum divided into N bins
     */
    getFrequencyBins(numBins) {
        const bins = [];
        const binSize = Math.floor(this.frequencyData.length / numBins);
        
        for (let i = 0; i < numBins; i++) {
            let sum = 0;
            const start = i * binSize;
            const end = start + binSize;
            
            for (let j = start; j < end && j < this.frequencyData.length; j++) {
                sum += this.frequencyData[j];
            }
            
            bins.push((sum / binSize) / 255);
        }
        
        return bins;
    }

    /**
     * Simple beat detection based on energy spikes
     */
    detectBeat() {
        const currentTime = Date.now();
        
        // Check cooldown
        if (currentTime - this.lastBeatTime < this.beatCooldown) {
            return false;
        }
        
        const currentEnergy = this.analysisCache.bass * 0.7 + this.analysisCache.volume * 0.3;
        
        // Add to history
        this.beatHistory.push(currentEnergy);
        if (this.beatHistory.length > 43) { // ~1 second at 60fps
            this.beatHistory.shift();
        }
        
        // Calculate average energy
        const avgEnergy = this.beatHistory.reduce((a, b) => a + b, 0) / this.beatHistory.length;
        
        // Detect beat if current energy exceeds threshold
        if (currentEnergy > avgEnergy * this.beatThreshold && currentEnergy > 0.1) {
            this.lastBeatTime = currentTime;
            return true;
        }
        
        return false;
    }

    /**
     * Get current analysis data
     */
    getData() {
        return this.analysisCache;
    }

    /**
     * Set FFT size (must be power of 2: 256, 512, 1024, 2048, 4096, etc.)
     */
    setFFTSize(size) {
        if (this.analyser) {
            this.analyser.fftSize = size;
            this.fftSize = size;
            
            // Recreate data arrays
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            this.frequencyData = new Uint8Array(bufferLength);
        }
    }

    /**
     * Set smoothing time constant (0-1, higher = smoother)
     */
    setSmoothing(value) {
        if (this.analyser) {
            this.analyser.smoothingTimeConstant = Math.max(0, Math.min(1, value));
            this.smoothingTimeConstant = value;
        }
    }

    /**
     * Set beat detection sensitivity
     */
    setBeatSensitivity(value) {
        // Lower threshold = more sensitive
        this.beatThreshold = 1.1 + (1 - value) * 0.5; // Range: 1.1 to 1.6
    }

    /**
     * Check if audio is active
     */
    isAnalyzing() {
        return this.isActive;
    }

    /**
     * Stop audio analysis and release resources
     */
    stop() {
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.isActive = false;
        console.log('Audio analyzer stopped');
    }
}
