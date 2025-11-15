// ImportExport.js
// Handles JSON import and export functionality for presets

export class ImportExport {
    constructor(stateManager, presetManager) {
        this.stateManager = stateManager;
        this.presetManager = presetManager;
        this.version = '1.0.0'; // Version for compatibility tracking
    }

    /**
     * Export current state to JSON
     * @param {string} filename - Optional filename (defaults to generated name)
     * @returns {object} Export data object
     */
    exportToJSON(filename = null) {
        const state = this.stateManager.getState();
        
        // Create export object with metadata
        const exportData = {
            version: this.version,
            timestamp: new Date().toISOString(),
            presetName: state.preset.current || 'Custom',
            state: state
        };
        
        return exportData;
    }

    /**
     * Generate downloadable JSON file
     * @param {string} filename - Optional custom filename
     */
    downloadJSON(filename = null) {
        const exportData = this.exportToJSON();
        
        // Generate filename if not provided
        if (!filename) {
            const presetName = exportData.presetName.replace(/\s+/g, '_');
            const timestamp = new Date().toISOString().split('T')[0];
            filename = `${presetName}_${timestamp}.json`;
        }
        
        // Ensure .json extension
        if (!filename.endsWith('.json')) {
            filename += '.json';
        }
        
        // Convert to JSON string with formatting
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Create blob and download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        console.log(`Exported preset to ${filename}`);
        return filename;
    }

    /**
     * Import state from JSON string
     * @param {string} jsonString - JSON string to parse
     * @returns {object} Result object with success status and message
     */
    importFromJSON(jsonString) {
        try {
            // Parse JSON
            const importData = JSON.parse(jsonString);
            
            // Validate structure
            const validation = this.validateImportData(importData);
            if (!validation.valid) {
                return {
                    success: false,
                    message: validation.message
                };
            }
            
            // Extract state
            const state = importData.state;
            
            // Apply imported state
            this.stateManager.setState(state);
            
            // If this was a named preset, save it to preset manager
            if (importData.presetName && importData.presetName !== 'Custom') {
                this.presetManager.savePreset(importData.presetName, state);
            }
            
            console.log('Successfully imported preset');
            return {
                success: true,
                message: 'Preset imported successfully',
                presetName: importData.presetName
            };
            
        } catch (error) {
            console.error('Error importing JSON:', error);
            return {
                success: false,
                message: `Import failed: ${error.message}`
            };
        }
    }

    /**
     * Import state from file
     * @param {File} file - File object to read
     * @returns {Promise<object>} Result object with success status
     */
    async importFromFile(file) {
        try {
            // Validate file type
            if (!file.name.endsWith('.json')) {
                return {
                    success: false,
                    message: 'Invalid file type. Please select a JSON file.'
                };
            }
            
            // Read file content
            const text = await this.readFileAsText(file);
            
            // Import from JSON string
            return this.importFromJSON(text);
            
        } catch (error) {
            console.error('Error reading file:', error);
            return {
                success: false,
                message: `File read failed: ${error.message}`
            };
        }
    }

    /**
     * Read file as text
     * @param {File} file - File to read
     * @returns {Promise<string>} File content as text
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            
            reader.onerror = (error) => {
                reject(error);
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Validate imported data structure
     * @param {object} data - Imported data to validate
     * @returns {object} Validation result with valid flag and message
     */
    validateImportData(data) {
        // Check for required top-level fields
        if (!data.version) {
            return {
                valid: false,
                message: 'Missing version field'
            };
        }
        
        if (!data.state) {
            return {
                valid: false,
                message: 'Missing state field'
            };
        }
        
        // Check for required state sections
        const requiredSections = ['canvas', 'shape', 'color', 'transform', 'animation'];
        for (const section of requiredSections) {
            if (!data.state[section]) {
                return {
                    valid: false,
                    message: `Missing required section: ${section}`
                };
            }
        }
        
        // Check animation properties
        const requiredAnimProps = ['scale', 'x', 'y', 'rotate'];
        for (const prop of requiredAnimProps) {
            if (!data.state.animation[prop]) {
                return {
                    valid: false,
                    message: `Missing animation property: ${prop}`
                };
            }
        }
        
        // Version compatibility check (for future use)
        if (data.version !== this.version) {
            console.warn(`Version mismatch: file is ${data.version}, current is ${this.version}`);
            // Still allow import, just warn
        }
        
        return {
            valid: true,
            message: 'Valid import data'
        };
    }

    /**
     * Export state as JSON string (for copying to clipboard)
     * @returns {string} JSON string
     */
    exportAsString() {
        const exportData = this.exportToJSON();
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Export current canvas as SVG
     * @param {HTMLCanvasElement} canvas - Canvas element to export
     * @param {string} filename - Optional custom filename
     */
    exportToSVG(canvas, filename = null) {
        if (!canvas) {
            console.error('Canvas element required for SVG export');
            return;
        }

        // Generate filename if not provided
        if (!filename) {
            const state = this.stateManager.getState();
            const presetName = state.preset.current || 'Custom';
            const timestamp = new Date().toISOString().split('T')[0];
            filename = `${presetName.replace(/\s+/g, '_')}_${timestamp}.svg`;
        }

        // Ensure .svg extension
        if (!filename.endsWith('.svg')) {
            filename += '.svg';
        }

        // Convert canvas to data URL
        const dataURL = canvas.toDataURL('image/png');
        
        // Create SVG with embedded image
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <image width="${canvas.width}" height="${canvas.height}" xlink:href="${dataURL}"/>
</svg>`;

        // Create blob and download
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        console.log(`Exported SVG to ${filename}`);
        return filename;
    }

    /**
     * Export current canvas as PNG
     * @param {HTMLCanvasElement} canvas - Canvas element to export
     * @param {string} filename - Optional custom filename
     */
    exportToPNG(canvas, filename = null) {
        if (!canvas) {
            console.error('Canvas element required for PNG export');
            return;
        }

        // Generate filename if not provided
        if (!filename) {
            const state = this.stateManager.getState();
            const presetName = state.preset.current || 'Custom';
            const timestamp = new Date().toISOString().split('T')[0];
            filename = `${presetName.replace(/\s+/g, '_')}_${timestamp}.png`;
        }

        // Ensure .png extension
        if (!filename.endsWith('.png')) {
            filename += '.png';
        }

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            URL.revokeObjectURL(url);
            
            console.log(`Exported PNG to ${filename}`);
        }, 'image/png');
        
        return filename;
    }
}
