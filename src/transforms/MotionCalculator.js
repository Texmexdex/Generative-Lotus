// MotionCalculator.js
// Calculate sinusoidal and noise-based motion for animations

import { NoiseGenerator } from '../utils/NoiseGenerator.js';

export class MotionCalculator {
    constructor() {
        // Noise generators for each seed
        this.noiseGenerators = new Map();
        
        // Cache for noise values
        this.noiseCache = new Map();
    }

    /**
     * Calculate sinusoidal motion
     * @param {number} time - Time in seconds
     * @param {number} frequency - Oscillation frequency
     * @param {number} phase - Phase offset in radians
     * @returns {number} Motion value between -1 and 1
     */
    calculateSinusoidal(time, frequency, phase = 0) {
        // Calculate sine wave with frequency and phase
        return Math.sin((time * frequency * Math.PI * 2) + phase);
    }

    /**
     * Calculate noise-based motion
     * @param {number} time - Time in seconds
     * @param {number} frequency - Noise frequency (speed of change)
     * @param {number} seed - Noise seed for reproducible patterns
     * @param {number} phase - Phase offset (spatial offset in noise space)
     * @returns {number} Motion value between -1 and 1
     */
    calculateNoise(time, frequency, seed, phase = 0) {
        // Get or create noise generator for this seed
        let noiseGen = this.noiseGenerators.get(seed);
        
        if (!noiseGen) {
            noiseGen = new NoiseGenerator();
            noiseGen.setSeed(seed);
            this.noiseGenerators.set(seed, noiseGen);
        }
        
        // Calculate noise coordinates
        // Use time * frequency for temporal variation
        // Use phase for spatial variation (different shapes get different values)
        const x = time * frequency;
        const y = phase;
        
        // Get noise value (returns -1 to 1)
        return noiseGen.noise2D(x, y);
    }

    /**
     * Calculate phase offset for effect orders
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
            // Use a larger multiplier for more pronounced wave effect
            return normalizedIndex * 10;
        } else if (effectOrder === 'backward') {
            // Phase decreases from first to last shape
            return -normalizedIndex * 10;
        }
        
        return 0;
    }

    /**
     * Clear noise cache (call when seed changes)
     */
    clearCache() {
        this.noiseCache.clear();
    }

    /**
     * Clear noise generator for a specific seed
     * @param {number} seed - Seed to clear
     */
    clearSeed(seed) {
        this.noiseGenerators.delete(seed);
        // Clear related cache entries
        for (const [key, value] of this.noiseCache.entries()) {
            if (key.startsWith(`${seed}_`)) {
                this.noiseCache.delete(key);
            }
        }
    }

    /**
     * Get all active seeds
     * @returns {Array} Array of active seed values
     */
    getActiveSeeds() {
        return Array.from(this.noiseGenerators.keys());
    }
}
