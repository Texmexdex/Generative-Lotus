// Main entry point for SVG Generative Art Tool
// This file will initialize all managers and start the application

import { StateManager } from './core/StateManager.js';
import { RenderEngine } from './core/RenderEngine.js';
import { AnimationEngine } from './core/AnimationEngine.js';
import { ShapeGenerator } from './generators/ShapeGenerator.js';
import { SVGParser } from './generators/SVGParser.js';
import { SequenceGenerator } from './generators/SequenceGenerator.js';
import { TransformManager } from './transforms/TransformManager.js';
import { MotionCalculator } from './transforms/MotionCalculator.js';
import { SplitMaskProcessor } from './transforms/SplitMaskProcessor.js';
import { ColorManager } from './rendering/ColorManager.js';
import { OpacityManager } from './rendering/OpacityManager.js';
import { StyleRenderer } from './rendering/StyleRenderer.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { TabManager } from './ui/TabManager.js';
import { ColorPaletteUI } from './ui/ColorPaletteUI.js';
import { InputManager } from './ui/InputManager.js';
import { FileDropHandler } from './ui/FileDropHandler.js';
import { PerformanceMonitor } from './ui/PerformanceMonitor.js';
import { KeyboardShortcuts } from './ui/KeyboardShortcuts.js';
import { PresetManager } from './presets/PresetManager.js';
import { PresetLibrary } from './presets/PresetLibrary.js';
import { ImportExport } from './presets/ImportExport.js';
import { AudioAnalyzer } from './audio/AudioAnalyzer.js';
import { AudioReactiveController } from './audio/AudioReactiveController.js';
import { AudioControlPanel } from './ui/AudioControlPanel.js';
import { AudioTriggerSystem } from './audio/AudioTriggerSystem.js';
import { AudioTriggerUI } from './ui/AudioTriggerUI.js';
import { RangeInputEnhancer } from './ui/RangeInputEnhancer.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('SVG Generative Art Tool initializing...');
    
    // Get canvas element
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // Initialize core systems
    const stateManager = new StateManager();
    console.log('Initial state loaded:', stateManager.getState());
    console.log('Shape type:', stateManager.getState().shape.type);
    console.log('Sequence count:', stateManager.getState().transform.sequenceCount);
    const renderEngine = new RenderEngine(canvas, stateManager);
    
    // Initialize animation system
    const motionCalculator = new MotionCalculator();
    const animationEngine = new AnimationEngine(stateManager, motionCalculator);
    
    // Initialize transform system
    const transformManager = new TransformManager(stateManager, animationEngine);
    const splitMaskProcessor = new SplitMaskProcessor(stateManager);
    
    // Initialize shape generation system
    const shapeGenerator = new ShapeGenerator();
    const svgParser = new SVGParser();
    const sequenceGenerator = new SequenceGenerator(shapeGenerator, svgParser);
    
    // Initialize rendering system
    const colorManager = new ColorManager(stateManager);
    const opacityManager = new OpacityManager(stateManager);
    const styleRenderer = new StyleRenderer(stateManager, colorManager, opacityManager);
    
    // Initialize preset system
    const presetLibrary = new PresetLibrary();
    const presetManager = new PresetManager(stateManager);
    presetManager.setPresetLibrary(presetLibrary);
    const importExport = new ImportExport(stateManager, presetManager);
    
    // Initialize UI system
    const controlPanel = new ControlPanel(stateManager);
    controlPanel.setPresetManager(presetManager);
    controlPanel.setImportExport(importExport);
    const tabManager = new TabManager();
    const colorPaletteUI = new ColorPaletteUI(stateManager, colorManager);
    const inputManager = new InputManager(canvas, stateManager);
    const fileDropHandler = new FileDropHandler(canvas, stateManager, svgParser);
    fileDropHandler.setImportExport(importExport);
    const performanceMonitor = new PerformanceMonitor(renderEngine, stateManager);
    const keyboardShortcuts = new KeyboardShortcuts(renderEngine, presetManager, importExport);
    
    // Enhance range inputs with custom range controls (must be before audio system)
    const rangeInputEnhancer = new RangeInputEnhancer(stateManager);
    
    // Initialize audio system
    const audioAnalyzer = new AudioAnalyzer();
    const audioReactiveController = new AudioReactiveController(stateManager, audioAnalyzer, rangeInputEnhancer);
    const audioTriggerSystem = new AudioTriggerSystem(stateManager, audioAnalyzer);
    const audioControlPanel = new AudioControlPanel(audioAnalyzer, audioReactiveController);
    const audioTriggerUI = new AudioTriggerUI(audioTriggerSystem);
    
    // Reset beat count button
    const resetBeatCountBtn = document.getElementById('resetBeatCount');
    if (resetBeatCountBtn) {
        resetBeatCountBtn.addEventListener('click', () => {
            audioTriggerSystem.resetBeatCount();
            console.log('Beat count reset');
        });
    }
    
    // Force UI update to reflect initial state
    console.log('Forcing UI update with initial state');
    stateManager.notifySubscribers();
    
    // Wire up dependencies
    renderEngine.setShapeGenerator(shapeGenerator);
    renderEngine.setTransformManager(transformManager);
    renderEngine.setColorManager(colorManager);
    renderEngine.setOpacityManager(opacityManager);
    renderEngine.setStyleRenderer(styleRenderer);
    renderEngine.sequenceGenerator = sequenceGenerator;
    renderEngine.splitMaskProcessor = splitMaskProcessor;
    
    // Start the render loop with audio reactive updates
    renderEngine.start();
    
    // Audio reactive update loop
    function audioReactiveLoop() {
        if (audioAnalyzer.isAnalyzing()) {
            audioReactiveController.update();
            audioTriggerSystem.update();
            audioControlPanel.updateVisualizer();
        }
        requestAnimationFrame(audioReactiveLoop);
    }
    audioReactiveLoop();
    
    // Note: Default state (Lotus) is already loaded from StateManager
    console.log('Application initialized successfully with Lotus preset');
    
    // Debug: Log what's being rendered
    setTimeout(() => {
        const state = stateManager.getState();
        console.log('=== RENDER DEBUG ===');
        console.log('Shape:', state.shape.type, 'Size:', state.shape.size);
        console.log('Sequence count:', state.transform.sequenceCount);
        console.log('Camera zoom:', state.canvas.cameraZoom);
        console.log('Base position:', state.transform.baseX, state.transform.baseY);
        console.log('Styling:', state.color.stylingType, 'Width:', state.color.strokeWidth);
        console.log('Canvas size:', state.canvas.width, 'x', state.canvas.height);
        console.log('==================');
    }, 1000);
    console.log('Shape generation system ready');
    console.log('Transform and animation system ready');
    console.log('Color and rendering system ready');
    console.log('Preset management system ready');
    console.log('UI system ready');
    console.log(`Available presets: ${presetLibrary.getPresetNames().join(', ')}`);
});
