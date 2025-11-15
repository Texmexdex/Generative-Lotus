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

        // Canvas validation
        if (validated.canvas) {
            validated.canvas.width = this.clamp(validated.canvas.width, 800, 4000);
            validated.canvas.height = this.clamp(validated.canvas.height, 600, 3000);
            validated.canvas.targetFPS = this.clamp(validated.canvas.targetFPS, 30, 120);
            validated.canvas.cameraZoom = this.clamp(validated.canvas.cameraZoom, 0.1, 5.0);
        }

        // Shape validation
        if (validated.shape) {
            validated.shape.size = this.clamp(validated.shape.size, 10, 500);
        }

        // Color validation
        if (validated.color) {
            validated.color.strokeWidth = this.clamp(validated.color.strokeWidth, 0.01, 1.0);
            
            // Ensure palette has at least 1 color and max 10
            if (validated.color.palette) {
                if (validated.color.palette.length < 1) {
                    validated.color.palette = ['#FFFFFF'];
                } else if (validated.color.palette.length > 10) {
                    validated.color.palette = validated.color.palette.slice(0, 10);
                }
            }
            
            // Color shift validation
            if (validated.color.colorShift) {
                validated.color.colorShift.speed = this.clamp(validated.color.colorShift.speed, 0.1, 5.0);
            }
        }

        // Transform validation
        if (validated.transform) {
            validated.transform.sequenceCount = Math.floor(this.clamp(validated.transform.sequenceCount, 0, 2000));
            validated.transform.baseScale = this.clamp(validated.transform.baseScale, 0.1, 3.0);
            validated.transform.scaleTransition = this.clamp(validated.transform.scaleTransition, 0.9, 1.1);
            validated.transform.baseRotation = this.clamp(validated.transform.baseRotation, 0, 360);
            validated.transform.rotationTransition = this.clamp(validated.transform.rotationTransition, -10, 10);
            validated.transform.baseX = this.clamp(validated.transform.baseX, -200, 200);
            validated.transform.baseY = this.clamp(validated.transform.baseY, -200, 200);
            validated.transform.trailDistance = this.clamp(validated.transform.trailDistance, 0.1, 5.0);
            
            if (validated.transform.opacityFade) {
                validated.transform.opacityFade.startOpacity = this.clamp(validated.transform.opacityFade.startOpacity, 0, 1);
                validated.transform.opacityFade.endOpacity = this.clamp(validated.transform.opacityFade.endOpacity, 0, 1);
                validated.transform.opacityFade.fadeRate = this.clamp(validated.transform.opacityFade.fadeRate, 0.1, 3.0);
            }
        }

        // Animation validation
        if (validated.animation) {
            // Validate scale animation
            if (validated.animation.scale) {
                validated.animation.scale.amplitude = this.clamp(validated.animation.scale.amplitude, 0, 1.0);
                validated.animation.scale.frequency = this.clamp(validated.animation.scale.frequency, 0.01, 2.0);
                validated.animation.scale.speed = this.clamp(validated.animation.scale.speed, 0.01, 2.0);
            }
            
            // Validate x animation
            if (validated.animation.x) {
                validated.animation.x.amplitude = this.clamp(validated.animation.x.amplitude, 0, 100);
                validated.animation.x.frequency = this.clamp(validated.animation.x.frequency, 0.01, 2.0);
                validated.animation.x.speed = this.clamp(validated.animation.x.speed, 0.01, 2.0);
            }
            
            // Validate y animation
            if (validated.animation.y) {
                validated.animation.y.amplitude = this.clamp(validated.animation.y.amplitude, 0, 100);
                validated.animation.y.frequency = this.clamp(validated.animation.y.frequency, 0.01, 2.0);
                validated.animation.y.speed = this.clamp(validated.animation.y.speed, 0.01, 2.0);
            }
            
            // Validate rotate animation
            if (validated.animation.rotate) {
                validated.animation.rotate.amplitude = this.clamp(validated.animation.rotate.amplitude, 0, 90);
                validated.animation.rotate.frequency = this.clamp(validated.animation.rotate.frequency, 0.01, 2.0);
                validated.animation.rotate.speed = this.clamp(validated.animation.rotate.speed, 0.01, 2.0);
            }
        }

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
