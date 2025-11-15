// OpacityManager.js
// Manages opacity fade effects for trail rendering

export class OpacityManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    /**
     * Calculate opacity for a specific shape index in the sequence
     * @param {number} index - Shape index in sequence
     * @param {number} sequenceCount - Total number of shapes
     * @returns {number} Opacity value (0.0 to 1.0)
     */
    calculateOpacity(index, sequenceCount) {
        const transformState = this.stateManager.getTransformState();
        const opacityFade = transformState.opacityFade;
        
        // If opacity fade is disabled, return full opacity
        if (!opacityFade.enabled) {
            return 1.0;
        }
        
        // Handle edge case of single shape
        if (sequenceCount <= 1) {
            return opacityFade.startOpacity;
        }
        
        // Calculate normalized position (0 to 1)
        const t = index / (sequenceCount - 1);
        
        // Apply fade curve based on fade rate
        const fadedT = this.applyFadeCurve(t, opacityFade.fadeRate);
        
        // Interpolate between start and end opacity
        const opacity = opacityFade.startOpacity + 
                       (opacityFade.endOpacity - opacityFade.startOpacity) * fadedT;
        
        // Clamp to valid range
        return Math.max(0, Math.min(1, opacity));
    }

    /**
     * Apply fade curve to the interpolation factor
     * @param {number} t - Linear interpolation factor (0 to 1)
     * @param {number} fadeRate - Fade rate control (0.1 to 5.0)
     * @returns {number} Modified interpolation factor
     */
    applyFadeCurve(t, fadeRate) {
        // fadeRate = 1.0 is linear
        // fadeRate < 1.0 creates slower fade at start (ease-in)
        // fadeRate > 1.0 creates faster fade at start (ease-out)
        
        if (fadeRate === 1.0) {
            // Linear fade
            return t;
        } else if (fadeRate < 1.0) {
            // Ease-in (slower at start)
            return Math.pow(t, 1 / fadeRate);
        } else {
            // Ease-out (faster at start)
            return Math.pow(t, fadeRate);
        }
    }

    /**
     * Calculate linear fade (no curve)
     * @param {number} t - Interpolation factor (0 to 1)
     * @returns {number} Same value (linear)
     */
    linearFade(t) {
        return t;
    }

    /**
     * Calculate exponential fade
     * @param {number} t - Interpolation factor (0 to 1)
     * @param {number} rate - Exponential rate
     * @returns {number} Exponentially modified value
     */
    exponentialFade(t, rate) {
        return Math.pow(t, rate);
    }

    /**
     * Calculate custom fade curve
     * @param {number} t - Interpolation factor (0 to 1)
     * @param {string} curve - Curve type ('linear', 'ease-in', 'ease-out', 'ease-in-out')
     * @returns {number} Modified interpolation factor
     */
    customFade(t, curve) {
        switch (curve) {
            case 'linear':
                return t;
            
            case 'ease-in':
                // Quadratic ease-in
                return t * t;
            
            case 'ease-out':
                // Quadratic ease-out
                return t * (2 - t);
            
            case 'ease-in-out':
                // Smooth S-curve
                return t < 0.5 
                    ? 2 * t * t 
                    : -1 + (4 - 2 * t) * t;
            
            default:
                return t;
        }
    }
}
