// FileDropHandler.js
// Handles drag-and-drop file import for SVG and JSON files

export class FileDropHandler {
    constructor(canvas, stateManager, svgParser) {
        this.canvas = canvas;
        this.stateManager = stateManager;
        this.svgParser = svgParser;
        this.importExport = null; // Will be set externally
        this.isDragging = false;
        
        this.initializeDropZone();
        this.bindEventListeners();
    }

    /**
     * Set import/export handler reference
     */
    setImportExport(importExport) {
        this.importExport = importExport;
    }

    /**
     * Initialize the drop zone overlay
     */
    initializeDropZone() {
        // Create drop zone overlay
        this.dropZone = document.createElement('div');
        this.dropZone.className = 'drop-zone-overlay';
        this.dropZone.innerHTML = `
            <div class="drop-zone-content">
                <div class="drop-zone-icon">📁</div>
                <div class="drop-zone-text">Drop SVG or JSON file here</div>
            </div>
        `;
        this.dropZone.style.display = 'none';
        
        // Add to canvas container
        const canvasContainer = this.canvas.parentElement;
        if (canvasContainer) {
            canvasContainer.style.position = 'relative';
            canvasContainer.appendChild(this.dropZone);
        }
    }

    /**
     * Bind event listeners for drag and drop
     */
    bindEventListeners() {
        // Prevent default drag behaviors on the entire document
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.body.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        // Canvas drag events
        this.canvas.addEventListener('dragenter', (e) => this.onDragEnter(e));
        this.canvas.addEventListener('dragover', (e) => this.onDragOver(e));
        this.canvas.addEventListener('dragleave', (e) => this.onDragLeave(e));
        this.canvas.addEventListener('drop', (e) => this.onDrop(e));
    }

    /**
     * Handle drag enter event
     */
    onDragEnter(event) {
        event.preventDefault();
        this.isDragging = true;
        this.showDropZone();
    }

    /**
     * Handle drag over event
     */
    onDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }

    /**
     * Handle drag leave event
     */
    onDragLeave(event) {
        event.preventDefault();
        
        // Only hide if leaving the canvas entirely
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX;
        const y = event.clientY;
        
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            this.isDragging = false;
            this.hideDropZone();
        }
    }

    /**
     * Handle drop event
     */
    async onDrop(event) {
        event.preventDefault();
        this.isDragging = false;
        this.hideDropZone();
        
        const files = event.dataTransfer.files;
        
        if (files.length === 0) {
            console.warn('No files dropped');
            return;
        }
        
        // Process the first file
        const file = files[0];
        await this.processFile(file);
    }

    /**
     * Process a dropped file
     * @param {File} file - The dropped file
     */
    async processFile(file) {
        const fileName = file.name.toLowerCase();
        
        try {
            if (fileName.endsWith('.svg')) {
                await this.processSVGFile(file);
            } else if (fileName.endsWith('.json')) {
                await this.processJSONFile(file);
            } else {
                this.showError('Unsupported file type. Please drop an SVG or JSON file.');
            }
        } catch (error) {
            console.error('File processing error:', error);
            this.showError(`Failed to process file: ${error.message}`);
        }
    }

    /**
     * Process an SVG file
     * @param {File} file - SVG file
     */
    async processSVGFile(file) {
        try {
            this.showMessage('Loading SVG...');
            
            const parsedSVG = await this.svgParser.parseSVGFile(file);
            
            if (!parsedSVG) {
                throw new Error('Failed to parse SVG file');
            }
            
            // Update state with custom SVG
            this.stateManager.setState({
                shape: {
                    type: 'custom',
                    customSVG: parsedSVG
                }
            });
            
            this.showSuccess('SVG loaded successfully!');
            
        } catch (error) {
            throw new Error(`SVG parsing failed: ${error.message}`);
        }
    }

    /**
     * Process a JSON preset file
     * @param {File} file - JSON file
     */
    async processJSONFile(file) {
        try {
            this.showMessage('Loading preset...');
            
            if (this.importExport) {
                // Use ImportExport module for proper validation and import
                const result = await this.importExport.importFromFile(file);
                
                if (result.success) {
                    this.showSuccess('Preset loaded successfully!');
                } else {
                    throw new Error(result.message);
                }
            } else {
                // Fallback to basic import if ImportExport not available
                const reader = new FileReader();
                
                return new Promise((resolve, reject) => {
                    reader.onload = (e) => {
                        try {
                            const jsonString = e.target.result;
                            const presetData = JSON.parse(jsonString);
                            
                            // Basic validation
                            if (!this.validatePresetData(presetData)) {
                                throw new Error('Invalid preset format');
                            }
                            
                            // Load the preset state
                            if (presetData.state) {
                                this.stateManager.setState(presetData.state);
                            } else {
                                this.stateManager.setState(presetData);
                            }
                            
                            this.showSuccess('Preset loaded successfully!');
                            resolve();
                            
                        } catch (error) {
                            reject(new Error(`JSON parsing failed: ${error.message}`));
                        }
                    };
                    
                    reader.onerror = () => {
                        reject(new Error('Failed to read JSON file'));
                    };
                    
                    reader.readAsText(file);
                });
            }
            
        } catch (error) {
            throw new Error(`JSON import failed: ${error.message}`);
        }
    }

    /**
     * Validate preset data structure (basic validation)
     * @param {object} data - Preset data to validate
     * @returns {boolean} True if valid
     */
    validatePresetData(data) {
        // Check if it's a wrapped preset with state property
        const stateData = data.state || data;
        
        // Check for required top-level properties
        const requiredProps = ['canvas', 'shape', 'color', 'transform', 'animation'];
        
        for (const prop of requiredProps) {
            if (!stateData.hasOwnProperty(prop)) {
                console.warn(`Missing required property: ${prop}`);
                return false;
            }
        }
        
        return true;
    }

    /**
     * Show the drop zone overlay
     */
    showDropZone() {
        if (this.dropZone) {
            this.dropZone.style.display = 'flex';
        }
    }

    /**
     * Hide the drop zone overlay
     */
    hideDropZone() {
        if (this.dropZone) {
            this.dropZone.style.display = 'none';
        }
    }

    /**
     * Show a message to the user
     * @param {string} message - Message text
     */
    showMessage(message) {
        console.log(message);
        // Could implement a toast notification system here
    }

    /**
     * Show a success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        console.log('✓', message);
        // Could implement a toast notification system here
    }

    /**
     * Show an error message
     * @param {string} message - Error message
     */
    showError(message) {
        console.error('✗', message);
        alert(message); // Simple alert for now
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        if (this.dropZone && this.dropZone.parentElement) {
            this.dropZone.parentElement.removeChild(this.dropZone);
        }
    }
}
