// RenderEngine.js
// Main rendering loop, canvas management, and frame rate control

export class RenderEngine {
    constructor(canvas, stateManager) {
        this.canvas = canvas;
        this.ctx = null;
        this.stateManager = stateManager;
        
        // Animation state
        this.isRunning = false;
        this.isPaused = false;
        this.animationFrameId = null;
        this.lastTimestamp = 0;
        this.deltaTime = 0;
        this.elapsedTime = 0;
        
        // Frame rate control
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.lastFrameTime = 0;
        
        // FPS monitoring
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
        this.fpsHistory = [];
        this.lowFpsWarningShown = false;
        this.performanceWarningThreshold = 15; // Show warning below this FPS
        this.lastPerformanceLog = 0;
        this.performanceLogInterval = 5000; // Log every 5 seconds
        
        // Dependencies (to be set by main.js)
        this.shapeGenerator = null;
        this.transformManager = null;
        this.colorManager = null;
        this.opacityManager = null;
        this.styleRenderer = null;
        
        // Initialize canvas
        this.initCanvas();
        
        // Subscribe to state changes
        this.stateManager.subscribe((state) => {
            this.onStateChange(state);
        });
        
        // Handle window resize
        this.setupResizeHandler();
    }

    /**
     * Initialize canvas and context
     */
    initCanvas() {
        // Get 2D context
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.ctx) {
            console.error('Failed to get 2D context');
            return;
        }
        
        // Set initial canvas size
        const canvasState = this.stateManager.getCanvasState();
        this.resizeCanvas(canvasState.width, canvasState.height);
        
        // Set target FPS
        this.setTargetFPS(canvasState.targetFPS);
        
        console.log('Canvas initialized:', this.canvas.width, 'x', this.canvas.height);
    }

    /**
     * Resize canvas to specified dimensions
     */
    resizeCanvas(width, height) {
        // Enforce minimum resolution
        const minWidth = 800;
        const minHeight = 600;
        
        width = Math.max(width, minWidth);
        height = Math.max(height, minHeight);
        
        // Set canvas resolution
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Update display size
        this.updateCanvasDisplaySize();
        
        console.log(`Canvas resized to: ${width}x${height}`);
    }

    /**
     * Update canvas display size to fit container while maintaining aspect ratio
     */
    updateCanvasDisplaySize() {
        const containerWidth = this.canvas.parentElement.clientWidth;
        const containerHeight = this.canvas.parentElement.clientHeight;
        
        // Calculate scale to fit container while maintaining aspect ratio
        const scaleX = containerWidth / this.canvas.width;
        const scaleY = containerHeight / this.canvas.height;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond native resolution
        
        this.canvas.style.width = `${this.canvas.width * scale}px`;
        this.canvas.style.height = `${this.canvas.height * scale}px`;
    }

    /**
     * Setup window resize handler
     */
    setupResizeHandler() {
        let resizeTimeout;
        
        const handleResize = () => {
            // Debounce resize events
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.onWindowResize();
            }, 250);
        };
        
        window.addEventListener('resize', handleResize);
        
        // Initial resize
        this.onWindowResize();
    }

    /**
     * Handle window resize event
     */
    onWindowResize() {
        // Update canvas display size to fit new container dimensions
        this.updateCanvasDisplaySize();
        
        // Optionally adjust canvas resolution based on container size
        // (Commented out to preserve user's chosen resolution)
        /*
        const containerWidth = this.canvas.parentElement.clientWidth;
        const containerHeight = this.canvas.parentElement.clientHeight;
        
        // Only resize if significantly different
        const widthDiff = Math.abs(this.canvas.width - containerWidth);
        const heightDiff = Math.abs(this.canvas.height - containerHeight);
        
        if (widthDiff > 100 || heightDiff > 100) {
            this.resizeCanvas(containerWidth, containerHeight);
        }
        */
    }

    /**
     * Set target frame rate
     */
    setTargetFPS(fps) {
        this.targetFPS = Math.max(30, Math.min(120, fps));
        this.frameInterval = 1000 / this.targetFPS;
    }

    /**
     * Get current FPS
     */
    getCurrentFPS() {
        return Math.round(this.fps);
    }

    /**
     * Start the render loop
     */
    start() {
        if (this.isRunning) {
            console.warn('Render engine already running');
            return;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastTimestamp = performance.now();
        this.lastFrameTime = this.lastTimestamp;
        this.fpsUpdateTime = this.lastTimestamp;
        
        console.log('Render engine started');
        this.render(this.lastTimestamp);
    }

    /**
     * Stop the render loop
     */
    stop() {
        if (!this.isRunning) {
            return;
        }
        
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        console.log('Render engine stopped');
    }

    /**
     * Pause the render loop
     */
    pause() {
        if (!this.isRunning || this.isPaused) {
            return;
        }
        
        this.isPaused = true;
        console.log('Render engine paused');
    }

    /**
     * Resume the render loop
     */
    resume() {
        if (!this.isRunning || !this.isPaused) {
            return;
        }
        
        this.isPaused = false;
        this.lastTimestamp = performance.now();
        this.lastFrameTime = this.lastTimestamp;
        console.log('Render engine resumed');
    }

    /**
     * Main render loop
     */
    render(timestamp) {
        if (!this.isRunning) {
            return;
        }
        
        // Request next frame
        this.animationFrameId = requestAnimationFrame((ts) => this.render(ts));
        
        // Skip rendering if paused
        if (this.isPaused) {
            return;
        }
        
        // Frame rate control
        const elapsed = timestamp - this.lastFrameTime;
        if (elapsed < this.frameInterval) {
            return; // Skip this frame
        }
        
        // Calculate delta time
        this.deltaTime = timestamp - this.lastTimestamp;
        this.elapsedTime += this.deltaTime;
        this.lastTimestamp = timestamp;
        this.lastFrameTime = timestamp - (elapsed % this.frameInterval);
        
        // Update FPS counter
        this.updateFPS(timestamp);
        
        // Clear canvas
        this.clearCanvas();
        
        // Render content (placeholder for now)
        this.renderContent(timestamp);
    }

    /**
     * Clear the canvas
     */
    clearCanvas() {
        const canvasState = this.stateManager.getCanvasState();
        this.ctx.fillStyle = canvasState.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Render content with integrated rendering pipeline
     */
    renderContent(timestamp) {
        // Update color shift animation
        if (this.colorManager) {
            this.colorManager.updateColorShift(this.getDeltaTime());
        }
        
        // Apply camera transform
        const canvasState = this.stateManager.getCanvasState();
        this.ctx.save();
        
        // Translate to center, apply zoom, translate back
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(canvasState.cameraZoom, canvasState.cameraZoom);
        this.ctx.translate(-centerX + canvasState.cameraX, -centerY + canvasState.cameraY);
        
        // Use integrated rendering pipeline if all components are available
        if (this.shapeGenerator && this.sequenceGenerator && 
            this.transformManager && this.styleRenderer) {
            this.renderWithPipeline(timestamp);
        } else if (this.shapeGenerator && this.sequenceGenerator) {
            // Fallback to test rendering
            this.renderShapeTest(timestamp);
        } else {
            // Fallback test pattern
            const radius = 50 + Math.sin(timestamp * 0.001) * 20;
            
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
        
        // Draw FPS counter (outside camera transform)
        this.drawFPS();
    }

    /**
     * Render using the integrated rendering pipeline
     */
    renderWithPipeline(timestamp) {
        const shapeState = this.stateManager.getShapeState();
        const transformState = this.stateManager.getTransformState();
        
        // Step 1: Generate shape sequence
        const sequence = this.sequenceGenerator.generateSequence(
            shapeState.type,
            transformState.sequenceCount,
            shapeState.size,
            shapeState.customSVG
        );
        
        // Step 2: Calculate transforms for all shapes
        let transforms = this.transformManager.calculateTransforms(
            transformState.sequenceCount,
            timestamp
        );
        
        // Step 3: Apply split mask transformations
        if (this.splitMaskProcessor) {
            transforms = this.splitMaskProcessor.applySplitMask(
                transforms,
                transformState.splitMask,
                this.canvas.width,
                this.canvas.height
            );
        }
        
        // Step 4: Prepare shapes array for rendering
        const shapes = transforms.map(transform => ({
            shapePath: sequence.shapePath,
            transform: transform
        }));
        
        // Step 5: Render shapes in correct order with colors and opacity
        this.styleRenderer.renderSequence(
            this.ctx,
            shapes,
            transformState.sequenceCount
        );
    }

    /**
     * Test rendering with shape generation system
     */
    renderShapeTest(timestamp) {
        const shapeState = this.stateManager.getShapeState();
        const transformState = this.stateManager.getTransformState();
        const colorState = this.stateManager.getColorState();
        
        // Generate sequence
        const sequence = this.sequenceGenerator.generateSequence(
            shapeState.type,
            transformState.sequenceCount,
            shapeState.size,
            shapeState.customSVG
        );
        
        // Calculate transforms using TransformManager
        let transforms = [];
        if (this.transformManager) {
            transforms = this.transformManager.calculateTransforms(
                transformState.sequenceCount,
                timestamp
            );
            
            // Apply split mask if processor is available
            if (this.splitMaskProcessor) {
                transforms = this.splitMaskProcessor.applySplitMask(
                    transforms,
                    transformState.splitMask,
                    this.canvas.width,
                    this.canvas.height
                );
            }
        } else {
            // Fallback to simple transforms if manager not available
            for (let i = 0; i < transformState.sequenceCount; i++) {
                const scale = transformState.baseScale * Math.pow(transformState.scaleTransition, i * transformState.trailDistance);
                const rotation = transformState.baseRotation + (transformState.rotationTransition * i * transformState.trailDistance);
                const centerX = this.canvas.width / 2;
                const centerY = this.canvas.height / 2;
                
                let opacity = 1.0;
                if (transformState.opacityFade.enabled) {
                    const t = i / Math.max(1, transformState.sequenceCount - 1);
                    opacity = transformState.opacityFade.startOpacity + 
                             (transformState.opacityFade.endOpacity - transformState.opacityFade.startOpacity) * t;
                }
                
                transforms.push({ scale, rotation, x: centerX, y: centerY, opacity });
            }
        }
        
        // Render shapes with calculated transforms
        this.ctx.save();
        
        for (let i = 0; i < transforms.length; i++) {
            const transform = transforms[i];
            const shapeIndex = i % transformState.sequenceCount; // For color calculation
            
            // Set color
            const color = this.getColorForIndex(shapeIndex, transformState.sequenceCount, colorState);
            
            // Apply transforms
            this.ctx.save();
            this.ctx.translate(transform.x, transform.y);
            this.ctx.rotate((transform.rotation * Math.PI) / 180);
            this.ctx.scale(transform.scale, transform.scale);
            
            // Set style
            if (colorState.stylingType === 'fill') {
                this.ctx.fillStyle = this.applyOpacity(color, transform.opacity);
                this.ctx.fill(sequence.shapePath);
            } else {
                this.ctx.strokeStyle = this.applyOpacity(color, transform.opacity);
                this.ctx.lineWidth = colorState.strokeWidth / transform.scale; // Adjust for scale
                this.ctx.stroke(sequence.shapePath);
            }
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }

    /**
     * Get color for a specific index in the sequence
     */
    getColorForIndex(index, count, colorState) {
        if (colorState.drawingMode === 'single') {
            return colorState.singleColor;
        }
        
        if (colorState.drawingMode === 'sequence') {
            return colorState.palette[index % colorState.palette.length];
        }
        
        // For transition modes, interpolate through palette
        const t = index / Math.max(1, count - 1);
        const paletteIndex = t * (colorState.palette.length - 1);
        const colorIndex1 = Math.floor(paletteIndex);
        const colorIndex2 = Math.ceil(paletteIndex);
        const localT = paletteIndex - colorIndex1;
        
        const color1 = colorState.palette[colorIndex1];
        const color2 = colorState.palette[colorIndex2];
        
        // Simple RGB interpolation for now (LCH will be in ColorManager)
        return this.interpolateColor(color1, color2, localT);
    }

    /**
     * Simple color interpolation
     */
    interpolateColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        
        return this.rgbToHex(r, g, b);
    }

    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

    /**
     * Convert RGB to hex color
     */
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    /**
     * Apply opacity to a color
     */
    applyOpacity(color, opacity) {
        const rgb = this.hexToRgb(color);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    }

    /**
     * Update FPS calculation
     */
    updateFPS(timestamp) {
        this.frameCount++;
        
        const elapsed = timestamp - this.fpsUpdateTime;
        if (elapsed >= 1000) {
            // Calculate FPS
            this.fps = (this.frameCount * 1000) / elapsed;
            
            // Add to history
            this.fpsHistory.push(this.fps);
            if (this.fpsHistory.length > 60) {
                this.fpsHistory.shift();
            }
            
            // Check for performance issues
            if (this.fps < this.performanceWarningThreshold) {
                this.handleLowPerformance(timestamp);
            } else {
                // Reset warning flag when performance improves
                this.lowFpsWarningShown = false;
            }
            
            // Log performance metrics periodically
            if (timestamp - this.lastPerformanceLog >= this.performanceLogInterval) {
                this.logPerformanceMetrics();
                this.lastPerformanceLog = timestamp;
            }
            
            // Reset counters
            this.frameCount = 0;
            this.fpsUpdateTime = timestamp;
        }
    }

    /**
     * Handle low performance situation
     */
    handleLowPerformance(timestamp) {
        const currentFPS = this.fps.toFixed(1);
        
        // Show warning in console
        console.warn(`⚠️ Low FPS detected: ${currentFPS} fps`);
        
        // Show warning in UI only once per performance drop
        if (!this.lowFpsWarningShown) {
            this.showPerformanceWarning(currentFPS);
            this.lowFpsWarningShown = true;
        }
    }

    /**
     * Show performance warning in UI
     */
    showPerformanceWarning(currentFPS) {
        const transformState = this.stateManager.getTransformState();
        const suggestions = [];
        
        // Generate optimization suggestions
        if (transformState.sequenceCount > 500) {
            suggestions.push(`Reduce sequence count (currently ${transformState.sequenceCount})`);
        }
        
        if (this.transformManager && this.transformManager.hasActiveAnimation()) {
            suggestions.push('Disable some animations');
        }
        
        if (transformState.sequenceCount > 1000) {
            suggestions.push('Consider using simpler shapes');
        }
        
        const message = `Performance Warning: FPS dropped to ${currentFPS}\n\nSuggestions:\n${suggestions.map(s => `• ${s}`).join('\n')}`;
        
        console.warn(message);
        
        // Show visual warning on canvas
        this.showCanvasWarning = true;
        this.warningMessage = `Low FPS: ${currentFPS}`;
    }

    /**
     * Log performance metrics to console
     */
    logPerformanceMetrics() {
        const avgFPS = this.fpsHistory.length > 0 
            ? (this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length).toFixed(1)
            : 0;
        
        const minFPS = this.fpsHistory.length > 0 
            ? Math.min(...this.fpsHistory).toFixed(1)
            : 0;
        
        const maxFPS = this.fpsHistory.length > 0 
            ? Math.max(...this.fpsHistory).toFixed(1)
            : 0;
        
        console.log('📊 Performance Metrics:');
        console.log(`  Current FPS: ${this.fps.toFixed(1)}`);
        console.log(`  Average FPS: ${avgFPS} (last ${this.fpsHistory.length}s)`);
        console.log(`  Min/Max FPS: ${minFPS} / ${maxFPS}`);
        
        // Log transform cache metrics if available
        if (this.transformManager) {
            const cacheMetrics = this.transformManager.getCacheMetrics();
            console.log(`  Transform Cache Hit Rate: ${cacheMetrics.hitRate}%`);
        }
        
        // Log render metrics if available
        if (this.styleRenderer) {
            const renderMetrics = this.styleRenderer.getRenderMetrics();
            console.log(`  Shapes Rendered: ${renderMetrics.shapesRendered} (${renderMetrics.shapesSkipped} skipped)`);
        }
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const avgFPS = this.fpsHistory.length > 0 
            ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
            : 0;
        
        return {
            currentFPS: this.fps,
            averageFPS: avgFPS,
            minFPS: this.fpsHistory.length > 0 ? Math.min(...this.fpsHistory) : 0,
            maxFPS: this.fpsHistory.length > 0 ? Math.max(...this.fpsHistory) : 0,
            fpsHistory: [...this.fpsHistory],
            isLowPerformance: this.fps < this.performanceWarningThreshold
        };
    }

    /**
     * Draw FPS counter on canvas
     */
    drawFPS() {
        this.ctx.save();
        
        const currentFPS = this.getCurrentFPS();
        const isLowFPS = currentFPS < this.performanceWarningThreshold;
        
        // Choose color based on performance
        let fpsColor = '#4CAF50'; // Green for good performance
        if (currentFPS < 30) {
            fpsColor = '#FF9800'; // Orange for moderate performance
        }
        if (isLowFPS) {
            fpsColor = '#F44336'; // Red for low performance
        }
        
        this.ctx.fillStyle = fpsColor;
        this.ctx.font = 'bold 16px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`FPS: ${currentFPS}`, this.canvas.width - 10, 10);
        
        // Draw warning message if performance is low
        if (this.showCanvasWarning && this.warningMessage) {
            this.ctx.fillStyle = 'rgba(244, 67, 54, 0.9)';
            this.ctx.font = 'bold 14px monospace';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`⚠️ ${this.warningMessage}`, 10, 10);
        }
        
        this.ctx.restore();
    }

    /**
     * Handle state changes
     */
    onStateChange(state) {
        // Update canvas size if changed
        if (state.canvas) {
            if (this.canvas.width !== state.canvas.width || 
                this.canvas.height !== state.canvas.height) {
                this.resizeCanvas(state.canvas.width, state.canvas.height);
            }
            
            if (this.targetFPS !== state.canvas.targetFPS) {
                this.setTargetFPS(state.canvas.targetFPS);
            }
        }
    }

    /**
     * Set shape generator dependency
     */
    setShapeGenerator(generator) {
        this.shapeGenerator = generator;
    }

    /**
     * Set transform manager dependency
     */
    setTransformManager(manager) {
        this.transformManager = manager;
    }

    /**
     * Set color manager dependency
     */
    setColorManager(manager) {
        this.colorManager = manager;
    }

    /**
     * Set opacity manager dependency
     */
    setOpacityManager(manager) {
        this.opacityManager = manager;
    }

    /**
     * Set style renderer dependency
     */
    setStyleRenderer(renderer) {
        this.styleRenderer = renderer;
    }

    /**
     * Get delta time in seconds
     */
    getDeltaTime() {
        return this.deltaTime / 1000;
    }

    /**
     * Get elapsed time in seconds
     */
    getElapsedTime() {
        return this.elapsedTime / 1000;
    }

    /**
     * Reset elapsed time
     */
    resetTime() {
        this.elapsedTime = 0;
    }
}
