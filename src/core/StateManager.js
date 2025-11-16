// StateManager.js
// Central state management for all application parameters

export class StateManager {
    constructor() {
        this.state = this.getDefaultState();
        this.subscribers = [];
    }

    /**
     * Get the default initial state (Lotus preset)
     */
    getDefaultState() {
        return {
            canvas: {
                width: 1200,
                height: 800,
                backgroundColor: '#0a0a1a',
                targetFPS: 60,
                cameraZoom: 2.2,
                cameraX: 0,
                cameraY: 0
            },
            shape: {
                type: 'octagon',
                customSVG: null,
                size: 10
            },
            color: {
                stylingType: 'stroke',
                strokeWidth: 0.01,
                drawingMode: 'lch',
                palette: ['#c4271b', '#045289', '#a5ea34', '#5534f6'],
                singleColor: '#FFFFFF',
                colorShift: {
                    enabled: true,
                    speed: 0.1,
                    offset: 0
                }
            },
            transform: {
                sequenceCount: 2000,
                baseScale: 0.7,
                scaleTransition: 1.002,
                baseRotation: 131,
                rotationTransition: -0.3,
                baseX: -2,
                baseY: -3,
                splitMask: 'vertical',
                trailDistance: 1.0,
                opacityFade: {
                    enabled: true,
                    startOpacity: 0.33,
                    endOpacity: 0.47,
                    fadeRate: 0.6
                }
            },
            animation: {
                scale: {
                    motionType: 'sin',
                    effectOrder: 'backward',
                    amplitude: 0.29,
                    frequency: 0.47,
                    speed: 0.01,
                    noiseSeed: 1
                },
                x: {
                    motionType: 'off',
                    effectOrder: 'equal',
                    amplitude: 50,
                    frequency: 1.0,
                    speed: 1.0,
                    noiseSeed: 2
                },
                y: {
                    motionType: 'off',
                    effectOrder: 'equal',
                    amplitude: 50,
                    frequency: 1.0,
                    speed: 1.0,
                    noiseSeed: 3
                },
                rotate: {
                    motionType: 'sin',
                    effectOrder: 'forward',
                    amplitude: 72,
                    frequency: 0.24,
                    speed: 0.68,
                    noiseSeed: 2513
                }
            },
            preset: {
                current: 'lotus',
                modified: false
            }
        };
    }

    /**
     * Get the complete current state
     */
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Get canvas-specific state
     */
    getCanvasState() {
        return { ...this.state.canvas };
    }

    /**
     * Get shape-specific state
     */
    getShapeState() {
        return { ...this.state.shape };
    }

    /**
     * Get color-specific state
     */
    getColorState() {
        return JSON.parse(JSON.stringify(this.state.color));
    }

    /**
     * Get transform-specific state
     */
    getTransformState() {
        return JSON.parse(JSON.stringify(this.state.transform));
    }

    /**
     * Get animation state for a specific property
     * @param {string} property - 'scale', 'x', 'y', or 'rotate'
     */
    getAnimationState(property) {
        if (!this.state.animation[property]) {
            console.warn(`Invalid animation property: ${property}`);
            return null;
        }
        return { ...this.state.animation[property] };
    }

    /**
     * Update state with new values
     * @param {object} updates - Partial state object with updates
     */
    setState(updates) {
        // Deep merge updates into current state
        this.state = this.deepMerge(this.state, updates);
        
        // Validate and clamp values
        this.state = this.validateState(this.state);
        
        // Mark preset as modified if not loading a preset
        if (!updates.preset?.current) {
            this.state.preset.modified = true;
        }
        
        // Notify subscribers
        this.notifySubscribers();
    }

    /**
     * Subscribe to state changes
     * @param {function} callback - Function to call when state changes
     * @returns {function} Unsubscribe function
     */
    subscribe(callback) {
        this.subscribers.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.subscribers.indexOf(callback);
            if (index > -1) {
                this.subscribers.splice(index, 1);
            }
        };
    }

    /**
     * Notify all subscribers of state change
     */
    notifySubscribers() {
        const state = this.getState();
        this.subscribers.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                console.error('Error in state subscriber:', error);
            }
        });
    }

    /**
     * Validate and clamp state values to valid ranges
     * @param {object} state - State object to validate
     * @returns {object} Validated state
     */
    validateState(state) {
        const validated = { ...state };

        // NO VALIDATION - LET DEVS PUSH THE LIMITS!
        // All clamps removed - values can be anything
        
        // Only keep essential validations (non-numeric)
        if (validated.color && validated.color.palette) {
            // Ensure palette has at least 1 color
            if (validated.color.palette.length < 1) {
                validated.color.palette = ['#FFFFFF'];
            }
        }
        
        // Round sequence count to integer
        if (validated.transform && validated.transform.sequenceCount) {
            validated.transform.sequenceCount = Math.floor(validated.transform.sequenceCount);
        }
        
        // Keep opacity fade values if they exist (but don't clamp)
        if (validated.transform && validated.transform.opacityFade) {
            // No clamping - let it go wild!
        }

        // Animation validation - NO CLAMPING
        // All animation values can be anything - push those limits!

        return validated;
    }

    /**
     * Clamp a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Deep merge two objects
     * @param {object} target - Target object
     * @param {object} source - Source object
     * @returns {object} Merged object
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * Reset state to defaults
     */
    reset() {
        this.state = this.getDefaultState();
        this.notifySubscribers();
    }
}
