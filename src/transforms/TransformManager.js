// TransformManager.js
// Calculate and cache transformations for each shape in the sequence

export class TransformManager {
    constructor(stateManager, animationEngine = null) {
        this.stateManager = stateManager;
        this.animationEngine = animationEngine;
        
        // Transform cache
        this.transformCache = [];
        this.cacheValid = false;
        this.cachedSequenceCount = 0;
        this.cachedTimestamp = 0;
        
        // Dirty flags for each parameter group
        this.dirtyFlags = {
            transform: true,      // baseScale, scaleTransition, baseRotation, rotationTransition, baseX, baseY, trailDistance
            animation: true,      // all animation parameters
            shape: true,          // shape type and size
            canvas: true,         // canvas dimensions
            opacity: true         // opacity fade settings
        };
        
        // Performance metrics
        this.cacheHits = 0;
        this.cacheMisses = 0;
        
        // Subscribe to state changes
        this.stateManager.subscribe((state) => {
            this.onStateChange(state);
        });
        
        // Store last state for comparison
        this.lastState = this.stateManager.getState();
    }

    /**
     * Set animation engine dependency
     */
    setAnimationEngine(engine) {
        this.animationEngine = engine;
        this.invalidateCache();
    }

    /**
     * Calculate transforms for all shapes in the sequence
     * @param {number} sequenceCount - Number of shapes in sequence
     * @param {number} timestamp - Current animation timestamp
     * @returns {Array} Array of transform objects
     */
    calculateTransforms(sequenceCount, timestamp) {
        const hasAnimation = this.hasActiveAnimation();
        
        // Check if we can use cached transforms
        // Cache is valid if:
        // 1. Cache exists and is marked valid
        // 2. Sequence count hasn't changed
        // 3. No static parameters have changed (transform, shape, canvas, opacity)
        // 4. Either no animation is active, OR timestamp hasn't changed
        const canUseCache = this.cacheValid && 
                           this.cachedSequenceCount === sequenceCount &&
                           !this.dirtyFlags.transform &&
                           !this.dirtyFlags.shape &&
                           !this.dirtyFlags.canvas &&
                           !this.dirtyFlags.opacity &&
                           (!hasAnimation || this.cachedTimestamp === timestamp);
        
        if (canUseCache) {
            this.cacheHits++;
            return this.transformCache;
        }
        
        this.cacheMisses++;
        
        // Get current state
        const transformState = this.stateManager.getTransformState();
        const canvasState = this.stateManager.getCanvasState();
        
        // Calculate center position
        const centerX = canvasState.width / 2;
        const centerY = canvasState.height / 2;
        
        // Generate transforms for each shape
        const transforms = [];
        
        for (let i = 0; i < sequenceCount; i++) {
            const transform = this.calculateTransformForIndex(
                i, 
                sequenceCount, 
                transformState, 
                centerX, 
                centerY, 
                timestamp
            );
            transforms.push(transform);
        }
        
        // Cache transforms
        this.transformCache = transforms;
        this.cachedSequenceCount = sequenceCount;
        this.cachedTimestamp = timestamp;
        this.cacheValid = true;
        
        // Clear dirty flags for static parameters (animation flag stays if animation is active)
        this.dirtyFlags.transform = false;
        this.dirtyFlags.shape = false;
        this.dirtyFlags.canvas = false;
        this.dirtyFlags.opacity = false;
        
        return transforms;
    }

    /**
     * Calculate transform for a specific index in the sequence
     */
    calculateTransformForIndex(index, sequenceCount, transformState, centerX, centerY, timestamp) {
        // Calculate base static transforms with trail distance multiplier
        const trailMult = transformState.trailDistance;
        
        // Scale: multiply by transition value for each step
        let scale = transformState.baseScale * Math.pow(
            transformState.scaleTransition, 
            index * trailMult
        );
        
        // Rotation: add transition value for each step
        let rotation = transformState.baseRotation + (
            transformState.rotationTransition * index * trailMult
        );
        
        // Position: start at base position
        let x = transformState.baseX;
        let y = transformState.baseY;
        
        // Apply animations if animation engine is available
        if (this.animationEngine && timestamp !== undefined) {
            const animatedOffsets = this.animationEngine.calculateAnimatedOffsets(
                index,
                sequenceCount,
                timestamp
            );
            
            // Apply scale animation as multiplicative factor
            scale *= (1 + animatedOffsets.scale);
            
            // Apply position animations as additive offsets
            x += animatedOffsets.x;
            y += animatedOffsets.y;
            
            // Apply rotation animation combined with base rotation
            rotation += animatedOffsets.rotate;
        }
        
        // Calculate opacity
        const opacity = this.calculateOpacity(index, sequenceCount, transformState);
        
        // Return transform object
        return {
            scale,
            rotation,
            x: centerX + x,
            y: centerY + y,
            opacity
        };
    }

    /**
     * Calculate opacity for a shape based on fade settings
     */
    calculateOpacity(index, sequenceCount, transformState) {
        if (!transformState.opacityFade.enabled) {
            return 1.0;
        }
        
        // Calculate normalized position in sequence (0 to 1)
        const t = sequenceCount > 1 ? index / (sequenceCount - 1) : 0;
        
        // Apply fade rate (exponential curve)
        const fadeRate = transformState.opacityFade.fadeRate;
        const adjustedT = Math.pow(t, fadeRate);
        
        // Interpolate between start and end opacity
        const startOpacity = transformState.opacityFade.startOpacity;
        const endOpacity = transformState.opacityFade.endOpacity;
        
        return startOpacity + (endOpacity - startOpacity) * adjustedT;
    }

    /**
     * Get transform for a specific index (from cache if available)
     */
    getTransformForIndex(index) {
        if (this.cacheValid && index < this.transformCache.length) {
            return this.transformCache[index];
        }
        return null;
    }

    /**
     * Invalidate the transform cache
     */
    invalidateCache() {
        this.cacheValid = false;
        this.dirtyFlags.transform = true;
        this.dirtyFlags.animation = true;
        this.dirtyFlags.shape = true;
        this.dirtyFlags.canvas = true;
        this.dirtyFlags.opacity = true;
    }

    /**
     * Check if cache is dirty
     */
    isCacheDirty() {
        return !this.cacheValid || 
               this.dirtyFlags.transform || 
               this.dirtyFlags.animation || 
               this.dirtyFlags.shape;
    }

    /**
     * Check if any animation is currently active
     */
    hasActiveAnimation() {
        const state = this.stateManager.getState();
        
        return state.animation.scale.motionType !== 'off' ||
               state.animation.x.motionType !== 'off' ||
               state.animation.y.motionType !== 'off' ||
               state.animation.rotate.motionType !== 'off';
    }

    /**
     * Handle state changes to update dirty flags
     */
    onStateChange(state) {
        const lastState = this.lastState;
        
        // Check if transform parameters changed
        if (this.hasTransformChanged(lastState.transform, state.transform)) {
            this.dirtyFlags.transform = true;
            this.cacheValid = false;
        }
        
        // Check if opacity fade parameters changed
        if (this.hasOpacityChanged(lastState.transform.opacityFade, state.transform.opacityFade)) {
            this.dirtyFlags.opacity = true;
            this.cacheValid = false;
        }
        
        // Check if animation parameters changed
        if (this.hasAnimationChanged(lastState.animation, state.animation)) {
            this.dirtyFlags.animation = true;
            this.cacheValid = false;
        }
        
        // Check if shape parameters changed
        if (lastState.shape.type !== state.shape.type ||
            lastState.shape.size !== state.shape.size) {
            this.dirtyFlags.shape = true;
            this.cacheValid = false;
        }
        
        // Check if canvas size changed
        if (lastState.canvas.width !== state.canvas.width ||
            lastState.canvas.height !== state.canvas.height) {
            this.dirtyFlags.canvas = true;
            this.cacheValid = false;
        }
        
        // Update last state
        this.lastState = state;
    }

    /**
     * Check if transform state has changed (excluding opacity fade)
     */
    hasTransformChanged(oldTransform, newTransform) {
        return oldTransform.sequenceCount !== newTransform.sequenceCount ||
               oldTransform.baseScale !== newTransform.baseScale ||
               oldTransform.scaleTransition !== newTransform.scaleTransition ||
               oldTransform.baseRotation !== newTransform.baseRotation ||
               oldTransform.rotationTransition !== newTransform.rotationTransition ||
               oldTransform.baseX !== newTransform.baseX ||
               oldTransform.baseY !== newTransform.baseY ||
               oldTransform.trailDistance !== newTransform.trailDistance ||
               oldTransform.splitMask !== newTransform.splitMask;
    }

    /**
     * Check if opacity fade state has changed
     */
    hasOpacityChanged(oldOpacity, newOpacity) {
        return oldOpacity.enabled !== newOpacity.enabled ||
               oldOpacity.startOpacity !== newOpacity.startOpacity ||
               oldOpacity.endOpacity !== newOpacity.endOpacity ||
               oldOpacity.fadeRate !== newOpacity.fadeRate;
    }

    /**
     * Check if animation state has changed
     */
    hasAnimationChanged(oldAnimation, newAnimation) {
        const properties = ['scale', 'x', 'y', 'rotate'];
        
        for (const prop of properties) {
            const oldAnim = oldAnimation[prop];
            const newAnim = newAnimation[prop];
            
            if (oldAnim.motionType !== newAnim.motionType ||
                oldAnim.effectOrder !== newAnim.effectOrder ||
                oldAnim.amplitude !== newAnim.amplitude ||
                oldAnim.frequency !== newAnim.frequency ||
                oldAnim.speed !== newAnim.speed ||
                oldAnim.noiseSeed !== newAnim.noiseSeed) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get cache performance metrics
     */
    getCacheMetrics() {
        const total = this.cacheHits + this.cacheMisses;
        const hitRate = total > 0 ? (this.cacheHits / total * 100).toFixed(1) : 0;
        
        return {
            hits: this.cacheHits,
            misses: this.cacheMisses,
            total: total,
            hitRate: hitRate,
            cacheValid: this.cacheValid,
            dirtyFlags: { ...this.dirtyFlags }
        };
    }

    /**
     * Reset cache performance metrics
     */
    resetCacheMetrics() {
        this.cacheHits = 0;
        this.cacheMisses = 0;
    }
}
