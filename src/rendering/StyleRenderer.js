// StyleRenderer.js
// Handles rendering of shapes with fill and stroke modes

export class StyleRenderer {
    constructor(stateManager, colorManager, opacityManager) {
        this.stateManager = stateManager;
        this.colorManager = colorManager;
        this.opacityManager = opacityManager;
        
        // Performance tracking
        this.shapesRendered = 0;
        this.shapesSkipped = 0;
        
        // Optimization thresholds
        this.OPACITY_THRESHOLD = 0.01; // Skip shapes below this opacity
        this.HIGH_COUNT_THRESHOLD = 500; // Consider high shape count optimizations
    }

    /**
     * Render a single shape with appropriate styling
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Path2D} shapePath - Shape path to render
     * @param {object} transform - Transform object {scale, rotation, x, y, opacity}
     * @param {number} index - Shape index in sequence
     * @param {number} sequenceCount - Total number of shapes
     */
    renderShape(ctx, shapePath, transform, index, sequenceCount) {
        const colorState = this.stateManager.getColorState();
        
        // Save context state
        ctx.save();
        
        // Apply blend mode if specified (for quantum effects)
        if (transform.blendMode) {
            ctx.globalCompositeOperation = transform.blendMode;
        } else {
            // Reset to default if no blend mode
            ctx.globalCompositeOperation = 'source-over';
        }
        
        // Apply transform
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.rotation * Math.PI / 180);
        ctx.scale(transform.scale, transform.scale);
        
        // Get color for this shape
        let color = this.colorManager.getColorForIndex(index, sequenceCount);
        
        // Invert color if flagged
        if (transform.invertColor) {
            color = this.colorManager.invertColor(color);
        }
        
        // Get opacity (combine transform opacity with calculated opacity)
        const calculatedOpacity = this.opacityManager.calculateOpacity(index, sequenceCount);
        const finalOpacity = transform.opacity * calculatedOpacity;
        
        // Apply styling based on mode
        if (colorState.stylingType === 'fill') {
            this.renderFill(ctx, shapePath, color, finalOpacity);
        } else if (colorState.stylingType === 'stroke') {
            this.renderStroke(ctx, shapePath, color, finalOpacity, colorState.strokeWidth);
        }
        
        // Restore context state (this also resets blend mode)
        ctx.restore();
    }

    /**
     * Render shape with fill mode
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Path2D} shapePath - Shape path to render
     * @param {string} color - Color in hex format
     * @param {number} opacity - Opacity value (0.0 to 1.0)
     */
    renderFill(ctx, shapePath, color, opacity) {
        // Convert hex color to rgba
        const rgba = this.hexToRGBA(color, opacity);
        
        ctx.fillStyle = rgba;
        ctx.fill(shapePath);
    }

    /**
     * Render shape with stroke mode
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Path2D} shapePath - Shape path to render
     * @param {string} color - Color in hex format
     * @param {number} opacity - Opacity value (0.0 to 1.0)
     * @param {number} strokeWidth - Stroke width in pixels
     */
    renderStroke(ctx, shapePath, color, opacity, strokeWidth) {
        // Convert hex color to rgba
        const rgba = this.hexToRGBA(color, opacity);
        
        ctx.strokeStyle = rgba;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(shapePath);
    }

    /**
     * Convert hex color to RGBA string
     * @param {string} hex - Hex color string
     * @param {number} opacity - Opacity value (0.0 to 1.0)
     * @returns {string} RGBA color string
     */
    hexToRGBA(hex, opacity) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    /**
     * Render multiple shapes in sequence
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} shapes - Array of {shapePath, transform} objects
     * @param {number} sequenceCount - Total number of shapes
     */
    renderSequence(ctx, shapes, sequenceCount) {
        this.shapesRendered = 0;
        this.shapesSkipped = 0;
        
        const colorState = this.stateManager.getColorState();
        const isHighCount = shapes.length > this.HIGH_COUNT_THRESHOLD;
        
        // Use optimized rendering for high shape counts
        if (isHighCount) {
            this.renderSequenceOptimized(ctx, shapes, sequenceCount, colorState);
        } else {
            this.renderSequenceStandard(ctx, shapes, sequenceCount);
        }
    }

    /**
     * Standard rendering for normal shape counts
     */
    renderSequenceStandard(ctx, shapes, sequenceCount) {
        // Render shapes in order (first to last for proper layering)
        for (let i = 0; i < shapes.length; i++) {
            const { shapePath, transform } = shapes[i];
            
            // Skip shapes with very low opacity for performance
            if (transform.opacity < this.OPACITY_THRESHOLD) {
                this.shapesSkipped++;
                continue;
            }
            
            this.renderShape(ctx, shapePath, transform, i, sequenceCount);
            this.shapesRendered++;
        }
    }

    /**
     * Optimized rendering for high shape counts
     * Batches shapes with similar properties to reduce state changes
     */
    renderSequenceOptimized(ctx, shapes, sequenceCount, colorState) {
        // Check if any shapes have blend modes - if so, can't batch
        const hasBlendModes = shapes.some(s => s.transform.blendMode);
        
        if (hasBlendModes) {
            // Fall back to standard rendering for blend modes
            this.renderSequenceStandard(ctx, shapes, sequenceCount);
            return;
        }
        
        // Pre-calculate all colors and opacities
        const renderData = [];
        
        for (let i = 0; i < shapes.length; i++) {
            const { shapePath, transform } = shapes[i];
            
            // Skip shapes with very low opacity
            const calculatedOpacity = this.opacityManager.calculateOpacity(i, sequenceCount);
            const finalOpacity = transform.opacity * calculatedOpacity;
            
            if (finalOpacity < this.OPACITY_THRESHOLD) {
                this.shapesSkipped++;
                continue;
            }
            
            // Get color for this shape
            const color = this.colorManager.getColorForIndex(i, sequenceCount);
            
            renderData.push({
                shapePath,
                transform,
                color,
                opacity: finalOpacity,
                index: i
            });
        }
        
        // Batch render by styling type
        if (colorState.stylingType === 'fill') {
            this.batchRenderFill(ctx, renderData);
        } else {
            this.batchRenderStroke(ctx, renderData, colorState.strokeWidth);
        }
        
        this.shapesRendered = renderData.length;
    }

    /**
     * Batch render shapes with fill mode
     */
    batchRenderFill(ctx, renderData) {
        // Group shapes by color for batching (if using single color mode)
        const colorGroups = new Map();
        
        for (const data of renderData) {
            const key = `${data.color}-${data.opacity.toFixed(2)}`;
            if (!colorGroups.has(key)) {
                colorGroups.set(key, []);
            }
            colorGroups.get(key).push(data);
        }
        
        // Render each color group
        for (const [key, group] of colorGroups) {
            const firstItem = group[0];
            const rgba = this.hexToRGBA(firstItem.color, firstItem.opacity);
            ctx.fillStyle = rgba;
            
            for (const data of group) {
                ctx.save();
                ctx.translate(data.transform.x, data.transform.y);
                ctx.rotate(data.transform.rotation * Math.PI / 180);
                ctx.scale(data.transform.scale, data.transform.scale);
                ctx.fill(data.shapePath);
                ctx.restore();
            }
        }
    }

    /**
     * Batch render shapes with stroke mode
     */
    batchRenderStroke(ctx, renderData, strokeWidth) {
        // Set common stroke properties
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Group shapes by color for batching
        const colorGroups = new Map();
        
        for (const data of renderData) {
            const key = `${data.color}-${data.opacity.toFixed(2)}`;
            if (!colorGroups.has(key)) {
                colorGroups.set(key, []);
            }
            colorGroups.get(key).push(data);
        }
        
        // Render each color group
        for (const [key, group] of colorGroups) {
            const firstItem = group[0];
            const rgba = this.hexToRGBA(firstItem.color, firstItem.opacity);
            ctx.strokeStyle = rgba;
            
            for (const data of group) {
                ctx.save();
                ctx.translate(data.transform.x, data.transform.y);
                ctx.rotate(data.transform.rotation * Math.PI / 180);
                ctx.scale(data.transform.scale, data.transform.scale);
                ctx.stroke(data.shapePath);
                ctx.restore();
            }
        }
    }

    /**
     * Get rendering performance metrics
     */
    getRenderMetrics() {
        return {
            shapesRendered: this.shapesRendered,
            shapesSkipped: this.shapesSkipped,
            total: this.shapesRendered + this.shapesSkipped,
            skipRate: this.shapesRendered + this.shapesSkipped > 0 
                ? (this.shapesSkipped / (this.shapesRendered + this.shapesSkipped) * 100).toFixed(1)
                : 0
        };
    }
}
