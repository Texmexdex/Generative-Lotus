// NoiseGenerator.js
// Perlin noise implementation for organic motion

export class NoiseGenerator {
    constructor() {
        // Permutation table for Perlin noise
        this.permutation = [];
        this.p = [];
        
        // Initialize with default seed
        this.setSeed(1);
    }

    /**
     * Set noise seed for reproducible patterns
     * @param {number} seed - Seed value
     */
    setSeed(seed) {
        // Generate permutation table based on seed
        this.permutation = [];
        
        // Use seed to generate pseudo-random permutation
        const random = this.seededRandom(seed);
        
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = i;
        }
        
        // Shuffle using Fisher-Yates algorithm with seeded random
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
        }
        
        // Duplicate permutation table
        this.p = [];
        for (let i = 0; i < 512; i++) {
            this.p[i] = this.permutation[i % 256];
        }
    }

    /**
     * Create a seeded random number generator
     * @param {number} seed - Seed value
     * @returns {function} Random number generator function
     */
    seededRandom(seed) {
        let state = seed;
        return function() {
            state = (state * 9301 + 49297) % 233280;
            return state / 233280;
        };
    }

    /**
     * 1D Perlin noise
     * @param {number} x - Input coordinate
     * @returns {number} Noise value between -1 and 1
     */
    noise1D(x) {
        // Use 2D noise with y=0 for 1D noise
        return this.noise2D(x, 0);
    }

    /**
     * 2D Perlin noise
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} Noise value between -1 and 1
     */
    noise2D(x, y) {
        // Find unit grid cell containing point
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        // Get relative xy coordinates of point within cell
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        // Compute fade curves for x and y
        const u = this.fade(x);
        const v = this.fade(y);
        
        // Hash coordinates of the 4 cube corners
        const A = this.p[X] + Y;
        const AA = this.p[A];
        const AB = this.p[A + 1];
        const B = this.p[X + 1] + Y;
        const BA = this.p[B];
        const BB = this.p[B + 1];
        
        // Add blended results from 4 corners of cube
        const result = this.lerp(
            v,
            this.lerp(u, this.grad(this.p[AA], x, y), this.grad(this.p[BA], x - 1, y)),
            this.lerp(u, this.grad(this.p[AB], x, y - 1), this.grad(this.p[BB], x - 1, y - 1))
        );
        
        return result;
    }

    /**
     * Fade function for smooth interpolation
     * @param {number} t - Input value
     * @returns {number} Faded value
     */
    fade(t) {
        // 6t^5 - 15t^4 + 10t^3
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Linear interpolation
     * @param {number} t - Interpolation factor
     * @param {number} a - Start value
     * @param {number} b - End value
     * @returns {number} Interpolated value
     */
    lerp(t, a, b) {
        return a + t * (b - a);
    }

    /**
     * Gradient function
     * @param {number} hash - Hash value
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} Gradient value
     */
    grad(hash, x, y) {
        // Convert low 2 bits of hash code into 4 gradient directions
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    /**
     * Octave noise (multiple layers of noise for more detail)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} octaves - Number of octaves
     * @param {number} persistence - Amplitude multiplier per octave
     * @returns {number} Noise value
     */
    octaveNoise2D(x, y, octaves = 4, persistence = 0.5) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += this.noise2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }
        
        return total / maxValue;
    }
}
