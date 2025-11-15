// ControlPanel.js
// UI management for all control panel elements

export class ControlPanel {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.elements = {};
        this.valueDisplays = new Map();
        this.presetManager = null; // Will be set externally
        this.importExport = null; // Will be set externally
        
        this.initializeElements();
        this.bindEventListeners();
        this.updateUIFromState();
    }

    /**
     * Set preset manager reference
     */
    setPresetManager(presetManager) {
        this.presetManager = presetManager;
    }

    /**
     * Set import/export handler reference
     */
    setImportExport(importExport) {
        this.importExport = importExport;
    }

    /**
     * Initialize all control elements
     */
    initializeElements() {
        // Preset controls
        this.elements.presetList = document.getElementById('presetList');
        this.elements.restartPreset = document.getElementById('restartPreset');
        this.elements.exportPreset = document.getElementById('exportPreset');
        this.elements.exportSVG = document.getElementById('exportSVG');
        this.elements.exportPNG = document.getElementById('exportPNG');
        this.elements.importPreset = document.getElementById('importPreset');
        this.elements.importFile = document.getElementById('importFile');

        // Canvas controls
        this.elements.bgColor = document.getElementById('bgColor');
        this.elements.cameraZoom = document.getElementById('cameraZoom');
        this.elements.resetCamera = document.getElementById('resetCamera');

        // Shape controls
        this.elements.shapeType = document.getElementById('shapeType');
        this.elements.svgFile = document.getElementById('svgFile');

        // Color controls
        this.elements.stylingType = document.getElementById('stylingType');
        this.elements.strokeWidth = document.getElementById('strokeWidth');
        this.elements.drawingMode = document.getElementById('drawingMode');
        this.elements.colorPreset = document.getElementById('colorPreset');
        this.elements.randomPalette = document.getElementById('randomPalette');
        this.elements.colorShiftEnabled = document.getElementById('colorShiftEnabled');
        this.elements.colorShiftSpeed = document.getElementById('colorShiftSpeed');

        // Transform controls
        this.elements.splitMask = document.getElementById('splitMask');
        this.elements.sequenceCount = document.getElementById('sequenceCount');
        this.elements.shapeSize = document.getElementById('shapeSize');
        this.elements.baseScale = document.getElementById('baseScale');
        this.elements.scaleTransition = document.getElementById('scaleTransition');
        this.elements.baseRotation = document.getElementById('baseRotation');
        this.elements.rotationTransition = document.getElementById('rotationTransition');
        this.elements.baseX = document.getElementById('baseX');
        this.elements.baseY = document.getElementById('baseY');

        // Opacity controls
        this.elements.opacityFadeEnabled = document.getElementById('opacityFadeEnabled');
        this.elements.startOpacity = document.getElementById('startOpacity');
        this.elements.endOpacity = document.getElementById('endOpacity');
        this.elements.fadeRate = document.getElementById('fadeRate');

        // Animation controls (by property)
        this.elements.animation = {
            scale: this.getAnimationElements('scale'),
            x: this.getAnimationElements('x'),
            y: this.getAnimationElements('y'),
            rotate: this.getAnimationElements('rotate')
        };
    }

    /**
     * Get animation control elements for a specific property
     */
    getAnimationElements(property) {
        return {
            motionType: document.querySelector(`.motionType[data-prop="${property}"]`),
            effectOrder: document.querySelector(`.effectOrder[data-prop="${property}"]`),
            amplitude: document.querySelector(`.amplitude[data-prop="${property}"]`),
            frequency: document.querySelector(`.frequency[data-prop="${property}"]`),
            speed: document.querySelector(`.speed[data-prop="${property}"]`),
            noiseSeed: document.querySelector(`.noiseSeed[data-prop="${property}"]`),
            randomAnim: document.querySelector(`.randomAnim[data-prop="${property}"]`)
        };
    }

    /**
     * Bind event listeners to all controls
     */
    bindEventListeners() {
        // Preset controls
        if (this.elements.presetList) {
            this.elements.presetList.addEventListener('change', (e) => {
                const presetName = e.target.value;
                if (presetName && this.presetManager) {
                    this.presetManager.loadPreset(presetName);
                }
            });
        }

        if (this.elements.restartPreset) {
            this.elements.restartPreset.addEventListener('click', () => {
                if (this.presetManager) {
                    this.presetManager.restartPreset();
                }
            });
        }

        if (this.elements.exportPreset) {
            this.elements.exportPreset.addEventListener('click', () => {
                if (this.importExport) {
                    this.importExport.downloadJSON();
                }
            });
        }

        if (this.elements.exportSVG) {
            this.elements.exportSVG.addEventListener('click', () => {
                if (this.importExport) {
                    const canvas = document.getElementById('canvas');
                    this.importExport.exportToSVG(canvas);
                }
            });
        }

        if (this.elements.exportPNG) {
            this.elements.exportPNG.addEventListener('click', () => {
                if (this.importExport) {
                    const canvas = document.getElementById('canvas');
                    this.importExport.exportToPNG(canvas);
                }
            });
        }

        if (this.elements.importPreset) {
            this.elements.importPreset.addEventListener('click', () => {
                if (this.elements.importFile) {
                    this.elements.importFile.click();
                }
            });
        }

        if (this.elements.importFile) {
            this.elements.importFile.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file && this.importExport) {
                    const result = await this.importExport.importFromFile(file);
                    if (result.success) {
                        console.log('Import successful:', result.message);
                        // Reset file input
                        e.target.value = '';
                    } else {
                        console.error('Import failed:', result.message);
                        alert(result.message);
                    }
                }
            });
        }

        // Canvas controls
        if (this.elements.bgColor) {
            this.elements.bgColor.addEventListener('input', (e) => {
                this.stateManager.setState({
                    canvas: { backgroundColor: e.target.value }
                });
            });
        }

        if (this.elements.cameraZoom) {
            this.addRangeListener(this.elements.cameraZoom, (value) => {
                this.stateManager.setState({
                    canvas: { cameraZoom: parseFloat(value) }
                });
            });
        }

        if (this.elements.resetCamera) {
            this.elements.resetCamera.addEventListener('click', () => {
                this.stateManager.setState({
                    canvas: { 
                        cameraZoom: 1.0,
                        cameraX: 0,
                        cameraY: 0
                    }
                });
            });
        }

        // Shape controls
        if (this.elements.shapeType) {
            this.elements.shapeType.addEventListener('change', (e) => {
                const shapeType = e.target.value;
                this.stateManager.setState({
                    shape: { type: shapeType }
                });
                
                // Show file input for custom SVG
                if (shapeType === 'custom' && this.elements.svgFile) {
                    this.elements.svgFile.click();
                }
            });
        }

        // Color controls
        if (this.elements.stylingType) {
            this.elements.stylingType.addEventListener('change', (e) => {
                this.stateManager.setState({
                    color: { stylingType: e.target.value }
                });
            });
        }

        if (this.elements.strokeWidth) {
            this.addRangeListener(this.elements.strokeWidth, (value) => {
                this.stateManager.setState({
                    color: { strokeWidth: parseFloat(value) }
                });
            });
        }

        if (this.elements.drawingMode) {
            this.elements.drawingMode.addEventListener('change', (e) => {
                this.stateManager.setState({
                    color: { drawingMode: e.target.value }
                });
            });
        }

        if (this.elements.colorShiftEnabled) {
            this.elements.colorShiftEnabled.addEventListener('change', (e) => {
                this.stateManager.setState({
                    color: { 
                        colorShift: { enabled: e.target.checked }
                    }
                });
            });
        }

        if (this.elements.colorShiftSpeed) {
            this.addRangeListener(this.elements.colorShiftSpeed, (value) => {
                this.stateManager.setState({
                    color: { 
                        colorShift: { speed: parseFloat(value) }
                    }
                });
            });
        }

        // Transform controls
        if (this.elements.splitMask) {
            this.elements.splitMask.addEventListener('change', (e) => {
                this.stateManager.setState({
                    transform: { splitMask: e.target.value }
                });
            });
        }

        if (this.elements.sequenceCount) {
            this.addRangeListener(this.elements.sequenceCount, (value) => {
                this.stateManager.setState({
                    transform: { sequenceCount: parseInt(value) }
                });
            });
        }

        if (this.elements.baseScale) {
            this.addRangeListener(this.elements.baseScale, (value) => {
                this.stateManager.setState({
                    transform: { baseScale: parseFloat(value) }
                });
            });
        }

        if (this.elements.scaleTransition) {
            this.addRangeListener(this.elements.scaleTransition, (value) => {
                this.stateManager.setState({
                    transform: { scaleTransition: parseFloat(value) }
                });
            });
        }

        if (this.elements.baseRotation) {
            this.addRangeListener(this.elements.baseRotation, (value) => {
                this.stateManager.setState({
                    transform: { baseRotation: parseFloat(value) }
                });
            });
        }

        if (this.elements.rotationTransition) {
            this.addRangeListener(this.elements.rotationTransition, (value) => {
                this.stateManager.setState({
                    transform: { rotationTransition: parseFloat(value) }
                });
            });
        }

        if (this.elements.shapeSize) {
            this.addRangeListener(this.elements.shapeSize, (value) => {
                this.stateManager.setState({
                    shape: { size: parseInt(value) }
                });
            });
        }

        if (this.elements.baseX) {
            this.addRangeListener(this.elements.baseX, (value) => {
                this.stateManager.setState({
                    transform: { baseX: parseInt(value) }
                });
            });
        }

        if (this.elements.baseY) {
            this.addRangeListener(this.elements.baseY, (value) => {
                this.stateManager.setState({
                    transform: { baseY: parseInt(value) }
                });
            });
        }

        // Opacity controls
        if (this.elements.opacityFadeEnabled) {
            this.elements.opacityFadeEnabled.addEventListener('change', (e) => {
                this.stateManager.setState({
                    transform: {
                        opacityFade: { enabled: e.target.checked }
                    }
                });
            });
        }

        if (this.elements.startOpacity) {
            this.addRangeListener(this.elements.startOpacity, (value) => {
                this.stateManager.setState({
                    transform: {
                        opacityFade: { startOpacity: parseFloat(value) }
                    }
                });
            });
        }

        if (this.elements.endOpacity) {
            this.addRangeListener(this.elements.endOpacity, (value) => {
                this.stateManager.setState({
                    transform: {
                        opacityFade: { endOpacity: parseFloat(value) }
                    }
                });
            });
        }

        if (this.elements.fadeRate) {
            this.addRangeListener(this.elements.fadeRate, (value) => {
                this.stateManager.setState({
                    transform: {
                        opacityFade: { fadeRate: parseFloat(value) }
                    }
                });
            });
        }

        // Animation controls for each property
        ['scale', 'x', 'y', 'rotate'].forEach(prop => {
            this.bindAnimationControls(prop);
        });

        // Subscribe to state changes to update UI
        this.stateManager.subscribe((state) => {
            this.updateUIFromState(state);
        });
    }

    /**
     * Bind animation controls for a specific property
     */
    bindAnimationControls(property) {
        const elements = this.elements.animation[property];
        if (!elements) return;

        if (elements.motionType) {
            elements.motionType.addEventListener('change', (e) => {
                this.stateManager.setState({
                    animation: {
                        [property]: { motionType: e.target.value }
                    }
                });
            });
        }

        if (elements.effectOrder) {
            elements.effectOrder.addEventListener('change', (e) => {
                this.stateManager.setState({
                    animation: {
                        [property]: { effectOrder: e.target.value }
                    }
                });
            });
        }

        if (elements.amplitude) {
            this.addRangeListener(elements.amplitude, (value) => {
                this.stateManager.setState({
                    animation: {
                        [property]: { amplitude: parseFloat(value) }
                    }
                });
            });
        }

        if (elements.frequency) {
            this.addRangeListener(elements.frequency, (value) => {
                this.stateManager.setState({
                    animation: {
                        [property]: { frequency: parseFloat(value) }
                    }
                });
            });
        }

        if (elements.speed) {
            this.addRangeListener(elements.speed, (value) => {
                this.stateManager.setState({
                    animation: {
                        [property]: { speed: parseFloat(value) }
                    }
                });
            });
        }

        if (elements.noiseSeed) {
            elements.noiseSeed.addEventListener('input', (e) => {
                this.stateManager.setState({
                    animation: {
                        [property]: { noiseSeed: parseInt(e.target.value) || 1 }
                    }
                });
            });
        }

        if (elements.randomAnim) {
            elements.randomAnim.addEventListener('click', () => {
                this.randomizeAnimation(property);
            });
        }
    }

    /**
     * Add range input listener with value display
     */
    addRangeListener(element, callback) {
        if (!element) return;

        // Create value display if it doesn't exist
        if (!this.valueDisplays.has(element)) {
            const display = document.createElement('span');
            display.className = 'range-value';
            display.textContent = element.value;
            
            // Insert after the label
            const label = element.closest('label');
            if (label) {
                label.appendChild(display);
            }
            
            this.valueDisplays.set(element, display);
        }

        // Update display and call callback on input
        element.addEventListener('input', (e) => {
            const display = this.valueDisplays.get(element);
            if (display) {
                display.textContent = e.target.value;
            }
            callback(e.target.value);
        });
    }

    /**
     * Update UI elements from current state
     */
    updateUIFromState(state = null) {
        const currentState = state || this.stateManager.getState();

        // Update canvas controls
        if (this.elements.bgColor) {
            this.elements.bgColor.value = currentState.canvas.backgroundColor;
        }
        if (this.elements.cameraZoom) {
            this.elements.cameraZoom.value = currentState.canvas.cameraZoom;
            this.updateValueDisplay(this.elements.cameraZoom);
        }

        // Update shape controls
        if (this.elements.shapeType) {
            this.elements.shapeType.value = currentState.shape.type;
        }

        // Update color controls
        if (this.elements.stylingType) {
            this.elements.stylingType.value = currentState.color.stylingType;
        }
        if (this.elements.strokeWidth) {
            this.elements.strokeWidth.value = currentState.color.strokeWidth;
            this.updateValueDisplay(this.elements.strokeWidth);
        }
        if (this.elements.drawingMode) {
            this.elements.drawingMode.value = currentState.color.drawingMode;
        }
        if (this.elements.colorShiftEnabled && currentState.color.colorShift) {
            this.elements.colorShiftEnabled.checked = currentState.color.colorShift.enabled;
        }
        if (this.elements.colorShiftSpeed && currentState.color.colorShift) {
            this.elements.colorShiftSpeed.value = currentState.color.colorShift.speed;
            this.updateValueDisplay(this.elements.colorShiftSpeed);
        }

        // Update transform controls
        if (this.elements.splitMask) {
            this.elements.splitMask.value = currentState.transform.splitMask;
        }
        if (this.elements.sequenceCount) {
            this.elements.sequenceCount.value = currentState.transform.sequenceCount;
            this.updateValueDisplay(this.elements.sequenceCount);
        }
        if (this.elements.baseScale) {
            this.elements.baseScale.value = currentState.transform.baseScale;
            this.updateValueDisplay(this.elements.baseScale);
        }
        if (this.elements.scaleTransition) {
            this.elements.scaleTransition.value = currentState.transform.scaleTransition;
            this.updateValueDisplay(this.elements.scaleTransition);
        }
        if (this.elements.baseRotation) {
            this.elements.baseRotation.value = currentState.transform.baseRotation;
            this.updateValueDisplay(this.elements.baseRotation);
        }
        if (this.elements.rotationTransition) {
            this.elements.rotationTransition.value = currentState.transform.rotationTransition;
            this.updateValueDisplay(this.elements.rotationTransition);
        }
        if (this.elements.shapeSize) {
            this.elements.shapeSize.value = currentState.shape.size;
            this.updateValueDisplay(this.elements.shapeSize);
        }
        if (this.elements.baseX) {
            this.elements.baseX.value = currentState.transform.baseX;
            this.updateValueDisplay(this.elements.baseX);
        }
        if (this.elements.baseY) {
            this.elements.baseY.value = currentState.transform.baseY;
            this.updateValueDisplay(this.elements.baseY);
        }

        // Update opacity controls
        if (this.elements.opacityFadeEnabled && currentState.transform.opacityFade) {
            this.elements.opacityFadeEnabled.checked = currentState.transform.opacityFade.enabled;
        }
        if (this.elements.startOpacity && currentState.transform.opacityFade) {
            this.elements.startOpacity.value = currentState.transform.opacityFade.startOpacity;
            this.updateValueDisplay(this.elements.startOpacity);
        }
        if (this.elements.endOpacity && currentState.transform.opacityFade) {
            this.elements.endOpacity.value = currentState.transform.opacityFade.endOpacity;
            this.updateValueDisplay(this.elements.endOpacity);
        }
        if (this.elements.fadeRate && currentState.transform.opacityFade) {
            this.elements.fadeRate.value = currentState.transform.opacityFade.fadeRate;
            this.updateValueDisplay(this.elements.fadeRate);
        }

        // Update animation controls
        ['scale', 'x', 'y', 'rotate'].forEach(prop => {
            this.updateAnimationUI(prop, currentState.animation[prop]);
        });
    }

    /**
     * Update animation UI for a specific property
     */
    updateAnimationUI(property, animState) {
        const elements = this.elements.animation[property];
        if (!elements || !animState) return;

        if (elements.motionType) {
            elements.motionType.value = animState.motionType;
        }
        if (elements.effectOrder) {
            elements.effectOrder.value = animState.effectOrder;
        }
        if (elements.amplitude) {
            elements.amplitude.value = animState.amplitude;
            this.updateValueDisplay(elements.amplitude);
        }
        if (elements.frequency) {
            elements.frequency.value = animState.frequency;
            this.updateValueDisplay(elements.frequency);
        }
        if (elements.speed) {
            elements.speed.value = animState.speed;
            this.updateValueDisplay(elements.speed);
        }
        if (elements.noiseSeed) {
            elements.noiseSeed.value = animState.noiseSeed;
        }
    }

    /**
     * Update value display for a range input
     */
    updateValueDisplay(element) {
        const display = this.valueDisplays.get(element);
        if (display) {
            display.textContent = element.value;
        }
    }

    /**
     * Randomize animation parameters for a property
     */
    randomizeAnimation(property) {
        const animState = this.stateManager.getAnimationState(property);
        if (!animState) return;

        // Get appropriate ranges based on property
        let amplitudeMax = 1.0;
        if (property === 'x' || property === 'y') {
            amplitudeMax = 100;
        } else if (property === 'rotate') {
            amplitudeMax = 90;
        }

        const randomValues = {
            amplitude: Math.random() * amplitudeMax,
            frequency: 0.01 + Math.random() * 1.99,
            speed: 0.01 + Math.random() * 1.99,
            noiseSeed: Math.floor(Math.random() * 10000)
        };

        this.stateManager.setState({
            animation: {
                [property]: randomValues
            }
        });
    }
}
