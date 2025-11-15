// InputManager.js
// Handles mouse and keyboard interactions for canvas manipulation

export class InputManager {
    constructor(canvas, stateManager) {
        this.canvas = canvas;
        this.stateManager = stateManager;
        
        // Interaction state
        this.isMouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.modifiers = {
            shift: false,
            ctrl: false,
            alt: false
        };
        
        this.bindEventListeners();
    }

    /**
     * Bind event listeners to canvas
     */
    bindEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
        
        // Wheel event for scroll
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        
        // Keyboard events for modifier keys
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    /**
     * Handle mouse down event
     */
    onMouseDown(event) {
        this.isMouseDown = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.updateModifiers(event);
        
        // Prevent default to avoid text selection
        event.preventDefault();
    }

    /**
     * Handle mouse move event
     */
    onMouseMove(event) {
        if (!this.isMouseDown) return;
        
        const dx = event.clientX - this.lastMouseX;
        const dy = event.clientY - this.lastMouseY;
        
        this.updateModifiers(event);
        this.handleDrag(dx, dy, this.modifiers);
        
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    /**
     * Handle mouse up event
     */
    onMouseUp(event) {
        this.isMouseDown = false;
    }

    /**
     * Handle wheel event for scroll
     */
    onWheel(event) {
        event.preventDefault();
        
        this.updateModifiers(event);
        
        const delta = -Math.sign(event.deltaY);
        this.handleScroll(delta, this.modifiers);
    }

    /**
     * Handle keyboard down event
     */
    onKeyDown(event) {
        this.modifiers.shift = event.shiftKey;
        this.modifiers.ctrl = event.ctrlKey || event.metaKey; // metaKey for Mac Cmd
        this.modifiers.alt = event.altKey;
    }

    /**
     * Handle keyboard up event
     */
    onKeyUp(event) {
        this.modifiers.shift = event.shiftKey;
        this.modifiers.ctrl = event.ctrlKey || event.metaKey;
        this.modifiers.alt = event.altKey;
    }

    /**
     * Update modifier keys from event
     */
    updateModifiers(event) {
        this.modifiers.shift = event.shiftKey;
        this.modifiers.ctrl = event.ctrlKey || event.metaKey;
        this.modifiers.alt = event.altKey;
    }

    /**
     * Handle drag interaction
     * @param {number} dx - Delta X
     * @param {number} dy - Delta Y
     * @param {object} modifiers - Modifier keys state
     */
    handleDrag(dx, dy, modifiers) {
        const state = this.stateManager.getTransformState();
        
        if (modifiers.shift) {
            // Shift + Drag: Adjust transition spacing
            // Adjust scale transition based on vertical movement
            const scaleTransitionDelta = -dy * 0.0001;
            const newScaleTransition = state.scaleTransition + scaleTransitionDelta;
            
            // Adjust rotation transition based on horizontal movement
            const rotationTransitionDelta = dx * 0.01;
            const newRotationTransition = state.rotationTransition + rotationTransitionDelta;
            
            this.stateManager.setState({
                transform: {
                    scaleTransition: newScaleTransition,
                    rotationTransition: newRotationTransition
                }
            });
        } else {
            // Regular drag: Adjust position
            this.stateManager.setState({
                transform: {
                    baseX: state.baseX + dx,
                    baseY: state.baseY + dy
                }
            });
        }
    }

    /**
     * Handle scroll interaction
     * @param {number} delta - Scroll delta (1 or -1)
     * @param {object} modifiers - Modifier keys state
     */
    handleScroll(delta, modifiers) {
        const state = this.stateManager.getTransformState();
        
        if (modifiers.shift) {
            // Shift + Scroll: Adjust base scale
            const scaleDelta = delta * 0.05;
            const newScale = state.baseScale + scaleDelta;
            
            this.stateManager.setState({
                transform: {
                    baseScale: newScale
                }
            });
        } else if (modifiers.ctrl) {
            // Ctrl/Cmd + Scroll: Adjust base rotation
            const rotationDelta = delta * 5;
            const newRotation = state.baseRotation + rotationDelta;
            
            this.stateManager.setState({
                transform: {
                    baseRotation: newRotation
                }
            });
        }
    }

    /**
     * Check if currently interacting
     * @returns {boolean} True if mouse is down
     */
    isInteracting() {
        return this.isMouseDown;
    }

    /**
     * Get current modifier keys state
     * @returns {object} Modifiers object
     */
    getCurrentModifiers() {
        return { ...this.modifiers };
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
        this.canvas.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('mouseleave', this.onMouseUp);
        this.canvas.removeEventListener('wheel', this.onWheel);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }
}
