// PresetLibrary.js
// Built-in preset definitions for the SVG Generative Art Tool

export class PresetLibrary {
    constructor() {
        this.presets = this.initializePresets();
    }

    /**
     * Initialize all built-in presets
     * @returns {object} Map of preset names to preset objects
     */
    initializePresets() {
        return {
            lotus: this.createLotusMetamorphosis(),
            starTrails: this.createStarTrails(),
            tunnel: this.createHypnoticTunnel(),
            mandala: this.createQuantumMandala()
        };
    }

    /**
     * Get a preset by name
     * @param {string} name - Preset name
     * @returns {object|null} Preset object or null if not found
     */
    getPreset(name) {
        return this.presets[name] || null;
    }

    /**
     * Get all preset names
     * @returns {string[]} Array of preset names
     */
    getPresetNames() {
        return Object.keys(this.presets);
    }

    /**
     * Get all presets
     * @returns {object} Map of all presets
     */
    getAllPresets() {
        return { ...this.presets };
    }

    /**
     * Lotus Metamorphosis - Intricate octagon wireframe with color shifting
     */
    createLotusMetamorphosis() {
        return {
            name: 'Lotus Metamorphosis',
            description: 'Intricate octagon wireframe with color shifting',
            state: {
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
                }
            }
        };
    }

    /**
     * Star Trails - Rotating star shapes with forward-flowing rotation animation
     */
    createStarTrails() {
        return {
            name: 'Star Trails',
            description: 'Rotating star shapes with forward-flowing rotation animation',
            state: {
                canvas: {
                    width: 1200,
                    height: 800,
                    backgroundColor: '#000814',
                    targetFPS: 60
                },
                shape: {
                    type: 'star',
                    customSVG: null,
                    size: 100
                },
                color: {
                    stylingType: 'stroke',
                    strokeWidth: 1.5,
                    drawingMode: 'rgb',
                    palette: ['#00f5ff', '#0096c7', '#023e8a', '#ffd60a', '#ffc300'],
                    singleColor: '#FFFFFF'
                },
                transform: {
                    sequenceCount: 200,
                    baseScale: 1.2,
                    scaleTransition: 0.975,
                    baseRotation: 0,
                    rotationTransition: 1.8,
                    baseX: 0,
                    baseY: 0,
                    splitMask: 'none',
                    trailDistance: 1.0,
                    opacityFade: {
                        enabled: true,
                        startOpacity: 1.0,
                        endOpacity: 0.1,
                        fadeRate: 1.0
                    }
                },
                animation: {
                    scale: {
                        motionType: 'off',
                        effectOrder: 'equal',
                        amplitude: 0.2,
                        frequency: 1.0,
                        speed: 1.0,
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
                        amplitude: 45,
                        frequency: 1.0,
                        speed: 1.2,
                        noiseSeed: 4
                    }
                }
            }
        };
    }

    /**
     * Hypnotic Tunnel - Classic tunnel effect with backward-flowing scale
     */
    createHypnoticTunnel() {
        return {
            name: 'Hypnotic Tunnel',
            description: 'Classic tunnel effect with backward-flowing scale',
            state: {
                canvas: {
                    width: 1200,
                    height: 800,
                    backgroundColor: '#000000',
                    targetFPS: 60
                },
                shape: {
                    type: 'square',
                    customSVG: null,
                    size: 100
                },
                color: {
                    stylingType: 'fill',
                    strokeWidth: 2,
                    drawingMode: 'sequence',
                    palette: ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff', '#8800ff'],
                    singleColor: '#FFFFFF'
                },
                transform: {
                    sequenceCount: 180,
                    baseScale: 1.5,
                    scaleTransition: 0.97,
                    baseRotation: 0,
                    rotationTransition: 2.0,
                    baseX: 0,
                    baseY: 0,
                    splitMask: 'none',
                    trailDistance: 1.0,
                    opacityFade: {
                        enabled: true,
                        startOpacity: 0.9,
                        endOpacity: 0.0,
                        fadeRate: 1.5
                    }
                },
                animation: {
                    scale: {
                        motionType: 'sin',
                        effectOrder: 'backward',
                        amplitude: 0.25,
                        frequency: 1.5,
                        speed: 1.5,
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
                        motionType: 'off',
                        effectOrder: 'equal',
                        amplitude: 30,
                        frequency: 1.0,
                        speed: 1.0,
                        noiseSeed: 4
                    }
                }
            }
        };
    }

    /**
     * Quantum Mandala - Quad split mask with complex multi-property animation
     */
    createQuantumMandala() {
        return {
            name: 'Quantum Mandala',
            description: 'Quad split mask with complex multi-property animation',
            state: {
                canvas: {
                    width: 1200,
                    height: 800,
                    backgroundColor: '#0d1b2a',
                    targetFPS: 60
                },
                shape: {
                    type: 'triangle',
                    customSVG: null,
                    size: 100
                },
                color: {
                    stylingType: 'fill',
                    strokeWidth: 2,
                    drawingMode: 'lch',
                    palette: ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557'],
                    singleColor: '#FFFFFF'
                },
                transform: {
                    sequenceCount: 120,
                    baseScale: 0.6,
                    scaleTransition: 0.99,
                    baseRotation: 0,
                    rotationTransition: 3.0,
                    baseX: 0,
                    baseY: 0,
                    splitMask: 'quad',
                    trailDistance: 1.0,
                    opacityFade: {
                        enabled: true,
                        startOpacity: 1.0,
                        endOpacity: 0.3,
                        fadeRate: 1.0
                    }
                },
                animation: {
                    scale: {
                        motionType: 'noise',
                        effectOrder: 'forward',
                        amplitude: 0.4,
                        frequency: 0.8,
                        speed: 0.6,
                        noiseSeed: 42
                    },
                    x: {
                        motionType: 'sin',
                        effectOrder: 'equal',
                        amplitude: 30,
                        frequency: 2.0,
                        speed: 0.8,
                        noiseSeed: 2
                    },
                    y: {
                        motionType: 'sin',
                        effectOrder: 'equal',
                        amplitude: 30,
                        frequency: 1.5,
                        speed: 1.0,
                        noiseSeed: 3
                    },
                    rotate: {
                        motionType: 'noise',
                        effectOrder: 'backward',
                        amplitude: 60,
                        frequency: 0.5,
                        speed: 0.7,
                        noiseSeed: 99
                    }
                }
            }
        };
    }

}
