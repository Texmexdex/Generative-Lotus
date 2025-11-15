// MathUtils.js
// Mathematical utility functions for transforms and animations

/**
 * Clamp a value between a minimum and maximum
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Map a value from one range to another
 * @param {number} value - Value to map
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
export function map(value, inMin, inMax, outMin, outMax) {
    // Normalize to 0-1 range
    const normalized = (value - inMin) / (inMax - inMin);
    
    // Map to output range
    return outMin + normalized * (outMax - outMin);
}

/**
 * Remap a value from one range to another (alias for map)
 * @param {number} value - Value to remap
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Remapped value
 */
export function remap(value, inMin, inMax, outMin, outMax) {
    return map(value, inMin, inMax, outMin, outMax);
}

/**
 * Normalize an angle to 0-360 degree range
 * @param {number} angle - Angle in degrees
 * @returns {number} Normalized angle (0-360)
 */
export function normalizeAngle(angle) {
    // Reduce angle to 0-360 range
    angle = angle % 360;
    
    // Handle negative angles
    if (angle < 0) {
        angle += 360;
    }
    
    return angle;
}

/**
 * Normalize an angle to -180 to 180 degree range
 * @param {number} angle - Angle in degrees
 * @returns {number} Normalized angle (-180 to 180)
 */
export function normalizeAngleSigned(angle) {
    // First normalize to 0-360
    angle = normalizeAngle(angle);
    
    // Convert to -180 to 180 range
    if (angle > 180) {
        angle -= 360;
    }
    
    return angle;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Calculate the shortest angular distance between two angles
 * @param {number} from - Starting angle in degrees
 * @param {number} to - Target angle in degrees
 * @returns {number} Shortest angular distance (-180 to 180)
 */
export function angleDifference(from, to) {
    // Normalize both angles
    from = normalizeAngle(from);
    to = normalizeAngle(to);
    
    // Calculate difference
    let diff = to - from;
    
    // Take shortest path
    if (diff > 180) {
        diff -= 360;
    } else if (diff < -180) {
        diff += 360;
    }
    
    return diff;
}

/**
 * Smoothstep interpolation (smooth ease in/out)
 * @param {number} edge0 - Lower edge
 * @param {number} edge1 - Upper edge
 * @param {number} x - Value to interpolate
 * @returns {number} Smoothly interpolated value (0-1)
 */
export function smoothstep(edge0, edge1, x) {
    // Clamp x to 0-1 range
    x = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    
    // Evaluate polynomial
    return x * x * (3 - 2 * x);
}

/**
 * Smoother step interpolation (even smoother than smoothstep)
 * @param {number} edge0 - Lower edge
 * @param {number} edge1 - Upper edge
 * @param {number} x - Value to interpolate
 * @returns {number} Smoothly interpolated value (0-1)
 */
export function smootherstep(edge0, edge1, x) {
    // Clamp x to 0-1 range
    x = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    
    // Evaluate polynomial (6x^5 - 15x^4 + 10x^3)
    return x * x * x * (x * (x * 6 - 15) + 10);
}

/**
 * Check if a value is within a range (inclusive)
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if value is within range
 */
export function inRange(value, min, max) {
    return value >= min && value <= max;
}

/**
 * Wrap a value within a range
 * @param {number} value - Value to wrap
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Wrapped value
 */
export function wrap(value, min, max) {
    const range = max - min;
    
    if (range === 0) {
        return min;
    }
    
    // Shift to 0-based range
    value = value - min;
    
    // Wrap using modulo
    value = value % range;
    
    // Handle negative values
    if (value < 0) {
        value += range;
    }
    
    // Shift back to original range
    return value + min;
}
