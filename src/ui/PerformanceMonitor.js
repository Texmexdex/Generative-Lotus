// PerformanceMonitor.js
// UI component for displaying FPS and performance warnings

export class PerformanceMonitor {
    constructor(renderEngine, stateManager) {
        this.renderEngine = renderEngine;
        this.stateManager = stateManager;
        
        // Get UI elements
        this.fpsDisplay = document.getElementById('fpsDisplay');
        this.performanceWarning = document.getElementById('performanceWarning');
        this.warningSuggestions = document.getElementById('warningSuggestions');
        
        // Warning state
        this.warningVisible = false;
        this.lastWarningTime = 0;
        this.warningCooldown = 10000; // 10 seconds between warnings
        
        // Start monitoring
        this.startMonitoring();
    }

    /**
     * Start performance monitoring
     */
    startMonitoring() {
        // Update FPS display every 100ms
        setInterval(() => {
            this.updateFPSDisplay();
        }, 100);
        
        // Check for performance issues every second
        setInterval(() => {
            this.checkPerformance();
        }, 1000);
    }

    /**
     * Update FPS display
     */
    updateFPSDisplay() {
        if (!this.fpsDisplay) return;
        
        const fps = this.renderEngine.getCurrentFPS();
        this.fpsDisplay.textContent = `FPS: ${fps}`;
        
        // Update styling based on FPS
        this.fpsDisplay.classList.remove('warning', 'critical');
        
        if (fps < 15) {
            this.fpsDisplay.classList.add('critical');
        } else if (fps < 30) {
            this.fpsDisplay.classList.add('warning');
        }
    }

    /**
     * Check for performance issues
     */
    checkPerformance() {
        const stats = this.renderEngine.getPerformanceStats();
        const now = Date.now();
        
        // Show warning if FPS is consistently low
        if (stats.isLowPerformance && !this.warningVisible) {
            // Check cooldown
            if (now - this.lastWarningTime > this.warningCooldown) {
                this.showWarning(stats.currentFPS);
                this.lastWarningTime = now;
            }
        } else if (!stats.isLowPerformance && this.warningVisible) {
            // Hide warning when performance improves
            this.hideWarning();
        }
    }

    /**
     * Show performance warning with suggestions
     */
    showWarning(currentFPS) {
        if (!this.performanceWarning || !this.warningSuggestions) return;
        
        const transformState = this.stateManager.getTransformState();
        const suggestions = [];
        
        // Generate optimization suggestions
        if (transformState.sequenceCount > 500) {
            suggestions.push(`Reduce sequence count (currently ${transformState.sequenceCount})`);
        }
        
        const animationState = this.stateManager.getState().animation;
        const activeAnimations = ['scale', 'x', 'y', 'rotate'].filter(
            prop => animationState[prop].motionType !== 'off'
        );
        
        if (activeAnimations.length > 0) {
            suggestions.push(`Disable some animations (${activeAnimations.length} active)`);
        }
        
        if (transformState.sequenceCount > 1000) {
            suggestions.push('Use simpler shapes');
        }
        
        const colorState = this.stateManager.getColorState();
        if (colorState.stylingType === 'stroke' && colorState.strokeWidth > 5) {
            suggestions.push('Reduce stroke width');
        }
        
        // Build suggestions HTML
        let suggestionsHTML = '<ul>';
        suggestions.forEach(suggestion => {
            suggestionsHTML += `<li>${suggestion}</li>`;
        });
        suggestionsHTML += '</ul>';
        
        this.warningSuggestions.innerHTML = suggestionsHTML;
        this.performanceWarning.style.display = 'block';
        this.warningVisible = true;
        
        console.warn(`⚠️ Performance Warning: FPS dropped to ${currentFPS.toFixed(1)}`);
        console.warn('Suggestions:', suggestions);
    }

    /**
     * Hide performance warning
     */
    hideWarning() {
        if (!this.performanceWarning) return;
        
        this.performanceWarning.style.display = 'none';
        this.warningVisible = false;
    }

    /**
     * Get current performance metrics
     */
    getMetrics() {
        return this.renderEngine.getPerformanceStats();
    }
}
