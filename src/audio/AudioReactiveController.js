// AudioReactiveController.js
// Maps audio analysis data to visual parameters with configurable ranges

export class AudioReactiveController {
    constructor(stateManager, audioAnalyzer, rangeInputEnhancer = null) {
        this.stateManager = stateManager;
        this.audioAnalyzer = audioAnalyzer;
        this.rangeInputEnhancer = rangeInputEnhancer;
        
        // Available audio variables
        this.audioVariables = [
            'none',
            'volume',
            'bass',
            'mids',
            'treble',
            'subBass',
            'lowMids',
            'highMids',
            'presence',
            'brilliance',
            'rms',
            'peak',
            'beat'
        ];
        
        // Available parameters to control
        this.parameters = [
            { id: 'baseScale', name: 'Scale', min: 0.1, max: 3, default: 1 },
            { id: 'baseRotation', name: 'Rotation', min: 0, max: 360, default: 0 },
            { id: 'rotationTransition', name: 'Rotation Speed', min: -10, max: 10, default: 2 },
            { id: 'baseX', name: 'X Position', min: -200, max: 200, default: 0 },
            { id: 'baseY', name: 'Y Position', min: -200, max: 200, default: 0 },
            { id: 'shapeSize', name: 'Shape Size', min: 10, max: 200, default: 100 },
            { id: 'sequenceCount', name: 'Sequence Count', min: 10, max: 2000, default: 100 },
            { id: 'colorShiftSpeed', name: 'Color Shift Speed', min: 0.1, max: 5, default: 1 },
            { id: 'scaleTransition', name: 'Scale Transition', min: 0.9, max: 1.1, default: 0.98 },
            { id: 'cameraZoom', name: 'Camera Zoom', min: 0.1, max: 5, default: 1 },
            { id: 'startOpacity', name: 'Start Opacity', min: 0, max: 1, default: 1 },
            { id: 'endOpacity', name: 'End Opacity', min: 0, max: 1, default: 0.1 },
            { id: 'scaleAmplitude', name: 'Scale Animation Amplitude', min: 0, max: 1, default: 0.2 },
            { id: 'scaleSpeed', name: 'Scale Animation Speed', min: 0.01, max: 2, default: 1 },
            { id: 'xAmplitude', name: 'X Animation Amplitude', min: 0, max: 100, default: 50 },
            { id: 'yAmplitude', name: 'Y Animation Amplitude', min: 0, max: 100, default: 50 },
            { id: 'rotateAmplitude', name: 'Rotate Animation Amplitude', min: 0, max: 90, default: 30 }
        ];
        
        // Mapping configuration: { parameter: { audioVar, min, max, enabled } }
        this.mappings = this.getDefaultMappings();
        
        // Store base values (values without audio modulation)
        this.baseValues = {};
        this.saveBaseValues();
    }

    /**
     * Get default mappings (all disabled)
     */
    getDefaultMappings() {
        const mappings = {};
        this.parameters.forEach(param => {
            mappings[param.id] = {
                audioVar: 'none',
                min: param.min,
                max: param.max,
                influence: 1.0, // 0-1, how much audio affects the parameter
                enabled: false
            };
        });
        return mappings;
    }

    /**
     * Save current state values as base values
     */
    saveBaseValues() {
        const state = this.stateManager.getState();
        
        this.baseValues = {
            baseScale: state.transform.baseScale,
            baseRotation: state.transform.baseRotation,
            rotationTransition: state.transform.rotationTransition,
            baseX: state.transform.baseX,
            baseY: state.transform.baseY,
            shapeSize: state.shape.size,
            sequenceCount: state.transform.sequenceCount,
            colorShiftSpeed: state.color.colorShift?.speed || 1,
            scaleTransition: state.transform.scaleTransition,
            cameraZoom: state.canvas.cameraZoom,
            startOpacity: state.transform.opacityFade?.startOpacity || 1,
            endOpacity: state.transform.opacityFade?.endOpacity || 0.1,
            scaleAmplitude: state.animation.scale.amplitude,
            scaleSpeed: state.animation.scale.speed,
            xAmplitude: state.animation.x.amplitude,
            yAmplitude: state.animation.y.amplitude,
            rotateAmplitude: state.animation.rotate.amplitude
        };
    }

    /**
     * Update all mapped parameters based on current audio data
     */
    update() {
        if (!this.audioAnalyzer.isAnalyzing()) {
            return;
        }
        
        const audioData = this.audioAnalyzer.analyze();
        
        // Update each mapped parameter
        for (const [paramId, mapping] of Object.entries(this.mappings)) {
            if (!mapping.enabled || mapping.audioVar === 'none') {
                continue;
            }
            
            // Get audio value
            let audioValue = audioData[mapping.audioVar] || 0;
            
            // Special handling for beat (it's boolean)
            if (mapping.audioVar === 'beat') {
                audioValue = audioData.beatDetected ? 1 : 0;
            }
            
            // Get base value
            const baseValue = this.baseValues[paramId] || 0;
            
            // Calculate modulated value
            const range = mapping.max - mapping.min;
            const offset = (audioValue * range * mapping.influence);
            let newValue = baseValue + offset;
            
            // Clamp to min/max
            newValue = Math.max(mapping.min, Math.min(mapping.max, newValue));
            
            // Apply to state
            this.applyParameterValue(paramId, newValue);
        }
    }

    /**
     * Apply a parameter value to the state
     */
    applyParameterValue(paramId, value) {
        const state = this.stateManager.getState();
        
        // Map parameter IDs to state paths
        switch (paramId) {
            case 'baseScale':
                state.transform.baseScale = value;
                break;
            case 'baseRotation':
                state.transform.baseRotation = value;
                break;
            case 'rotationTransition':
                state.transform.rotationTransition = value;
                break;
            case 'baseX':
                state.transform.baseX = value;
                break;
            case 'baseY':
                state.transform.baseY = value;
                break;
            case 'shapeSize':
                state.shape.size = value;
                break;
            case 'sequenceCount':
                state.transform.sequenceCount = Math.round(value);
                break;
            case 'colorShiftSpeed':
                if (!state.color.colorShift) state.color.colorShift = { enabled: false, speed: 1, offset: 0 };
                state.color.colorShift.speed = value;
                break;
            case 'scaleTransition':
                state.transform.scaleTransition = value;
                break;
            case 'cameraZoom':
                state.canvas.cameraZoom = value;
                break;
            case 'startOpacity':
                if (!state.transform.opacityFade) state.transform.opacityFade = { enabled: true, startOpacity: 1, endOpacity: 0.1, fadeRate: 1 };
                state.transform.opacityFade.startOpacity = value;
                break;
            case 'endOpacity':
                if (!state.transform.opacityFade) state.transform.opacityFade = { enabled: true, startOpacity: 1, endOpacity: 0.1, fadeRate: 1 };
                state.transform.opacityFade.endOpacity = value;
                break;
            case 'scaleAmplitude':
                state.animation.scale.amplitude = value;
                break;
            case 'scaleSpeed':
                state.animation.scale.speed = value;
                break;
            case 'xAmplitude':
                state.animation.x.amplitude = value;
                break;
            case 'yAmplitude':
                state.animation.y.amplitude = value;
                break;
            case 'rotateAmplitude':
                state.animation.rotate.amplitude = value;
                break;
        }
        
        // Notify state change (but don't trigger full UI update to avoid feedback loops)
        this.stateManager.setState(state, false);
    }

    /**
     * Set range input enhancer reference (to get custom ranges)
     */
    setRangeInputEnhancer(enhancer) {
        this.rangeInputEnhancer = enhancer;
    }

    /**
     * Get the current range for a parameter (uses custom range if set)
     */
    getParameterRange(paramId) {
        // Try to get custom range from RangeInputEnhancer
        if (this.rangeInputEnhancer) {
            const customRange = this.rangeInputEnhancer.getCustomRange(paramId);
            if (customRange) {
                return customRange;
            }
        }
        
        // Fall back to default range from parameters list
        const param = this.parameters.find(p => p.id === paramId);
        if (param) {
            return { min: param.min, max: param.max };
        }
        
        return { min: 0, max: 1 };
    }

    /**
     * Set mapping for a parameter
     */
    setMapping(paramId, audioVar, min = null, max = null, influence = 1.0) {
        if (!this.mappings[paramId]) {
            console.warn(`Unknown parameter: ${paramId}`);
            return;
        }
        
        // If min/max not provided, use current parameter range
        if (min === null || max === null) {
            const range = this.getParameterRange(paramId);
            min = min ?? range.min;
            max = max ?? range.max;
        }
        
        this.mappings[paramId] = {
            audioVar,
            min,
            max,
            influence: Math.max(0, Math.min(1, influence)),
            enabled: audioVar !== 'none'
        };
        
        console.log(`Mapped ${paramId} to ${audioVar} (${min} - ${max}, influence: ${influence})`);
    }

    /**
     * Update mapping ranges based on current slider ranges
     */
    updateMappingRanges() {
        if (!this.rangeInputEnhancer) return;
        
        for (const [paramId, mapping] of Object.entries(this.mappings)) {
            if (mapping.enabled) {
                const range = this.getParameterRange(paramId);
                mapping.min = range.min;
                mapping.max = range.max;
            }
        }
        
        console.log('Updated audio mapping ranges from slider settings');
    }

    /**
     * Enable/disable a mapping
     */
    toggleMapping(paramId, enabled) {
        if (this.mappings[paramId]) {
            this.mappings[paramId].enabled = enabled;
        }
    }

    /**
     * Get current mapping for a parameter
     */
    getMapping(paramId) {
        return this.mappings[paramId];
    }

    /**
     * Get all mappings
     */
    getAllMappings() {
        return this.mappings;
    }

    /**
     * Get available audio variables
     */
    getAudioVariables() {
        return this.audioVariables;
    }

    /**
     * Get available parameters
     */
    getParameters() {
        return this.parameters;
    }

    /**
     * Reset all mappings
     */
    resetMappings() {
        this.mappings = this.getDefaultMappings();
        console.log('All audio mappings reset');
    }

    /**
     * Load mappings from preset
     */
    loadMappings(mappings) {
        this.mappings = { ...this.getDefaultMappings(), ...mappings };
        console.log('Audio mappings loaded');
    }

    /**
     * Export mappings for saving
     */
    exportMappings() {
        return JSON.parse(JSON.stringify(this.mappings));
    }
}
