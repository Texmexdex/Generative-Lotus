// AnimationEngine.js
// Time-based animation calculations and motion generation

export class AnimationEngine {
    constructor(stateManager, motionCalculator = null) {
        this.stateManager = stateManager;
        this.motionCalculator = motionCalculator;
        
        // Time tracking
        this.startTime = 0;
        this.currentTime = 0;
        this.elapsedTime = 0;
        this.deltaTime = 0;
        this.lastTimestamp = 0;
        
        // Initialize start time
        this.reset();
    }

    /**
     * Set motion calculator dependency
     */
    setMotionCalculator(calculator) {
        this.motionCalculator = calculator;
    }

    /**
     * Update animation time
     * @param {number} timestamp - High-resolution timestamp from requestAnimationFrame
     */
    update(timestamp) {
        // Calculate delta time
        if (this.lastTimestamp === 0) {
            this.deltaTime = 0;
        } else {
            this.deltaTime = timestamp - this.lastTimestamp;
        }
        
        this.lastTimestamp = timestamp;
        this.currentTime = timestamp;
        this.elapsedTime = timestamp - this.startTime;
    }

    /**
     * Get delta time in milliseconds
     * @returns {number} Time since last update in milliseconds
     */
    getDeltaTime() {
        return this.deltaTime;
    }

    /**
     * Get elapsed time in milliseconds
     * @returns {number} Time since animation start in milliseconds
     */
    getElapsedTime() {
        return this.elapsedTime;
    }

    /**
     * Get elapsed time in seconds
     * @returns {number} Time since animation start in seconds
     */
    getElapsedTimeSeconds() {
        return this.elapsedTime / 1000;
    }

    /**
     * Reset animation time to zero
     */
    reset() {
        this.startTime = performance.now();
        this.currentTime = this.startTime;
        this.elapsedTime = 0;
        this.deltaTime = 0;
        this.lastTimestamp = 0;
    }

    /**
     * Calculate animated offsets for all properties
     * @param {number} index - Shape index in sequence
     * @param {number} sequenceCount - Total number of shapes
     * @param {number} timestamp - Current timestamp
     * @returns {Object} Animated offsets for scale, x, y, rotate
     */
    calculateAnimatedOffsets(index, sequenceCount, timestamp) {
        // Update time
        this.update(timestamp);
        
        if (!this.motionCalculator) {
            return { scale: 0, x: 0, y: 0, rotate: 0 };
        }
        
        // Get animation states
        const scaleAnim = this.stateManager.getAnimationState('scale');
        const xAnim = this.stateManager.getAnimationState('x');
        const yAnim = this.stateManager.getAnimationState('y');
        const rotateAnim = this.stateManager.getAnimationState('rotate');
        
        // Calculate offsets for each property
        const offsets = {
            scale: this.calculatePropertyOffset(scaleAnim, index, sequenceCount),
            x: this.calculatePropertyOffset(xAnim, index, sequenceCount),
            y: this.calculatePropertyOffset(yAnim, index, sequenceCount),
            rotate: this.calculatePropertyOffset(rotateAnim, index, sequenceCount)
        };
        
        return offsets;
    }

    /**
     * Calculate animated offset for a single property
     * @param {Object} animConfig - Animation configuration
     * @param {number} index - Shape index in sequence
     * @param {number} sequenceCount - Total number of shapes
     * @returns {number} Animated offset value
     */
    calculatePropertyOffset(animConfig, index, sequenceCount) {
        if (animConfig.motionType === 'off') {
            return 0;
        }
        
        // Calculate time in seconds
        const time = this.getElapsedTimeSeconds() * animConfig.speed;
        
        // Calculate phase offset based on effect order
        const phase = this.calculatePhaseOffset(index, sequenceCount, animConfig.effectOrder);
        
        // Get motion value from motion calculator
        let motionValue = 0;
        
        if (animConfig.motionType === 'sin') {
            motionValue = this.motionCalculator.calculateSinusoidal(
                time,
                animConfig.frequency,
                phase
            );
        } else if (animConfig.motionType === 'noise') {
            motionValue = this.motionCalculator.calculateNoise(
                time,
                animConfig.frequency,
                animConfig.noiseSeed,
                phase
            );
        }
        
        // Apply amplitude
        return motionValue * animConfig.amplitude;
    }

    /**
     * Calculate phase offset based on effect order
     * @param {number} index - Shape index in sequence
     * @param {number} sequenceCount - Total number of shapes
     * @param {string} effectOrder - 'equal', 'forward', or 'backward'
     * @returns {number} Phase offset value
     */
    calculatePhaseOffset(index, sequenceCount, effectOrder) {
        if (effectOrder === 'equal') {
            // All shapes have the same phase
            return 0;
        }
        
        // Normalize index to 0-1 range
        const normalizedIndex = sequenceCount > 1 ? index / (sequenceCount - 1) : 0;
        
        if (effectOrder === 'forward') {
            // Phase increases from first to last shape
            return normalizedIndex * Math.PI * 2; // Full wave across sequence
        } else if (effectOrder === 'backward') {
            // Phase decreases from first to last shape
            return -normalizedIndex * Math.PI * 2;
        }
        
        return 0;
    }

    /**
     * Calculate sinusoidal motion (fallback if motion calculator not available)
     * @param {number} time - Time in seconds
     * @param {number} frequency - Oscillation frequency
     * @param {number} phase - Phase offset
     * @returns {number} Motion value between -1 and 1
     */
    calculateSinusoidal(time, frequency, phase) {
        return Math.sin((time + phase) * frequency * Math.PI * 2);
    }
}
