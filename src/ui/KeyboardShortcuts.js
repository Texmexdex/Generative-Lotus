// KeyboardShortcuts.js
// Keyboard shortcut handler for common operations

export class KeyboardShortcuts {
    constructor(renderEngine, presetManager, importExport) {
        this.renderEngine = renderEngine;
        this.presetManager = presetManager;
        this.importExport = importExport;
        
        // Shortcut state
        this.enabled = true;
        this.helpVisible = false;
        
        // Initialize shortcuts
        this.setupShortcuts();
        this.createHelpOverlay();
    }

    /**
     * Setup keyboard event listeners
     */
    setupShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            // Ignore shortcuts when typing in input fields
            if (this.isInputFocused()) return;
            
            this.handleKeyPress(e);
        });
    }

    /**
     * Check if an input field is focused
     */
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT' ||
            activeElement.isContentEditable
        );
    }

    /**
     * Handle key press events
     */
    handleKeyPress(e) {
        const key = e.key.toLowerCase();
        
        // Space: Play/pause animation
        if (key === ' ') {
            e.preventDefault();
            this.togglePlayPause();
            return;
        }
        
        // R: Restart current preset
        if (key === 'r') {
            e.preventDefault();
            this.restartPreset();
            return;
        }
        
        // E: Export current state as JSON
        if (key === 'e') {
            e.preventDefault();
            this.exportState();
            return;
        }
        
        // S: Export as SVG
        if (key === 's') {
            e.preventDefault();
            this.exportSVG();
            return;
        }
        
        // P: Export as PNG
        if (key === 'p') {
            e.preventDefault();
            this.exportPNG();
            return;
        }
        
        // 1-4: Load built-in presets
        if (key >= '1' && key <= '4') {
            e.preventDefault();
            this.loadPresetByNumber(parseInt(key));
            return;
        }
        
        // H or ?: Show/hide help
        if (key === 'h' || key === '?') {
            e.preventDefault();
            this.toggleHelp();
            return;
        }
        
        // Escape: Hide help
        if (key === 'escape') {
            if (this.helpVisible) {
                e.preventDefault();
                this.hideHelp();
            }
            return;
        }
    }

    /**
     * Toggle play/pause animation
     */
    togglePlayPause() {
        if (this.renderEngine.isPaused) {
            this.renderEngine.resume();
            this.showNotification('▶️ Animation Resumed');
        } else {
            this.renderEngine.pause();
            this.showNotification('⏸️ Animation Paused');
        }
    }

    /**
     * Restart current preset
     */
    restartPreset() {
        if (this.presetManager) {
            this.presetManager.restartPreset();
            this.showNotification('🔄 Preset Restarted');
        }
    }

    /**
     * Export current state
     */
    exportState() {
        if (this.importExport) {
            this.importExport.downloadJSON();
            this.showNotification('💾 JSON Exported');
        }
    }

    /**
     * Export as SVG
     */
    exportSVG() {
        if (this.importExport) {
            const canvas = document.getElementById('canvas');
            this.importExport.exportToSVG(canvas);
            this.showNotification('🖼️ SVG Exported');
        }
    }

    /**
     * Export as PNG
     */
    exportPNG() {
        if (this.importExport) {
            const canvas = document.getElementById('canvas');
            this.importExport.exportToPNG(canvas);
            this.showNotification('📸 PNG Exported');
        }
    }

    /**
     * Load preset by number (1-4)
     */
    loadPresetByNumber(number) {
        if (!this.presetManager) return;
        
        const presetNames = ['lotus', 'starTrails', 'tunnel', 'mandala'];
        const presetLabels = ['Lotus Metamorphosis', 'Star Trails', 'Hypnotic Tunnel', 'Quantum Mandala'];
        
        if (number >= 1 && number <= presetNames.length) {
            const presetName = presetNames[number - 1];
            const presetLabel = presetLabels[number - 1];
            this.presetManager.loadPreset(presetName);
            this.showNotification(`${number}️⃣ Loaded: ${presetLabel}`);
        }
    }

    /**
     * Toggle help overlay
     */
    toggleHelp() {
        if (this.helpVisible) {
            this.hideHelp();
        } else {
            this.showHelp();
        }
    }

    /**
     * Show help overlay
     */
    showHelp() {
        const overlay = document.getElementById('keyboardShortcutsHelp');
        if (overlay) {
            overlay.style.display = 'flex';
            this.helpVisible = true;
        }
    }

    /**
     * Hide help overlay
     */
    hideHelp() {
        const overlay = document.getElementById('keyboardShortcutsHelp');
        if (overlay) {
            overlay.style.display = 'none';
            this.helpVisible = false;
        }
    }

    /**
     * Show temporary notification
     */
    showNotification(message) {
        // Remove existing notification if any
        const existing = document.getElementById('shortcutNotification');
        if (existing) {
            existing.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'shortcutNotification';
        notification.className = 'shortcut-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 2 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }

    /**
     * Create help overlay HTML
     */
    createHelpOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'keyboardShortcutsHelp';
        overlay.className = 'keyboard-shortcuts-help';
        
        overlay.innerHTML = `
            <div class="help-content">
                <h2>⌨️ Keyboard Shortcuts</h2>
                <div class="shortcuts-grid">
                    <div class="shortcut-item">
                        <kbd>Space</kbd>
                        <span>Play / Pause Animation</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>R</kbd>
                        <span>Restart Current Preset</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>E</kbd>
                        <span>Export as JSON</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>S</kbd>
                        <span>Export as SVG</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>P</kbd>
                        <span>Export as PNG</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>1</kbd>
                        <span>Load Lotus Metamorphosis</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>2</kbd>
                        <span>Load Star Trails</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>3</kbd>
                        <span>Load Hypnotic Tunnel</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>4</kbd>
                        <span>Load Quantum Mandala</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>H</kbd> or <kbd>?</kbd>
                        <span>Show / Hide This Help</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Esc</kbd>
                        <span>Close This Help</span>
                    </div>
                </div>
                <p class="help-footer">Press <kbd>H</kbd> or <kbd>?</kbd> anytime to toggle this help</p>
            </div>
        `;
        
        // Close on click outside
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hideHelp();
            }
        });
        
        document.body.appendChild(overlay);
    }

    /**
     * Enable keyboard shortcuts
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable keyboard shortcuts
     */
    disable() {
        this.enabled = false;
    }
}
