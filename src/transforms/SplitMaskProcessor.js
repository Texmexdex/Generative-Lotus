// SplitMaskProcessor.js
// Apply symmetry effects (mirroring) to transform sequences

export class SplitMaskProcessor {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    /**
     * Apply split mask effect to transforms
     * @param {Array} transforms - Array of transform objects
     * @param {string} maskType - 'none', 'horizontal', 'vertical', 'quad', or 'alternating'
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
            case 'alternating':
                return this.applyAlternatingScale(transforms);
            case 'mirrorScale':
                return this.applyMirrorScale(transforms);
            case 'mirrorRotation':
                return this.applyMirrorRotation(transforms);
            case 'mirrorBoth':
                return this.applyMirrorBoth(transforms);
            case 'mirrorOpacity':
                return this.applyMirrorOpacity(transforms);
            case 'mirrorColor':
                return this.applyMirrorColor(transforms);
            case 'quantumXOR':
                console.log('Applying Quantum XOR mode');
                return this.applyQuantumXOR(transforms);
            case 'quantumAND':
                console.log('Applying Quantum AND mode');
                return this.applyQuantumAND(transforms);
            case 'quantumSubtract':
                console.log('Applying Quantum Subtract mode');
                return this.applyQuantumSubtract(transforms);
            case 'mirrorAll':
                return this.applyMirrorAll(transforms);
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
     * Apply alternating scale (every other shape inverted)
     * @param {Array} transforms - Original transforms
     * @returns {Array} Transforms with alternating scales
     */
    applyAlternatingScale(transforms) {
        return transforms.map((transform, index) => {
            // Every other shape gets inverted scale
            if (index % 2 === 1) {
                return {
                    ...transform,
                    scale: -transform.scale
                };
            }
            return transform;
        });
    }

    /**
     * Mirror scale - each shape renders twice (positive and negative scale)
     * Creates dimensional overlap effect
     * @param {Array} transforms - Original transforms
     * @returns {Array} Doubled transforms with mirrored scales
     */
    applyMirrorScale(transforms) {
        const mirrored = [];
        
        for (const transform of transforms) {
            // Original (positive scale)
            mirrored.push(transform);
            
            // Inverted scale version
            mirrored.push({
                ...transform,
                scale: -transform.scale
            });
        }
        
        return mirrored;
    }

    /**
     * Mirror rotation - each shape renders twice (positive and negative rotation)
     * Creates rotational symmetry
     * @param {Array} transforms - Original transforms
     * @returns {Array} Doubled transforms with mirrored rotations
     */
    applyMirrorRotation(transforms) {
        const mirrored = [];
        
        for (const transform of transforms) {
            // Original rotation
            mirrored.push(transform);
            
            // Inverted rotation version
            mirrored.push({
                ...transform,
                rotation: -transform.rotation
            });
        }
        
        return mirrored;
    }

    /**
     * Mirror both scale and rotation - each shape renders 4 times
     * All combinations: (+scale, +rot), (+scale, -rot), (-scale, +rot), (-scale, -rot)
     * Creates maximum dimensional chaos
     * @param {Array} transforms - Original transforms
     * @returns {Array} Quadrupled transforms with all mirror combinations
     */
    applyMirrorBoth(transforms) {
        const mirrored = [];
        
        for (const transform of transforms) {
            // 1. Original (+scale, +rotation)
            mirrored.push(transform);
            
            // 2. Mirror rotation only (+scale, -rotation)
            mirrored.push({
                ...transform,
                rotation: -transform.rotation
            });
            
            // 3. Mirror scale only (-scale, +rotation)
            mirrored.push({
                ...transform,
                scale: -transform.scale
            });
            
            // 4. Mirror both (-scale, -rotation)
            mirrored.push({
                ...transform,
                scale: -transform.scale,
                rotation: -transform.rotation
            });
        }
        
        return mirrored;
    }

    /**
     * Get the multiplier for the number of shapes after split mask
     * @param {string} maskType - 'none', 'horizontal', 'vertical', 'quad', or 'alternating'
     * @returns {number} Multiplier (1, 2, or 4)
     */
    getShapeMultiplier(maskType) {
        switch (maskType) {
            case 'none':
            case 'alternating':
                return 1;
            case 'horizontal':
            case 'vertical':
            case 'mirrorScale':
            case 'mirrorRotation':
            case 'mirrorOpacity':
            case 'mirrorColor':
            case 'quantumXOR':
            case 'quantumAND':
            case 'quantumSubtract':
                return 2;
            case 'quad':
            case 'mirrorBoth':
                return 4;
            case 'mirrorAll':
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

    /**
     * Mirror opacity - each shape renders twice with inverted opacity
     * Creates mask/cutout effects where overlaps show through
     * @param {Array} transforms - Original transforms
     * @returns {Array} Doubled transforms with mirrored opacity
     */
    applyMirrorOpacity(transforms) {
        const mirrored = [];
        
        for (const transform of transforms) {
            // Original opacity
            mirrored.push(transform);
            
            // Inverted opacity (1 - opacity)
            mirrored.push({
                ...transform,
                opacity: 1 - transform.opacity,
                invertedOpacity: true // Flag for rendering
            });
        }
        
        return mirrored;
    }

    /**
     * Mirror color - each shape renders twice with inverted/complementary colors
     * Creates color-space inversion effects
     * @param {Array} transforms - Original transforms
     * @returns {Array} Doubled transforms with color inversion flag
     */
    applyMirrorColor(transforms) {
        const mirrored = [];
        
        for (const transform of transforms) {
            // Original color
            mirrored.push(transform);
            
            // Inverted color version
            mirrored.push({
                ...transform,
                invertColor: true // Flag for rendering
            });
        }
        
        return mirrored;
    }

    /**
     * Quantum XOR - shapes exist where +scale and -scale DON'T overlap
     * Only renders the non-intersecting parts (exclusive or)
     * Creates "existence holes" where dimensions cancel out
     * @param {Array} transforms - Original transforms
     * @returns {Array} Doubled transforms with XOR blend mode
     */
    applyQuantumXOR(transforms) {
        const mirrored = [];
        
        for (const transform of transforms) {
            // Positive scale (exists) - slightly offset to create visible XOR effect
            mirrored.push({
                ...transform,
                rotation: transform.rotation + 5, // Slight rotation offset
                blendMode: 'xor'
            });
            
            // Negative scale (anti-exists) - counter-rotated
            mirrored.push({
                ...transform,
                scale: -transform.scale,
                rotation: transform.rotation - 5, // Counter rotation
                blendMode: 'xor'
            });
        }
        
        return mirrored;
    }

    /**
     * Quantum AND - shapes only exist where +scale and -scale overlap
     * Only renders the intersection (and)
     * Creates "existence only in overlap" - quantum superposition
     * @param {Array} transforms - Original transforms
     * @returns {Array} Doubled transforms with source-in blend mode
     */
    applyQuantumAND(transforms) {
        const mirrored = [];
        
        for (const transform of transforms) {
            // Positive scale (base layer) - slightly rotated
            mirrored.push({
                ...transform,
                rotation: transform.rotation + 10,
                blendMode: 'source-over'
            });
            
            // Negative scale (mask) - only shows where they overlap
            mirrored.push({
                ...transform,
                scale: -transform.scale,
                rotation: transform.rotation - 10,
                blendMode: 'source-atop' // Changed to source-atop for better visibility
            });
        }
        
        return mirrored;
    }

    /**
     * Quantum SUBTRACT - negative scale erases positive scale
     * Creates "anti-matter" effect where -scale cancels out +scale
     * @param {Array} transforms - Original transforms
     * @returns {Array} Doubled transforms with destination-out blend mode
     */
    applyQuantumSubtract(transforms) {
        const mirrored = [];
        
        for (const transform of transforms) {
            // Positive scale (exists) - slightly rotated
            mirrored.push({
                ...transform,
                rotation: transform.rotation + 7,
                blendMode: 'source-over'
            });
            
            // Negative scale (erases) - removes where they overlap
            mirrored.push({
                ...transform,
                scale: -transform.scale,
                rotation: transform.rotation - 7,
                blendMode: 'destination-out'
            });
        }
        
        return mirrored;
    }

    applyMirrorAll(transforms) {
        const mirrored = [];
        
        for (const transform of transforms) {
            // Generate all 8 combinations of scale, rotation, and opacity
            const scales = [transform.scale, -transform.scale];
            const rotations = [transform.rotation, -transform.rotation];
            const opacities = [transform.opacity, 1 - transform.opacity];
            
            for (const scale of scales) {
                for (const rotation of rotations) {
                    for (const opacity of opacities) {
                        mirrored.push({
                            ...transform,
                            scale,
                            rotation,
                            opacity,
                            invertedOpacity: opacity !== transform.opacity
                        });
                    }
                }
            }
        }
        
        return mirrored;
    }
}
