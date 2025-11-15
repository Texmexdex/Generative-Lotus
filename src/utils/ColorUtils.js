// ColorUtils.js
// Color space conversion and utility functions

/**
 * Convert hex color string to RGB object
 * @param {string} hex - Hex color string (e.g., '#FF0000' or 'FF0000')
 * @returns {{r: number, g: number, b: number}} RGB object with values 0-255
 */
export function hexToRGB(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Handle 3-digit hex codes
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

/**
 * Convert RGB object to hex color string
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color string (e.g., '#FF0000')
 */
export function rgbToHex(r, g, b) {
    // Clamp values to 0-255 range
    r = Math.max(0, Math.min(255, Math.round(r)));
    g = Math.max(0, Math.min(255, Math.round(g)));
    b = Math.max(0, Math.min(255, Math.round(b)));
    
    // Convert to hex and pad with zeros if needed
    const toHex = (value) => value.toString(16).padStart(2, '0');
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB to LCH color space
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {{l: number, c: number, h: number}} LCH object (L: 0-100, C: 0-150, H: 0-360)
 */
export function rgbToLCH(r, g, b) {
    // First convert RGB to XYZ
    // Normalize RGB values to 0-1
    let rNorm = r / 255;
    let gNorm = g / 255;
    let bNorm = b / 255;
    
    // Apply gamma correction
    rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
    gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
    bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;
    
    // Convert to XYZ using D65 illuminant
    const x = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375;
    const y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.0721750;
    const z = rNorm * 0.0193339 + gNorm * 0.1191920 + bNorm * 0.9503041;
    
    // Convert XYZ to LAB
    // Reference white point D65
    const xn = 0.95047;
    const yn = 1.00000;
    const zn = 1.08883;
    
    const fx = xyzToLabHelper(x / xn);
    const fy = xyzToLabHelper(y / yn);
    const fz = xyzToLabHelper(z / zn);
    
    const l = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const bLab = 200 * (fy - fz);
    
    // Convert LAB to LCH
    const c = Math.sqrt(a * a + bLab * bLab);
    let h = Math.atan2(bLab, a) * (180 / Math.PI);
    
    // Normalize hue to 0-360
    if (h < 0) {
        h += 360;
    }
    
    return { l, c, h };
}

/**
 * Helper function for XYZ to LAB conversion
 * @param {number} t - Input value
 * @returns {number} Transformed value
 */
function xyzToLabHelper(t) {
    const delta = 6 / 29;
    return t > delta ** 3 ? Math.pow(t, 1 / 3) : t / (3 * delta ** 2) + 4 / 29;
}

/**
 * Convert LCH to RGB color space
 * @param {number} l - Lightness (0-100)
 * @param {number} c - Chroma (0-150)
 * @param {number} h - Hue (0-360)
 * @returns {{r: number, g: number, b: number}} RGB object with values 0-255
 */
export function lchToRGB(l, c, h) {
    // Convert LCH to LAB
    const hRad = h * (Math.PI / 180);
    const a = c * Math.cos(hRad);
    const bLab = c * Math.sin(hRad);
    
    // Convert LAB to XYZ
    const fy = (l + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - bLab / 200;
    
    const xn = 0.95047;
    const yn = 1.00000;
    const zn = 1.08883;
    
    const x = xn * labToXyzHelper(fx);
    const y = yn * labToXyzHelper(fy);
    const z = zn * labToXyzHelper(fz);
    
    // Convert XYZ to RGB
    let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
    let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
    let b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
    
    // Apply inverse gamma correction
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;
    
    // Convert to 0-255 range and clamp
    r = Math.max(0, Math.min(255, Math.round(r * 255)));
    g = Math.max(0, Math.min(255, Math.round(g * 255)));
    b = Math.max(0, Math.min(255, Math.round(b * 255)));
    
    return { r, g, b };
}

/**
 * Helper function for LAB to XYZ conversion
 * @param {number} t - Input value
 * @returns {number} Transformed value
 */
function labToXyzHelper(t) {
    const delta = 6 / 29;
    return t > delta ? t ** 3 : 3 * delta ** 2 * (t - 4 / 29);
}

/**
 * Validate if a string is a valid hex color
 * @param {string} hex - Hex color string to validate
 * @returns {boolean} True if valid hex color
 */
export function isValidHex(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Check if it's 3 or 6 characters and all are valid hex digits
    return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Validate if RGB values are in valid range
 * @param {number} r - Red value
 * @param {number} g - Green value
 * @param {number} b - Blue value
 * @returns {boolean} True if all values are in 0-255 range
 */
export function isValidRGB(r, g, b) {
    return (
        typeof r === 'number' && r >= 0 && r <= 255 &&
        typeof g === 'number' && g >= 0 && g <= 255 &&
        typeof b === 'number' && b >= 0 && b <= 255
    );
}

/**
 * Validate if LCH values are in valid range
 * @param {number} l - Lightness value
 * @param {number} c - Chroma value
 * @param {number} h - Hue value
 * @returns {boolean} True if all values are in valid ranges
 */
export function isValidLCH(l, c, h) {
    return (
        typeof l === 'number' && l >= 0 && l <= 100 &&
        typeof c === 'number' && c >= 0 &&
        typeof h === 'number' && h >= 0 && h <= 360
    );
}
