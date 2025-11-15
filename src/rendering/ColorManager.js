// ColorManager.js
// Manages color interpolation, palette management, and color modes

export class ColorManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.colorShiftTime = 0;
    }

    /**
     * Update color shift animation
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateColorShift(deltaTime) {
        const state = this.stateManager.getColorState();
        if (state.colorShift && state.colorShift.enabled) {
            this.colorShiftTime += deltaTime * state.colorShift.speed;
            
            // Calculate offset (0 to 1 range, cycling)
            const offset = (this.colorShiftTime % 1.0);
            
            // Update state with new offset
            this.stateManager.setState({
                color: {
                    colorShift: {
                        offset: offset
                    }
                }
            });
        }
    }

    /**
     * Reset color shift animation
     */
    resetColorShift() {
        this.colorShiftTime = 0;
    }

    /**
     * Get the color for a specific shape index in the sequence
     * @param {number} index - Shape index in sequence
     * @param {number} sequenceCount - Total number of shapes
     * @returns {string} Color in hex format
     */
    getColorForIndex(index, sequenceCount) {
        const state = this.stateManager.getColorState();
        
        // Apply color shift offset if enabled
        let adjustedIndex = index;
        if (state.colorShift && state.colorShift.enabled) {
            const shiftAmount = state.colorShift.offset * sequenceCount;
            adjustedIndex = (index + shiftAmount) % sequenceCount;
        }
        
        if (state.drawingMode === 'single') {
            // Apply hue shift to single color if color shift is enabled
            if (state.colorShift && state.colorShift.enabled) {
                return this.shiftColorHue(state.singleColor, state.colorShift.offset * 360);
            }
            return state.singleColor;
        }
        
        if (state.drawingMode === 'sequence') {
            // Cycle through palette colors with shift
            const paletteIndex = Math.floor(adjustedIndex) % state.palette.length;
            return state.palette[paletteIndex];
        }
        
        // Transition modes (RGB or LCH)
        if (sequenceCount <= 1) {
            return state.palette[0];
        }
        
        const t = adjustedIndex / (sequenceCount - 1); // 0 to 1
        const wrappedT = t - Math.floor(t); // Wrap to 0-1 range
        const paletteIndex = wrappedT * (state.palette.length - 1);
        const colorIndex1 = Math.floor(paletteIndex);
        const colorIndex2 = Math.ceil(paletteIndex);
        const localT = paletteIndex - colorIndex1;
        
        const color1 = state.palette[colorIndex1];
        const color2 = state.palette[colorIndex2];
        
        if (state.drawingMode === 'rgb') {
            return this.interpolateRGB(color1, color2, localT);
        } else if (state.drawingMode === 'lch') {
            return this.interpolateLCH(color1, color2, localT);
        }
        
        // Default fallback
        return state.palette[0];
    }

    /**
     * Shift a color's hue by a specified amount
     * @param {string} color - Color in hex format
     * @param {number} hueShift - Amount to shift hue (in degrees)
     * @returns {string} Shifted color in hex format
     */
    shiftColorHue(color, hueShift) {
        const rgb = this.hexToRGB(color);
        const lch = this.rgbToLCH(rgb.r, rgb.g, rgb.b);
        
        // Shift hue
        let newHue = (lch.h + hueShift) % 360;
        if (newHue < 0) newHue += 360;
        
        const newRgb = this.lchToRGB(lch.l, lch.c, newHue);
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

    /**
     * Interpolate between two colors in RGB color space
     * @param {string} color1 - First color in hex format
     * @param {string} color2 - Second color in hex format
     * @param {number} t - Interpolation factor (0 to 1)
     * @returns {string} Interpolated color in hex format
     */
    interpolateRGB(color1, color2, t) {
        const rgb1 = this.hexToRGB(color1);
        const rgb2 = this.hexToRGB(color2);
        
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
        
        return this.rgbToHex(r, g, b);
    }

    /**
     * Interpolate between two colors in LCH color space
     * @param {string} color1 - First color in hex format
     * @param {string} color2 - Second color in hex format
     * @param {number} t - Interpolation factor (0 to 1)
     * @returns {string} Interpolated color in hex format
     */
    interpolateLCH(color1, color2, t) {
        const rgb1 = this.hexToRGB(color1);
        const rgb2 = this.hexToRGB(color2);
        
        const lch1 = this.rgbToLCH(rgb1.r, rgb1.g, rgb1.b);
        const lch2 = this.rgbToLCH(rgb2.r, rgb2.g, rgb2.b);
        
        // Interpolate in LCH space
        const l = lch1.l + (lch2.l - lch1.l) * t;
        const c = lch1.c + (lch2.c - lch1.c) * t;
        
        // Handle hue interpolation (shortest path around the circle)
        let h1 = lch1.h;
        let h2 = lch2.h;
        let hDiff = h2 - h1;
        
        if (hDiff > 180) {
            h1 += 360;
        } else if (hDiff < -180) {
            h2 += 360;
        }
        
        let h = h1 + (h2 - h1) * t;
        if (h >= 360) h -= 360;
        if (h < 0) h += 360;
        
        const rgb = this.lchToRGB(l, c, h);
        return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color string
     * @returns {object} RGB object {r, g, b}
     */
    hexToRGB(hex) {
        // Handle undefined or null values
        if (!hex) {
            console.warn('hexToRGB received undefined/null color, using default white');
            return { r: 255, g: 255, b: 255 };
        }
        
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return { r, g, b };
    }

    /**
     * Convert RGB to hex color
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {string} Hex color string
     */
    rgbToHex(r, g, b) {
        // Clamp values
        r = Math.max(0, Math.min(255, Math.round(r)));
        g = Math.max(0, Math.min(255, Math.round(g)));
        b = Math.max(0, Math.min(255, Math.round(b)));
        
        const toHex = (n) => {
            const hex = n.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    /**
     * Convert RGB to LCH color space
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {object} LCH object {l, c, h}
     */
    rgbToLCH(r, g, b) {
        // First convert RGB to XYZ
        let rNorm = r / 255;
        let gNorm = g / 255;
        let bNorm = b / 255;
        
        // Apply gamma correction
        rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
        gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
        bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;
        
        // Convert to XYZ (D65 illuminant)
        const x = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375;
        const y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.0721750;
        const z = rNorm * 0.0193339 + gNorm * 0.1191920 + bNorm * 0.9503041;
        
        // Convert XYZ to LAB
        const xNorm = x / 0.95047;
        const yNorm = y / 1.00000;
        const zNorm = z / 1.08883;
        
        const fx = xNorm > 0.008856 ? Math.pow(xNorm, 1/3) : (7.787 * xNorm + 16/116);
        const fy = yNorm > 0.008856 ? Math.pow(yNorm, 1/3) : (7.787 * yNorm + 16/116);
        const fz = zNorm > 0.008856 ? Math.pow(zNorm, 1/3) : (7.787 * zNorm + 16/116);
        
        const l = (116 * fy) - 16;
        const a = 500 * (fx - fy);
        const bLab = 200 * (fy - fz);
        
        // Convert LAB to LCH
        const c = Math.sqrt(a * a + bLab * bLab);
        let h = Math.atan2(bLab, a) * (180 / Math.PI);
        if (h < 0) h += 360;
        
        return { l, c, h };
    }

    /**
     * Convert LCH to RGB color space
     * @param {number} l - Lightness (0-100)
     * @param {number} c - Chroma (0-150)
     * @param {number} h - Hue (0-360)
     * @returns {object} RGB object {r, g, b}
     */
    lchToRGB(l, c, h) {
        // Convert LCH to LAB
        const hRad = h * (Math.PI / 180);
        const a = c * Math.cos(hRad);
        const bLab = c * Math.sin(hRad);
        
        // Convert LAB to XYZ
        const fy = (l + 16) / 116;
        const fx = a / 500 + fy;
        const fz = fy - bLab / 200;
        
        const xNorm = fx * fx * fx > 0.008856 ? fx * fx * fx : (fx - 16/116) / 7.787;
        const yNorm = fy * fy * fy > 0.008856 ? fy * fy * fy : (fy - 16/116) / 7.787;
        const zNorm = fz * fz * fz > 0.008856 ? fz * fz * fz : (fz - 16/116) / 7.787;
        
        const x = xNorm * 0.95047;
        const y = yNorm * 1.00000;
        const z = zNorm * 1.08883;
        
        // Convert XYZ to RGB
        let r = x *  3.2404542 + y * -1.5371385 + z * -0.4985314;
        let g = x * -0.9692660 + y *  1.8760108 + z *  0.0415560;
        let b = x *  0.0556434 + y * -0.2040259 + z *  1.0572252;
        
        // Apply gamma correction
        r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
        g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
        b = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b;
        
        // Convert to 0-255 range
        r = Math.round(r * 255);
        g = Math.round(g * 255);
        b = Math.round(b * 255);
        
        return { r, g, b };
    }

    /**
     * Add a color to the palette
     * @param {string} color - Color in hex format
     * @returns {boolean} Success status
     */
    addColor(color) {
        const state = this.stateManager.getColorState();
        
        if (state.palette.length >= 10) {
            console.warn('Maximum palette size (10 colors) reached');
            return false;
        }
        
        const newPalette = [...state.palette, color];
        this.stateManager.setState({
            color: { palette: newPalette }
        });
        
        return true;
    }

    /**
     * Remove a color from the palette
     * @param {number} index - Index of color to remove
     * @returns {boolean} Success status
     */
    removeColor(index) {
        const state = this.stateManager.getColorState();
        
        if (state.palette.length <= 1) {
            console.warn('Cannot remove last color from palette');
            return false;
        }
        
        if (index < 0 || index >= state.palette.length) {
            console.warn('Invalid color index');
            return false;
        }
        
        const newPalette = state.palette.filter((_, i) => i !== index);
        this.stateManager.setState({
            color: { palette: newPalette }
        });
        
        return true;
    }

    /**
     * Generate a random palette of harmonious colors
     * @param {number} count - Number of colors to generate (defaults to current palette size)
     * @returns {string[]} Array of hex color strings
     */
    generateRandomPalette(count = null) {
        const state = this.stateManager.getColorState();
        const colorCount = count || state.palette.length;
        const clampedCount = Math.max(1, Math.min(10, colorCount));
        
        const palette = [];
        
        // Generate base hue
        const baseHue = Math.random() * 360;
        
        // Choose a harmony type
        const harmonyTypes = ['analogous', 'complementary', 'triadic', 'tetradic'];
        const harmonyType = harmonyTypes[Math.floor(Math.random() * harmonyTypes.length)];
        
        for (let i = 0; i < clampedCount; i++) {
            let hue;
            
            switch (harmonyType) {
                case 'analogous':
                    // Colors close to each other on the color wheel
                    hue = (baseHue + (i * 30)) % 360;
                    break;
                case 'complementary':
                    // Colors opposite on the color wheel
                    hue = (baseHue + (i * 180)) % 360;
                    break;
                case 'triadic':
                    // Colors evenly spaced around the wheel
                    hue = (baseHue + (i * 120)) % 360;
                    break;
                case 'tetradic':
                    // Four colors evenly spaced
                    hue = (baseHue + (i * 90)) % 360;
                    break;
                default:
                    hue = (baseHue + (i * (360 / clampedCount))) % 360;
            }
            
            // Vary lightness and saturation for interest
            const lightness = 40 + Math.random() * 40; // 40-80
            const chroma = 30 + Math.random() * 70; // 30-100
            
            const rgb = this.lchToRGB(lightness, chroma, hue);
            const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
            palette.push(hex);
        }
        
        // Update state with new palette
        this.stateManager.setState({
            color: { palette }
        });
        
        return palette;
    }
}
