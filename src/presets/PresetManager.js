// PresetManager.js
// Manages preset loading, saving, and tracking modification state

export class PresetManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.currentPresetState = null; // Stores the original preset state for restart
        this.presetLibrary = null; // Will be set externally
    }

    /**
     * Set the preset library reference
     * @param {object} library - PresetLibrary instance
     */
    setPresetLibrary(library) {
        this.presetLibrary = library;
    }

    /**
     * Load a preset by name
     * @param {string} presetName - Name of the preset to load
     * @returns {boolean} Success status
     */
    loadPreset(presetName) {
        if (!this.presetLibrary) {
            console.error('Preset library not initialized');
            return false;
        }

        const preset = this.presetLibrary.getPreset(presetName);
        if (!preset) {
            console.error(`Preset not found: ${presetName}`);
            return false;
        }

        try {
            // Store the original preset state for restart functionality
            this.currentPresetState = JSON.parse(JSON.stringify(preset.state));
            
            // Apply the preset state
            const stateToApply = {
                ...preset.state,
                preset: {
                    current: presetName,
                    modified: false
                }
            };
            
            this.stateManager.setState(stateToApply);
            
            console.log(`Loaded preset: ${presetName}`);
            return true;
        } catch (error) {
            console.error('Error loading preset:', error);
            return false;
        }
    }

    /**
     * Save current state as a preset
     * @param {string} name - Name for the preset
     * @param {object} state - Optional state to save (defaults to current state)
     * @returns {object} Preset object
     */
    savePreset(name, state = null) {
        const stateToSave = state || this.stateManager.getState();
        
        // Create preset object
        const preset = {
            name: name,
            description: `Custom preset: ${name}`,
            state: JSON.parse(JSON.stringify(stateToSave))
        };
        
        // Store as current preset state
        this.currentPresetState = JSON.parse(JSON.stringify(preset.state));
        
        // Update state to mark as current preset
        this.stateManager.setState({
            preset: {
                current: name,
                modified: false
            }
        });
        
        console.log(`Saved preset: ${name}`);
        return preset;
    }

    /**
     * Restart the current preset (reload original values)
     * @returns {boolean} Success status
     */
    restartPreset() {
        if (!this.currentPresetState) {
            console.warn('No preset to restart');
            return false;
        }

        try {
            const currentPresetName = this.stateManager.getState().preset.current;
            
            // Reload the original preset state
            const stateToApply = {
                ...JSON.parse(JSON.stringify(this.currentPresetState)),
                preset: {
                    current: currentPresetName,
                    modified: false
                }
            };
            
            this.stateManager.setState(stateToApply);
            
            console.log('Preset restarted');
            return true;
        } catch (error) {
            console.error('Error restarting preset:', error);
            return false;
        }
    }

    /**
     * Get the current preset name
     * @returns {string|null} Current preset name or null
     */
    getCurrentPresetName() {
        return this.stateManager.getState().preset.current;
    }

    /**
     * Check if current preset has been modified
     * @returns {boolean} True if modified
     */
    isModified() {
        return this.stateManager.getState().preset.modified;
    }

    /**
     * Clear current preset state
     */
    clearPreset() {
        this.currentPresetState = null;
        this.stateManager.setState({
            preset: {
                current: null,
                modified: false
            }
        });
    }
}
