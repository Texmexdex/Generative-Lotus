// AudioTriggerSystem.js
// Handles audio-triggered discrete events (shape changes, palette randomization, etc.)

export class AudioTriggerSystem {
    constructor(stateManager, audioAnalyzer) {
        this.stateManager = stateManager;
        this.audioAnalyzer = audioAnalyzer;
        
        // Trigger configurations
        this.triggers = [];
        
        // Beat counting
        this.beatCount = 0;
        this.lastBeatTime = 0;
        
        // Threshold tracking (for crossing detection)
        this.lastValues = {
            volume: 0,
            bass: 0,
            mids: 0,
            treble: 0,
            rms: 0
        };
        
        // Available trigger types
        this.triggerTypes = [
            { id: 'beat', name: 'On Beat' },
            { id: 'everyNBeats', name: 'Every N Beats' },
            { id: 'volumePeak', name: 'Volume Peak' },
            { id: 'thresholdAbove', name: 'Threshold Above' },
            { id: 'thresholdBelow', name: 'Threshold Below' },
            { id: 'thresholdCrossUp', name: 'Crosses Up' },
            { id: 'thresholdCrossDown', name: 'Crosses Down' }
        ];
        
        // Available actions
        this.actions = [
            { id: 'nextShape', name: 'Next Shape', category: 'shape' },
            { id: 'randomShape', name: 'Random Shape', category: 'shape' },
            { id: 'randomPalette', name: 'Random Palette', category: 'color' },
            { id: 'nextDrawingMode', name: 'Next Drawing Mode', category: 'color' },
            { id: 'toggleStyling', name: 'Toggle Fill/Stroke', category: 'color' },
            { id: 'nextSplitMask', name: 'Next Split Mask', category: 'transform' },
            { id: 'randomSplitMask', name: 'Random Split Mask', category: 'transform' },
            { id: 'nextAnimationMode', name: 'Next Animation Mode', category: 'animation' },
            { id: 'randomAnimationMode', name: 'Random Animation Mode', category: 'animation' },
            { id: 'toggleColorShift', name: 'Toggle Color Shift', category: 'color' },
            { id: 'increaseSequence', name: 'Increase Sequence +100', category: 'transform' },
            { id: 'decreaseSequence', name: 'Decrease Sequence -100', category: 'transform' },
            { id: 'resetCamera', name: 'Reset Camera', category: 'canvas' }
        ];
        
        // Audio variables for threshold triggers
        this.audioVariables = [
            'volume', 'bass', 'mids', 'treble', 'subBass', 
            'lowMids', 'highMids', 'presence', 'brilliance', 'rms', 'peak'
        ];
        
        // Shape list for cycling
        this.shapes = [
            'circle', 'square', 'triangle', 'star', 'pentagon', 'hexagon', 
            'octagon', 'diamond', 'heart', 'crescent', 'cross', 'ring',
            'tetrahedron', 'cube', 'octahedron', 'dodecahedron', 'icosahedron',
            'pyramid', 'torus', 'doublehelix'
        ];
        
        // Drawing modes for cycling
        this.drawingModes = ['single', 'sequence', 'rgb', 'lch'];
        
        // Split masks for cycling
        this.splitMasks = ['none', 'horizontal', 'vertical', 'quad', 'alternating', 'mirrorScale', 'mirrorRotation', 'mirrorOpacity', 'mirrorColor', 'mirrorBoth', 'mirrorAll', 'quantumXOR', 'quantumAND', 'quantumSubtract'];
        
        // Animation motion types
        this.motionTypes = ['off', 'sin', 'noise'];
    }

    /**
     * Add a new trigger
     */
    addTrigger(config) {
        const trigger = {
            id: Date.now() + Math.random(),
            enabled: true,
            type: config.type || 'beat',
            action: config.action || 'randomPalette',
            
            // For everyNBeats
            beatInterval: config.beatInterval || 4,
            
            // For threshold triggers
            audioVariable: config.audioVariable || 'volume',
            threshold: config.threshold || 0.5,
            
            // For peak detection
            peakSensitivity: config.peakSensitivity || 0.8,
            
            // Cooldown (ms) to prevent rapid re-triggering
            cooldown: config.cooldown || 200,
            lastTriggerTime: 0
        };
        
        this.triggers.push(trigger);
        console.log('Added audio trigger:', trigger);
        return trigger.id;
    }

    /**
     * Remove a trigger
     */
    removeTrigger(triggerId) {
        this.triggers = this.triggers.filter(t => t.id !== triggerId);
    }

    /**
     * Update trigger configuration
     */
    updateTrigger(triggerId, updates) {
        const trigger = this.triggers.find(t => t.id === triggerId);
        if (trigger) {
            Object.assign(trigger, updates);
        }
    }

    /**
     * Get all triggers
     */
    getTriggers() {
        return this.triggers;
    }

    /**
     * Main update loop - check all triggers
     */
    update() {
        if (!this.audioAnalyzer.isAnalyzing()) {
            return;
        }
        
        const audioData = this.audioAnalyzer.getData();
        const currentTime = Date.now();
        
        // Update beat count
        if (audioData.beatDetected && currentTime - this.lastBeatTime > 200) {
            this.beatCount++;
            this.lastBeatTime = currentTime;
        }
        
        // Check each trigger
        this.triggers.forEach(trigger => {
            if (!trigger.enabled) return;
            
            // Check cooldown
            if (currentTime - trigger.lastTriggerTime < trigger.cooldown) {
                return;
            }
            
            // Check trigger condition
            let shouldTrigger = false;
            
            switch (trigger.type) {
                case 'beat':
                    shouldTrigger = audioData.beatDetected;
                    break;
                    
                case 'everyNBeats':
                    if (audioData.beatDetected) {
                        shouldTrigger = (this.beatCount % trigger.beatInterval) === 0;
                    }
                    break;
                    
                case 'volumePeak':
                    const isPeak = audioData.volume > trigger.peakSensitivity && 
                                   audioData.volume > this.lastValues.volume * 1.2;
                    shouldTrigger = isPeak;
                    break;
                    
                case 'thresholdAbove':
                    const value = audioData[trigger.audioVariable] || 0;
                    shouldTrigger = value > trigger.threshold;
                    break;
                    
                case 'thresholdBelow':
                    const valueLow = audioData[trigger.audioVariable] || 0;
                    shouldTrigger = valueLow < trigger.threshold;
                    break;
                    
                case 'thresholdCrossUp':
                    const currentUp = audioData[trigger.audioVariable] || 0;
                    const lastUp = this.lastValues[trigger.audioVariable] || 0;
                    shouldTrigger = currentUp > trigger.threshold && lastUp <= trigger.threshold;
                    break;
                    
                case 'thresholdCrossDown':
                    const currentDown = audioData[trigger.audioVariable] || 0;
                    const lastDown = this.lastValues[trigger.audioVariable] || 0;
                    shouldTrigger = currentDown < trigger.threshold && lastDown >= trigger.threshold;
                    break;
            }
            
            // Execute action if triggered
            if (shouldTrigger) {
                this.executeAction(trigger.action);
                trigger.lastTriggerTime = currentTime;
            }
        });
        
        // Update last values for next frame
        this.lastValues = {
            volume: audioData.volume,
            bass: audioData.bass,
            mids: audioData.mids,
            treble: audioData.treble,
            rms: audioData.rms
        };
    }

    /**
     * Execute a trigger action
     */
    executeAction(actionId) {
        const state = this.stateManager.getState();
        
        switch (actionId) {
            case 'nextShape':
                this.cycleShape(1);
                break;
                
            case 'randomShape':
                this.setRandomShape();
                break;
                
            case 'randomPalette':
                this.randomizePalette();
                break;
                
            case 'nextDrawingMode':
                this.cycleDrawingMode(1);
                break;
                
            case 'toggleStyling':
                state.color.stylingType = state.color.stylingType === 'fill' ? 'stroke' : 'fill';
                this.stateManager.setState(state);
                break;
                
            case 'nextSplitMask':
                this.cycleSplitMask(1);
                break;
                
            case 'randomSplitMask':
                this.setRandomSplitMask();
                break;
                
            case 'nextAnimationMode':
                this.cycleAnimationMode('scale', 1);
                break;
                
            case 'randomAnimationMode':
                this.setRandomAnimationMode('scale');
                break;
                
            case 'toggleColorShift':
                if (!state.color.colorShift) {
                    state.color.colorShift = { enabled: false, speed: 1, offset: 0 };
                }
                state.color.colorShift.enabled = !state.color.colorShift.enabled;
                this.stateManager.setState(state);
                break;
                
            case 'increaseSequence':
                state.transform.sequenceCount = Math.min(10000, state.transform.sequenceCount + 100);
                this.stateManager.setState(state);
                break;
                
            case 'decreaseSequence':
                state.transform.sequenceCount = Math.max(10, state.transform.sequenceCount - 100);
                this.stateManager.setState(state);
                break;
                
            case 'resetCamera':
                state.canvas.cameraZoom = 1;
                state.canvas.cameraX = 0;
                state.canvas.cameraY = 0;
                this.stateManager.setState(state);
                break;
        }
        
        console.log(`Executed action: ${actionId}`);
    }

    /**
     * Cycle through shapes
     */
    cycleShape(direction = 1) {
        const state = this.stateManager.getState();
        const currentIndex = this.shapes.indexOf(state.shape.type);
        const newIndex = (currentIndex + direction + this.shapes.length) % this.shapes.length;
        state.shape.type = this.shapes[newIndex];
        this.stateManager.setState(state);
    }

    /**
     * Set random shape
     */
    setRandomShape() {
        const state = this.stateManager.getState();
        const randomIndex = Math.floor(Math.random() * this.shapes.length);
        state.shape.type = this.shapes[randomIndex];
        this.stateManager.setState(state);
    }

    /**
     * Randomize color palette
     */
    randomizePalette() {
        const state = this.stateManager.getState();
        const numColors = 3 + Math.floor(Math.random() * 3); // 3-5 colors
        const palette = [];
        
        for (let i = 0; i < numColors; i++) {
            const hue = Math.floor(Math.random() * 360);
            const sat = 50 + Math.floor(Math.random() * 50);
            const light = 40 + Math.floor(Math.random() * 40);
            palette.push(`hsl(${hue}, ${sat}%, ${light}%)`);
        }
        
        state.color.palette = palette;
        this.stateManager.setState(state);
    }

    /**
     * Cycle through drawing modes
     */
    cycleDrawingMode(direction = 1) {
        const state = this.stateManager.getState();
        const currentIndex = this.drawingModes.indexOf(state.color.drawingMode);
        const newIndex = (currentIndex + direction + this.drawingModes.length) % this.drawingModes.length;
        state.color.drawingMode = this.drawingModes[newIndex];
        this.stateManager.setState(state);
    }

    /**
     * Cycle through split masks
     */
    cycleSplitMask(direction = 1) {
        const state = this.stateManager.getState();
        const currentIndex = this.splitMasks.indexOf(state.transform.splitMask);
        const newIndex = (currentIndex + direction + this.splitMasks.length) % this.splitMasks.length;
        state.transform.splitMask = this.splitMasks[newIndex];
        this.stateManager.setState(state);
    }

    /**
     * Set random split mask
     */
    setRandomSplitMask() {
        const state = this.stateManager.getState();
        const randomIndex = Math.floor(Math.random() * this.splitMasks.length);
        state.transform.splitMask = this.splitMasks[randomIndex];
        this.stateManager.setState(state);
    }

    /**
     * Cycle animation mode for a property
     */
    cycleAnimationMode(property, direction = 1) {
        const state = this.stateManager.getState();
        if (!state.animation[property]) return;
        
        const currentIndex = this.motionTypes.indexOf(state.animation[property].motionType);
        const newIndex = (currentIndex + direction + this.motionTypes.length) % this.motionTypes.length;
        state.animation[property].motionType = this.motionTypes[newIndex];
        this.stateManager.setState(state);
    }

    /**
     * Set random animation mode
     */
    setRandomAnimationMode(property) {
        const state = this.stateManager.getState();
        if (!state.animation[property]) return;
        
        const randomIndex = Math.floor(Math.random() * this.motionTypes.length);
        state.animation[property].motionType = this.motionTypes[randomIndex];
        this.stateManager.setState(state);
    }

    /**
     * Reset beat counter
     */
    resetBeatCount() {
        this.beatCount = 0;
    }

    /**
     * Get available trigger types
     */
    getTriggerTypes() {
        return this.triggerTypes;
    }

    /**
     * Get available actions
     */
    getActions() {
        return this.actions;
    }

    /**
     * Get available audio variables
     */
    getAudioVariables() {
        return this.audioVariables;
    }
}
