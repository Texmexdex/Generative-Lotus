// SplitMaskProcessor.js
// Apply symmetry effects (mirroring) to transform sequences

export class SplitMaskProcessor {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    /**
     * Apply split mask effect to transforms
     * @param {Array} transforms - Array of transform objects
     * @param {string} maskType - 'none', 'horizontal', 'vertical', or 'quad'
     * @param {number} canvasWidth - Canvas width for center calculation
     * @param {number} canvasHeight - Canvas height for center calculation
     * @returns {Array} Array of transforms with mirroring applied
     */
    applySplitMask(transforms, maskType, canvasWidth, canvasHeight) {
        if (maskType === 'none' || !transforms || transforms.length === 0) {
            return transforms;
        }

        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        switch (maskType) {
            case 'horizontal':
                return this.applyHorizontalMirror(transforms, centerX, centerY);
            case 'vertical':
                return this.applyVerticalMirror(transforms, centerX, centerY);
            case 'quad':
                return this.applyQuadMirror(transforms, centerX, centerY);
            default:
                console.warn(`Unknown split mask type: ${maskType}`);
                return transforms;
        }
    }

    /**
     * Apply horizontal mirroring across center axis
     * Creates a mirrored copy below the original
     * @param {Array} transforms - Original transforms
     * @param {number} centerX - Canvas center X
     * @param {number} centerY - Canvas center Y
     * @returns {Array} Transforms with horizontal mirror
     */
    applyHorizontalMirror(transforms, centerX, centerY) {
        const mirrored = [];

        for (const transform of transforms) {
            // Add original transform
            mirrored.push(transform);

            // Create mirrored copy
            const mirroredTransform = {
                ...transform,
                y: centerY - (transform.y - centerY), // Mirror Y position
                rotation: -transform.rotation // Mirror rotation
            };
            mirrored.push(mirroredTransform);
        }

        return mirrored;
    }

    /**
     * Apply vertical mirroring across center axis
     * Creates a mirrored copy to the right of the original
     * @param {Array} transforms - Original transforms
     * @param {number} centerX - Canvas center X
     * @param {number} centerY - Canvas center Y
     * @returns {Array} Transforms with vertical mirror
     */
    applyVerticalMirror(transforms, centerX, centerY) {
        const mirrored = [];

        for (const transform of transforms) {
            // Add original transform
            mirrored.push(transform);

            // Create mirrored copy
            const mirroredTransform = {
                ...transform,
                x: centerX - (transform.x - centerX), // Mirror X position
                rotation: -transform.rotation // Mirror rotation
            };
            mirrored.push(mirroredTransform);
        }

        return mirrored;
    }

    /**
     * Apply quad mirroring into four quadrants
     * Creates mirrored copies in all four quadrants
     * @param {Array} transforms - Original transforms
     * @param {number} centerX - Canvas center X
     * @param {number} centerY - Canvas center Y
     * @returns {Array} Transforms with quad mirror
     */
    applyQuadMirror(transforms, centerX, centerY) {
        const mirrored = [];

        for (const transform of transforms) {
            // Quadrant 1: Original (top-right)
            mirrored.push(transform);

            // Quadrant 2: Mirror X (top-left)
            const mirrorX = {
                ...transform,
                x: centerX - (transform.x - centerX),
                rotation: -transform.rotation
            };
            mirrored.push(mirrorX);

            // Quadrant 3: Mirror Y (bottom-right)
            const mirrorY = {
                ...transform,
                y: centerY - (transform.y - centerY),
                rotation: -transform.rotation
            };
            mirrored.push(mirrorY);

            // Quadrant 4: Mirror both X and Y (bottom-left)
            const mirrorXY = {
                ...transform,
                x: centerX - (transform.x - centerX),
                y: centerY - (transform.y - centerY),
                rotation: transform.rotation // Rotation stays the same when mirrored twice
            };
            mirrored.push(mirrorXY);
        }

        return mirrored;
    }

    /**
     * Get the multiplier for the number of shapes after split mask
     * @param {string} maskType - 'none', 'horizontal', 'vertical', or 'quad'
     * @returns {number} Multiplier (1, 2, or 4)
     */
    getShapeMultiplier(maskType) {
        switch (maskType) {
            case 'none':
                return 1;
            case 'horizontal':
            case 'vertical':
                return 2;
            case 'quad':
                return 4;
            default:
                return 1;
        }
    }

    /**
     * Calculate effective sequence count after split mask
     * @param {number} baseCount - Original sequence count
     * @param {string} maskType - Split mask type
     * @returns {number} Effective count after mirroring
     */
    getEffectiveSequenceCount(baseCount, maskType) {
        return baseCount * this.getShapeMultiplier(maskType);
    }
}
